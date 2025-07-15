const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', promotionController.getPromotions);
router.post('/', protect, authorize('admin'), promotionController.createPromotion);
router.put('/:id', protect, authorize('admin'), promotionController.updatePromotion);
router.delete('/:id', protect, authorize('admin'), promotionController.deletePromotion);

module.exports = router; 