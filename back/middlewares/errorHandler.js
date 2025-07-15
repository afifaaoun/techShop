const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le dev
  console.log(err.stack.red);

  // Erreur Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new Error(`Ressource non trouvée`);
    error.statusCode = 404;
  }

  // Erreur Mongoose validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur'
  });
};

module.exports = errorHandler;
