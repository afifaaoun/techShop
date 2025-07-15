const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../config/multer');
const { uploadUserAvatar, uploadProductImages } = require('../controllers/uploadController');


router.put('/users/avatar', protect, upload.single('avatar'), uploadUserAvatar);
router.post('/products/:id/images', protect, authorize('admin'), upload.array('images', 5), uploadProductImages);

module.exports = router;
