const express = require('express');
const router = express.Router();

const { login, signup, deleteMyAccount,
     deleteUserByAdmin, getAllUsers,
     forgotPassword,
     resetPassword,
     updateUserProfile,
     verifyEmail,
     resendVerification } = require('../controllers/authController');
const { validateSignup } = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');


router.post('/login', login);
router.post('/signup', validateSignup, signup);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.put('/profile', protect, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.route('/me').delete(protect, deleteMyAccount);
// Route Admin seulement
router.get('/', protect, authorize('admin'), getAllUsers);
router.route('/:id').delete(protect, authorize('admin'), deleteUserByAdmin);

module.exports = router;
