const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');


// router.post('')
router.post('/register', userController.register)
// router.post('/verification', userController.userVerification)
// router.put('/edit/:userId', multerUpload.single('profilePicture'), userController.updateUser)
// router.get('/:userId', userController.getUser)
// router.post('/send-email', userController.sendEmailForgetPassword)
// router.patch('/reset-password', userController.resetPassword)
router.post('/login', userController.login)
router.get('/verify/:token', userController.verify)
router.post('/resend-verification-email',userController.resendVerificationEmail)


module.exports = router;