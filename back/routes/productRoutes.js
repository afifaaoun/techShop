const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  searchProducts,
  getTopProducts,
  getCategories
} = require('../controllers/productController'); 

const { protect, authorize } = require('../middlewares/auth'); 
const upload = require('../config/multer');

// Route de recherche 
router.get('/search', searchProducts);

// Routes pour les produits
router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

// Route pour upload d'images
router.post('/:id/images', protect, authorize('admin'), upload.array('images', 5), uploadProductImages);

router.get('/top', protect, authorize('admin'), getTopProducts);

router.get('/categories', getCategories);

router.route('/:id')
  .get(getProduct) 
  .put(protect, authorize('admin'), updateProduct) 
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
