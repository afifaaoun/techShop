const { check, validationResult } = require('express-validator');

exports.validateCart = [
  check('productId', 'ID produit invalide').isMongoId(),
  check('quantity', 'Quantité doit être un nombre supérieur à 0').isInt({ min: 1 })
];

exports.validateOrder = [
  check('shippingInfo.address', 'Adresse requise').notEmpty(),
  check('shippingInfo.city', 'Ville requise').notEmpty(),
  check('shippingInfo.postalCode', 'Code postal requis').notEmpty(),
  check('shippingInfo.country', 'Pays requis').notEmpty(),
  check('shippingInfo.phone', 'Téléphone requis').notEmpty(),
  check('paymentMethod', 'Méthode de paiement invalide').isIn(['card', 'paypal'])
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};
exports.validateSignup = [
  check('name', 'Le nom est requis').notEmpty(),
  check('email', 'Email invalide').isEmail(),
  check('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 })
];
