const express = require('express');

const productController = require("../controllers/productController");
const authController = require('../controllers/authController');
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

// router.param('id', productController.checkID);

router
    .route('/')
    .get(productController.getAllProducts)
    .post(authController.protect,
        authController.restrictTo('admin', 'dev'),
        productController.createProduct);

router
    .route('/:id')
    .get(productController.getProduct)
    .patch(authController.protect,
        authController.restrictTo('admin', 'dev'),
        productController.uploadProductImages,
        productController.resizeProductImages,
        productController.updateProduct)
    .delete(authController.protect,
        authController.restrictTo('admin', 'dev'),
        productController.deleteProduct);

// POST /product/$tourId/reviews
// GET /product/$tourId/reviews

router.use('/:productId/reviews', reviewRouter);

module.exports = router;
