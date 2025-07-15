const Order = require('../models/Order');
const Cart = require('../models/Cart');
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const EmailService = require('../services/emailService');

// @desc    Créer une commande
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingInfo, paymentMethod } = req.body;

  // Récupérer le panier
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Aucun article dans le panier');
  }

  // Préparer les articles de la commande
  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    image: item.product.images[0]?.url || ''
  }));

  // Calculer les prix
  const itemsPrice = cart.total;
  const taxPrice = itemsPrice * 0.2; // 20% de TVA
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Frais de port gratuits >100dt
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Créer la commande
  const order = await Order.create({
    user: req.user.id,
    orderItems,
    shippingInfo,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  // Mettre à jour le stock
  await Promise.all(
    cart.items.map(async item => {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    })
  );

  // Vider le panier
  await Cart.findByIdAndDelete(cart._id);

  // Envoyer l'email de confirmation
  try {
    await EmailService.sendOrderConfirmation(order, req.user);
  } catch (error) {
    console.error('Échec d\'envoi d\'email:', error);
    // Ne pas bloquer la réponse si l'email échoue
  }

  // Réponse
  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Récupérer les commandes de l'utilisateur
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id });
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Obtenir une commande par ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Ressource non trouvée'
    });
  }
  // Vérifiez si l'utilisateur a le droit de voir cette commande
  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Non autorisé'
    });
  }
  res.status(200).json({
    success: true,
    order
  });
});

// @desc    Mettre à jour une commande
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Commande non trouvée'
    });
  }

  // Mise à jour des champs
  if (req.body.isPaid !== undefined) {
    order.isPaid = req.body.isPaid;
    order.paidAt = req.body.paidAt || Date.now();
  }

  if (req.body.isDelivered !== undefined) {
    order.isDelivered = req.body.isDelivered;
    order.deliveredAt = req.body.deliveredAt || Date.now();
  }

  if (req.body.status !== undefined) {
    order.status = req.body.status;
  }

  const updatedOrder = await order.save();
  res.status(200).json({
    success: true,
    order: updatedOrder
  });
});

// @desc    Supprimer une commande
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Commande non trouvée'
    });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Récupérer toutes les commandes (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};

  // Filtrage par statut
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Récupération des commandes peuplées
  let orders = await Order.find(filter)
    .populate('user', 'name email avatar')
    .sort('-createdAt');

  // Recherche côté JS si search présent
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    orders = orders.filter(order =>
      order._id.toString().toLowerCase().includes(search) ||
      (order.user?.name && order.user.name.toLowerCase().includes(search)) ||
      (order.user?.email && order.user.email.toLowerCase().includes(search))
    );
  }

  // Pagination JS après filtrage
  const total = orders.length;
  const paginatedOrders = orders.slice(skip, skip + limit);

  res.status(200).json({
    success: true,
    count: paginatedOrders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: paginatedOrders
  });
});

// Endpoint: GET /api/orders/stats/sales
exports.getSalesStats = asyncHandler(async (req, res) => {
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
    const orders = await Order.find({ createdAt: { $gte: start, $lt: end } });
    const totalSales = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return {
      label,
      count: orders.length,
      total: totalSales
    };
  }));
  res.json({ success: true, data: stats });
});

// Endpoint: GET /api/orders/latest
exports.getLatestOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(5);
  res.json({ success: true, data: orders });
});
