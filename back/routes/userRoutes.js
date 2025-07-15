const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUserStats,
  getLatestUsers
} = require('../controllers/userController');

// Route pour récupérer tous les utilisateurs (Admin seulement)
router.get('/', protect, authorize('admin'), getAllUsers);

// Routes pour les favoris (DOIVENT être AVANT /:id)
router.post('/favorites/:productId', protect, addToFavorites);
router.delete('/favorites/:productId', protect, removeFromFavorites);
router.get('/favorites', protect, getFavorites);
router.get('/favorites/:productId', protect, checkFavorite);

// Routes pour la gestion des utilisateurs (Admin seulement)
router.get('/stats/registrations', protect, authorize('admin'), getUserStats);
router.get('/latest', protect, authorize('admin'), getLatestUsers);
router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.patch('/:id', protect, authorize('admin'), updateUserStatus);

module.exports = router; 