const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getProductReviews,
  createOrUpdateReview,
  deleteReview,
  deleteAllReviewsForProduct,
  deleteOwnReview
} = require('../controllers/reviewController');

router.post('/', protect, createOrUpdateReview);
router.get('/product/:productId', getProductReviews);



//  Admin
router.delete('/:id', protect, authorize('admin'), deleteReview); // un seul avis
router.delete('/product/:productId', protect, authorize('admin'), deleteAllReviewsForProduct); // tous les avis

//  Utilisateur
router.delete('/me/:productId', protect, deleteOwnReview);


module.exports = router;
