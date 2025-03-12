const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protecting below router with this line. Above routes won't be affected with this protection
router.use(authController.protect);

router.patch('/changePassword', authController.changePassword);
router.patch(
    '/updateMe',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.get('/profile',
    userController.getProfile,
    userController.getUser);

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(
        userController.deleteUser,
        authController.restrictTo('admin', 'dev')
    );

module.exports = router;