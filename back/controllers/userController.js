const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Récupérer tous les utilisateurs (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const filter = {};

  // Recherche par nom ou email
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ];
  }

  // Filtrage par rôle
  if (req.query.role) {
    filter.role = req.query.role;
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Tri par défaut : plus récents en premier
  const users = await User.find(filter)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort('-createdAt');

  // Total utilisateurs correspondant au filtre
  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users
  });
});

// @desc    Ajouter un produit aux favoris
// @route   POST /api/users/favorites/:productId
// @access  Private
exports.addToFavorites = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  // Vérifier si le produit existe
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

  // Vérifier si le produit est déjà dans les favoris
  const user = await User.findById(userId);
  if (user.favorites.includes(productId)) {
    res.status(400);
    throw new Error('Produit déjà dans les favoris');
  }

  // Ajouter aux favoris
  user.favorites.push(productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Produit ajouté aux favoris',
    data: user.favorites
  });
});

// @desc    Retirer un produit des favoris
// @route   DELETE /api/users/favorites/:productId
// @access  Private
exports.removeFromFavorites = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user.favorites.includes(productId)) {
    res.status(400);
    throw new Error('Produit non trouvé dans les favoris');
  }

  // Retirer des favoris
  user.favorites = user.favorites.filter(id => id.toString() !== productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Produit retiré des favoris',
    data: user.favorites
  });
});

// @desc    Obtenir les favoris de l'utilisateur
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).populate('favorites');
  
  res.status(200).json({
    success: true,
    count: user.favorites.length,
    data: user.favorites
  });
});

// @desc    Vérifier si un produit est dans les favoris
// @route   GET /api/users/favorites/:productId
// @access  Private
exports.checkFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);
  const isFavorite = user.favorites.includes(productId);

  res.status(200).json({
    success: true,
    isFavorite
  });
});

// @desc    Obtenir un utilisateur par ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour un utilisateur (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Supprimer un utilisateur (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Supprimer tous les avis de l'utilisateur
  await Review.deleteMany({ user: user._id });
  // Supprimer toutes les commandes de l'utilisateur
  await Order.deleteMany({ user: user._id });
  // Supprimer les favoris (si stockés dans un champ ou une collection)
  // Ici, on suppose que les favoris sont dans le champ 'favorites' du user, donc plus rien à faire

  res.status(200).json({
    success: true,
    data: {}
  });
}); 

exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Statut mis à jour', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}; 

// Endpoint: GET /api/users/stats/registrations
exports.getUserStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' })
    });
  }
  const stats = await Promise.all(months.map(async ({ year, month, label }) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const count = await User.countDocuments({ createdAt: { $gte: start, $lt: end } });
    return {
      label,
      count
    };
  }));
  res.json({ success: true, data: stats });
}); 

// Endpoint: GET /api/users/latest
exports.getLatestUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt').limit(5);
  res.json({ success: true, data: users });
}); 