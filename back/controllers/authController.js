const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const config = require('../config/env');
const { generateToken } = require('../utils/generateToken'); 
const bcrypt = require('bcryptjs');
const Order = require('../models/Order');
const crypto = require('crypto');
const EmailService = require('../services/emailService');

// @desc    Authentifier un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('Tentative de connexion pour l\'utilisateur:', email);

  // Vérifier que l'email et le mot de passe sont fournis
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
  }

  // Vérifier email et mot de passe
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }

  // Mettre à jour la date de dernière connexion
  user.lastLogin = new Date();
  await user.save();

  // Créer token
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });

  // Options cookie
  const options = {
    expires: new Date(Date.now() + config.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Utiliser secure si en production
    sameSite: 'Strict' // Ajoutez cette option pour renforcer la sécurité
  };

  res.status(200)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
});

// @desc    Inscription utilisateur
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà' });
  }

  // 2. Créer le nouvel utilisateur
  const user = await User.create({
    name,
    email,
    password, 
    role: role || 'user'
  });

  // 3. Générer le token de vérification d'email
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // 4. Créer l'URL de vérification
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  // 5. Envoyer l'email de vérification
  try {
    console.log('Tentative d\'envoi d\'email de vérification à:', user.email);
    console.log('URL de vérification:', verificationUrl);
    
    await EmailService.sendEmailVerification(user.email, verificationUrl, user.name);
    
    console.log('Email de vérification envoyé avec succès à:', user.email);
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi de l\'email de vérification:', error);
    
    // Supprimer l'utilisateur si l'email ne peut pas être envoyé
    await User.findByIdAndDelete(user._id);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi de l\'email de vérification. Veuillez réessayer.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // 6. Envoyer la réponse
  res.status(201).json({
    success: true,
    message: 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified
    }
  });
});

// @desc    Vérifier l'email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    // Vérifier si l'utilisateur existe mais avec un email déjà vérifié
    const userWithoutToken = await User.findOne({
      emailVerificationToken: hashedToken
    });

    if (userWithoutToken && userWithoutToken.emailVerified) {
      return res.status(200).json({ 
        success: true, 
        message: 'Email déjà vérifié ! Vous pouvez vous connecter.' 
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: 'Lien de vérification invalide ou expiré' 
    });
  }

  // Marquer l'email comme vérifié
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.status(200).json({ 
    success: true, 
    message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' 
  });
});

// @desc    Renvoyer l'email de vérification
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'Aucun utilisateur trouvé avec cet email' 
    });
  }

  if (user.emailVerified) {
    return res.status(400).json({ 
      success: false, 
      message: 'Cet email est déjà vérifié' 
    });
  }

  // Générer un nouveau token de vérification
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Créer l'URL de vérification
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  // Envoyer l'email de vérification
  try {
    await EmailService.sendEmailVerification(user.email, verificationUrl, user.name);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.' 
    });
  }

  res.status(200).json({ 
    success: true, 
    message: 'Email de vérification renvoyé avec succès' 
  });
});

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const updates = {};

  if (req.body.name) updates.name = req.body.name;
  if (req.body.avatar) updates.avatar = req.body.avatar;
  if (req.body.password) {
    updates.password = await bcrypt.hash(req.body.password, 10);
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
});

// @desc    Envoi d'un email de réinitialisation
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ success: false, error: 'Aucun compte avec cet email' });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`; 

  await EmailService.sendPasswordReset(user.email, resetUrl);

  res.status(200).json({ success: true, message: 'Email envoyé avec succès' });
});

// @desc    Réinitialiser le mot de passe via token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Token invalide ou expiré' });
  }

  user.password = req.body.password; 
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Mot de passe mis à jour avec succès' });
});

// @desc    Supprimer un utilisateur (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  // Vérifications
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Impossible de supprimer un admin');
  }

  // Suppression
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ 
    success: true,
    message: `Utilisateur ${user.email} supprimé`,
    deletedUserId: user._id 
  });
});

// @desc    Supprimer son compte
// @route   DELETE /api/users/me
// @access  Private
exports.deleteMyAccount = asyncHandler(async (req, res) => {
 if (!req.user) {
       return res.status(401).json({ success: false, error: 'Utilisateur non authentifié' });
     }
     const user = await User.findById(req.user.id);
     if (!user) {
       return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
     }
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Vérifiez s'il y a des commandes associées
  const userOrders = await Order.find({ user: req.user.id });

  // Si l'utilisateur a des commandes, vous pouvez choisir de les supprimer ou de renvoyer un message
  if (userOrders.length > 0) {
    // Option 1: Supprimer les commandes
    await Order.deleteMany({ user: req.user.id });
    console.log(`Commandes de l'utilisateur ${user.email} supprimées.`);
  } else {
    console.log(`Aucune commande à supprimer pour l'utilisateur ${user.email}.`);
  }

  // Suppression de l'utilisateur
  await User.findByIdAndDelete(req.user.id);
  res.status(200).json({ 
    success: true,
    message: 'Votre compte a été supprimé'
  });
});
// @desc    Récupérer tous les utilisateurs (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password'); 
  console.log("users",users);
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

