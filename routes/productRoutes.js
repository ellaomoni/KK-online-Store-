const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/authentication');

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getProductImage,
  updateProductImage,
  deleteProductImage,
} = require('../controllers.js/productController');

// Routes for products
router
  .route('/')
  .post([authenticateUser, authorizePermissions('admin')], createProduct)
  .get(getAllProducts);

router
  .route('/:id')
  .get(getSingleProduct)  // Public access
  .patch([authenticateUser, authorizePermissions('admin')], updateProduct)  // Admin only
  .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);  // Admin only

// Routes for product image management
router
  .route('/:id/image')
  .post([authenticateUser, authorizePermissions('admin')], uploadProductImage)  // Admin only: Upload image
  .get(getProductImage)  // Public access: Retrieve image
  .patch([authenticateUser, authorizePermissions('admin')], updateProductImage)  // Admin only: Update image
  .delete([authenticateUser, authorizePermissions('admin')], deleteProductImage);  // Admin only: Delete image

module.exports = router;
