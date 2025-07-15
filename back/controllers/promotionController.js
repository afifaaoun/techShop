const Promotion = require('../models/Promotion');
const asyncHandler = require('express-async-handler');

// GET /api/promotions
exports.getPromotions = asyncHandler(async (req, res) => {
  const promotions = await Promotion.find({ active: true }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: promotions });
});

// POST /api/promotions
exports.createPromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.create(req.body);
  res.status(201).json({ success: true, data: promotion });
});

// PUT /api/promotions/:id
exports.updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!promotion) {
    return res.status(404).json({ success: false, message: 'Promotion non trouvée' });
  }
  res.status(200).json({ success: true, data: promotion });
});

// DELETE /api/promotions/:id
exports.deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findByIdAndDelete(req.params.id);
  if (!promotion) {
    return res.status(404).json({ success: false, message: 'Promotion non trouvée' });
  }
  res.status(200).json({ success: true, data: {} });
}); 