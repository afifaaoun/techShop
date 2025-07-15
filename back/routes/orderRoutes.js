const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { validateOrder } = require('../middlewares/validate');
const { getMyOrders, createOrder, getOrder, updateOrder, deleteOrder, getAllOrders, getSalesStats, getLatestOrders } = require('../controllers/orderController');

// Middleware de protection pour toutes les routes
router.use(protect);

// Route pour récupérer toutes les commandes (Admin seulement)
router.get('/', authorize('admin'), getAllOrders);
router.get('/stats/sales', authorize('admin'), getSalesStats);
router.get('/latest', authorize('admin'), getLatestOrders);

// Route pour créer une commande
router.route('/').post(validateOrder, createOrder);

// Route pour obtenir les commandes de l'utilisateur
router.route('/my-orders').get(getMyOrders);

// Route pour obtenir une commande par ID
router.route('/:id')
  .get(getOrder)
  .put( authorize('admin'), updateOrder)
  .patch( authorize('admin'), updateOrder)
  .delete( authorize('admin'), deleteOrder);

module.exports = router;

