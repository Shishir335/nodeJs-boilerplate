const express = require('express');

const categoryController = require("../controllers/categoryController");
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('id', CategoryController.checkID);

router
    .route('/')
    .get(authController.protect, categoryController.getAllCategory)
    .post(categoryController.createCategory);

router
    .route('/:id')
    .get(categoryController.getCategory)
    .patch(categoryController.updateCategory)
    .delete(authController.protect,
        authController.restrictTo('admin', 'dev'),
        categoryController.deleteCategory);

module.exports = router;
