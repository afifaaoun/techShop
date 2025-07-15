const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Récupérer le panier
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    console.log('❌ Utilisateur non authentifié pour getCart');
    return res.status(401).json({
      success: false,
      message: "Authentification requise"
    });
  }

  console.log('📦 Récupération du panier pour l\'utilisateur:', req.user.id);
  
  const cart = await Cart.findOne({ user: req.user.id }).populate({
    path: 'items.product',
    select: 'name price images stock'
  });

  if (!cart) {
    console.log('📦 Aucun panier trouvé pour l\'utilisateur');
    return res.status(200).json({
      success: true,
      data: { items: [], total: 0, count: 0 }
    });
  }

  console.log('📦 Panier trouvé avec', cart.items.length, 'items, total:', cart.total, 'count:', cart.count);

  // Ici on peut simplement renvoyer total et count car calculés automatiquement avant sauvegarde
  res.status(200).json({
    success: true,
    data: {
      items: cart.items,
      total: cart.total,
      count: cart.count
    }
  });
});

// @desc    Ajouter un produit au panier
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentification requise" });
  }

  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [{ product: productId, quantity, price: product.price }]
    });
  } else {
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId.toString()
    );

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save(); // le pre-save va recalculer total et count
  }

  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price images stock'
  });

  res.status(200).json({
    success: true,
    data: {
      items: populatedCart.items,
      total: populatedCart.total,
      count: populatedCart.count
    }
  });
});

// @desc    Fusionner panier invité avec panier utilisateur connecté
// @route   POST /api/cart/merge
// @access  Private
exports.mergeCart = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentification requise" });
  }

  const userId = req.user.id;
  const guestItems = req.body.items || [];

  console.log('🔄 Fusion du panier - User ID:', userId);
  console.log('🛒 Items guest à fusionner:', guestItems.length);

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    console.log('📦 Création d\'un nouveau panier pour l\'utilisateur');
    cart = new Cart({ user: userId, items: [] });
  } else {
    console.log('📦 Panier existant trouvé, items actuels:', cart.items.length);
  }

  // Vérifier que tous les produits existent
  for (const guestItem of guestItems) {
    const product = await Product.findById(guestItem.product._id);
    if (!product) {
      console.log('❌ Produit non trouvé:', guestItem.product._id);
      continue; // Ignorer ce produit
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === guestItem.product._id.toString()
    );

    if (existingItemIndex !== -1) {
      console.log('📈 Mise à jour quantité pour le produit:', product.name);
      cart.items[existingItemIndex].quantity += guestItem.quantity;
      cart.items[existingItemIndex].price = product.price; // Mettre à jour le prix
    } else {
      console.log('🆕 Ajout du produit:', product.name);
      cart.items.push({
        product: guestItem.product._id,
        quantity: guestItem.quantity,
        price: product.price, // Utiliser le prix du serveur
      });
    }
  }

  console.log('💾 Sauvegarde du panier avec', cart.items.length, 'items');
  await cart.save(); // recalcul automatique

  const populatedCart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price images stock',
  });

  console.log('✅ Panier fusionné avec succès:', {
    items: populatedCart.items.length,
    total: populatedCart.total,
    count: populatedCart.count
  });

  res.status(200).json({
    success: true,
    data: {
      items: populatedCart.items,
      total: populatedCart.total,
      count: populatedCart.count,
    },
  });
});

// @desc    Debug - Vérifier l'état du panier en base
// @route   GET /api/cart/debug
// @access  Private
exports.debugCart = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentification requise" });
  }

  const userId = req.user.id;
  console.log('🔍 Debug panier pour l\'utilisateur:', userId);

  const cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    console.log('🔍 Aucun panier en base pour l\'utilisateur');
    return res.status(200).json({
      success: true,
      debug: {
        userId,
        cartExists: false,
        items: [],
        total: 0,
        count: 0
      }
    });
  }

  console.log('🔍 Panier en base:', {
    userId: cart.user,
    itemsCount: cart.items.length,
    total: cart.total,
    count: cart.count,
    items: cart.items.map(item => ({
      productId: item.product,
      quantity: item.quantity,
      price: item.price
    }))
  });

  res.status(200).json({
    success: true,
    debug: {
      userId,
      cartExists: true,
      items: cart.items,
      total: cart.total,
      count: cart.count
    }
  });
});

// @desc    Supprimer un produit du panier
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentification requise" });
  }

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    res.status(404);
    throw new Error('Panier non trouvé');
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== req.params.productId
  );

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price images stock'
  });

  res.status(200).json({
    success: true,
    data: {
      items: populatedCart.items,
      total: populatedCart.total,
      count: populatedCart.count
    }
  });
});

// @desc    Mettre à jour la quantité d'un produit dans le panier
// @route   PATCH /api/cart/:productId
// @access  Private
exports.updateQuantity = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentification requise" });
  }

  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('La quantité doit être supérieure à 0');
  }

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    res.status(404);
    throw new Error('Panier non trouvé');
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Produit non trouvé dans le panier');
  }

  // Vérifier le stock disponible
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

  if (quantity > product.stock) {
    res.status(400);
    throw new Error(`Stock insuffisant. Disponible: ${product.stock}`);
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price images stock'
  });

  res.status(200).json({
    success: true,
    data: {
      items: populatedCart.items,
      total: populatedCart.total,
      count: populatedCart.count
    }
  });
});
