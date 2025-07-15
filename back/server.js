const app = require('./app');
const mongoose = require('mongoose');
const config = require('./config/env');

// Connexion MongoDB
mongoose.connect(config.DB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur MongoDB:', err));

// Démarrer le serveur
const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours sur le port ${PORT}`);
});
