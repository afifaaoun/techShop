const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Récupérer tous les produits
// @route   GET /api/products
// @access  Public
// controllers/productController.js
exports.getProducts = asyncHandler(async (req, res) => {
  const filter = {};

  // Filtrage par catégorie
  if (req.query.category) {
    filter.category = req.query.category.toLowerCase();
  }

  // Recherche par nom ou description
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  // Tri
  let query = Product.find(filter).skip(skip).limit(limit);
  if (req.query.sort) {
    query = query.sort(req.query.sort);
  } else {
    // Tri par défaut : plus récents en premier
    query = query.sort('-createdAt');
  }

  // Exécuter la requête
  const products = await query;

  // Total produits correspondant au filtre
  const total = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: products,
  });
});

// @desc    Récupérer un produit
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Créer un produit
// @route   POST /api/products
// @access  Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Rechercher des produits
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Requête de recherche vide' 
    });
  }

  const searchTerm = q.trim();
  const regex = new RegExp(searchTerm, 'i'); // insensible à la casse

  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $regex: regex } }
      ]
    })
    .select('name price images category discount stock rating')
    .limit(8) // Limite à 8 suggestions pour l'interface
    .sort({ rating: -1, name: 1 }); // Tri par note puis par nom

    console.log(`🔍 Recherche pour "${searchTerm}" : ${products.length} résultats`);

    res.status(200).json({ 
      success: true, 
      data: products,
      count: products.length,
      searchTerm: searchTerm
    });
  } catch (err) {
    console.error('❌ Erreur recherche produits:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la recherche' 
    });
  }
});

// @desc    Mettre à jour un produit
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }
  res.status(200).json({
    success: true,
    data: product
  });
});

exports.uploadProductImages = asyncHandler(async (req, res) => {
  const uploadPromises = req.files.map(file => 
    cloudinary.uploader.upload(file.path)
  );
  const results = await Promise.all(uploadPromises);
  const images = results.map(result => result.secure_url);

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $push: { images: { $each: images } } },
    { new: true }
  );

  res.status(200).json({ success: true, data: product });
});

// @desc    Supprimer un produit
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }
  res.status(200).json({
    success: true,
    data: {}
  });
});

// Endpoint: GET /api/products/top
exports.getTopProducts = asyncHandler(async (req, res) => {
  // On suppose que chaque commande a orderItems: [{ product, quantity }]
  const Order = require('../models/Order');
  const products = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $group: {
      _id: '$orderItems.product',
      totalSold: { $sum: '$orderItems.quantity' }
    }},
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    { $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: '_id',
      as: 'product'
    }},
    { $unwind: '$product' },
    { $project: {
      _id: 1,
      totalSold: 1,
      name: '$product.name',
      price: '$product.price',
      image: { $arrayElemAt: ['$product.images.url', 0] }
    }}
  ]);
  res.json({ success: true, data: products });
});

// Ajout : Endpoint pour retourner la liste des catégories avec métadonnées
exports.getCategories = (req, res) => {
  // Définir les catégories directement (en cohérence avec le modèle)
  const categories = ['smartphones', 'laptops', 'accessories', 'smartwatches', 'tablets', 'cameras'];
  
  // Importer les métadonnées depuis le fichier de configuration
  const categoryMetadata = require('../config/categories');

  // Construire la réponse avec les métadonnées
  const categoriesWithMetadata = categories.map(category => ({
    key: category,
    ...categoryMetadata[category]
  }));

  res.json({ 
    categories: categoriesWithMetadata,
    metadata: categoryMetadata
  });
};




