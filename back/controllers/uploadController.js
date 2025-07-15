const fs = require('fs').promises; // Utilisation de fs.promises pour des opérations asynchrones
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const Product = require('../models/Product');
const { cleanTempFiles } = require('../utils/fileUtils');

// Upload d'avatar utilisateur
exports.uploadUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "Aucun fichier téléchargé" });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars',
      width: 500,
      height: 500,
      crop: 'fill'
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    // Suppression du fichier temporaire
    await fs.unlink(req.file.path);

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    // Nettoyage en cas d'erreur
    await fs.unlink(req.file.path).catch(err => console.error("Erreur lors de la suppression de l'avatar temporaire:", err));
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de l'upload", 
      details: error.message 
    });
  }
});

exports.uploadProductImages = asyncHandler(async (req, res) => {
  try {
    if (!req.files?.length) throw new Error("Aucun fichier uploadé");

    // 1. Récupérer le produit existant
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new Error("Produit introuvable");
    }

    // 2. Suppression des anciennes images de Cloudinary
    if (product.images?.length) {
      await Promise.all(
        product.images.map(image => 
          cloudinary.uploader.destroy(image.public_id)
            .catch(err => console.error(`Échec suppression image ${image.public_id}:`, err))
        )
      );
    }

    // 3. Upload des nouvelles images vers Cloudinary
    const uploadResults = await Promise.all(
      req.files.map(file => 
        cloudinary.uploader.upload(file.path, {
          folder: 'products',
          width: 800,
          crop: 'scale'
        })
      )
    );

    // 4. Formatage des nouvelles images
    const newImages = uploadResults.map(img => ({
      url: img.secure_url,
      public_id: img.public_id
    }));

    // 5. Mise à jour du produit avec les nouvelles images
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { images: newImages }, // Remplacement complet du tableau
      { new: true }
    );

    // 6. Nettoyage des fichiers temporaires
    await cleanTempFiles(req.files);

    res.status(200).json({ 
      success: true, 
      data: updatedProduct
    });

  } catch (error) {
    // Nettoyage en cas d'erreur
    if (req.files) await cleanTempFiles(req.files);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Échec de la mise à jour des images"
    });
  }
});
