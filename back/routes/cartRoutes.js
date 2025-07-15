const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { validateCart, validate } = require('../middlewares/validate');
const { getCart, addToCart, removeFromCart, updateQuantity, mergeCart, debugCart } = require('../controllers/cartController');


// GET panier : besoin d'auth pour les utilisateurs connectés
router.get('/', protect, getCart);

// POST merge : besoin d'auth pour fusion panier invité + user
router.post('/merge', protect, mergeCart);

// POST ajout panier : besoin d'auth
router.post('/', protect, validateCart, validate, addToCart);

// PATCH mise à jour quantité : besoin d'auth
router.patch('/:productId', protect, updateQuantity);

// DELETE article panier : besoin d'auth
router.delete('/:productId', protect, removeFromCart);

// GET debug panier : besoin d'auth (développement uniquement)
router.get('/debug', protect, debugCart);

module.exports = router;
