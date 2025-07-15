const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product'); // Ajoute ça en haut si pas encore fait


// controllers/reviewController.js

// Fonction utilitaire pour mettre à jour la note et le nombre d'avis d'un produit
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating = numReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews)
    : 0;
  await Product.findByIdAndUpdate(productId, {
    rating,
    numReviews
  });
}

exports.createOrUpdateReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  const existingReview = await Review.findOne({
    product: productId,
    user: req.user.id,
  });

  if (existingReview) {
    // Met à jour l'avis existant
    existingReview.rating = rating;
    existingReview.comment = comment;
    await existingReview.save();
    await updateProductRating(productId);
    return res.status(200).json({
      success: true,
      message: 'Avis mis à jour',
      data: existingReview,
    });
  }

  // Sinon crée un nouvel avis
  const newReview = await Review.create({
    product: productId,
    user: req.user.id,
    rating,
    comment,
  });
  await updateProductRating(productId);
  res.status(201).json({
    success: true,
    message: 'Avis créé',
    data: newReview,
  });
});

exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});



// Supprimer un seul avis (admin)
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (review) {
    await updateProductRating(review.product);
  }
  res.status(200).json({ success: true, message: 'Avis supprimé' });
});

// Supprimer tous les avis pour un produit (admin)
exports.deleteAllReviewsForProduct = asyncHandler(async (req, res) => {
  await Review.deleteMany({ product: req.params.productId });
  await updateProductRating(req.params.productId);
  res.status(200).json({ success: true, message: 'Tous les avis supprimés pour ce produit' });
});

// Supprimer son propre avis (utilisateur)
exports.deleteOwnReview = asyncHandler(async (req, res) => {
  const deleted = await Review.findOneAndDelete({
    product: req.params.productId,
    user: req.user.id,
  });

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Avis non trouvé' });
  }
  await updateProductRating(req.params.productId);
  res.status(200).json({ success: true, message: 'Votre avis a été supprimé' });
});
