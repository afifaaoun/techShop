const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  image: String,
  color: String,
  endDate: Date,
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema); 