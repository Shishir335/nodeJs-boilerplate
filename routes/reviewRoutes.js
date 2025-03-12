const express = require('express');

const reviewController = require("../controllers/reviewController");
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protecting below router with this line. Above routes won't be affected with this protection
router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReview)
    .post(
        authController.restrictTo('user'),
        reviewController.setProductUserIds,
        reviewController.createReview
    );

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.restrictTo('admin', 'dev'),
        reviewController.updateReview)
    .delete(
        authController.restrictTo('admin', 'dev'),
        reviewController.deleteReview);

module.exports = router;
