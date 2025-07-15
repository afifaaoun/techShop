// utils/fileUtils.js pour la supprission des images de produits
const fs = require('fs').promises;
exports.cleanTempFiles = async (files) => {
  await Promise.all(
    files.map(file => 
      fs.unlink(file.path).catch(e => console.error(`Erreur suppression ${file.path}:`, e))
    )
  );
};