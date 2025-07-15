const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    maxLength: [100, 'Le nom ne peut dépasser 100 caractères']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: [0, 'Le prix ne peut être négatif']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'La remise ne peut être négative'],
    max: [100, 'La remise ne peut dépasser 100%']
  },
  oldPrice: {
    type: Number,
    min: [0, 'Le prix ne peut être négatif']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: {
      values: ['smartphones', 'laptops', 'accessories', 'smartwatches', 'tablets', 'cameras'],
      message: 'Catégorie non valide'
    }
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  images: [
    {
      public_id: String,
      url: String
    }
  ],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour automatiquement updatedAt
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

productSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Product', productSchema);
