const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// GET user profile
router.get('/', authController.getUserProfile);

// PUT update user profile
router.put('/', authController.updateUserProfile);

// POST update profile picture
router.post('/profile-picture', authController.updateProfilePicture);

// POST resend verification email
router.post('/resend-verification-email', authController.resendVerificationEmail);

module.exports = router;
