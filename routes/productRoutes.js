const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require("../middlewares/authentication");

const jwtService = require("../utils/jwt");

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
  upload,
} = require("../controllers.js/productController");

// Routes for products
router
  .route("/")
  .post(
    [jwtService.verifyToken.bind(jwtService)],
    upload.single("image"),
    createProduct
  )
  .get(getAllProducts);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch([jwtService.verifyToken.bind(jwtService)], updateProduct) // Admin only
  .delete([jwtService.verifyToken.bind(jwtService)], deleteProduct); // Admin only

// Routes for product image management
router
  //should be the route before the id
  .route("/image/:id")
  .post([jwtService.verifyToken.bind(jwtService)], uploadProductImage) // Admin only: Upload image
  .get(getProductImage) // Public access: Retrieve image
  .patch([jwtService.verifyToken.bind(jwtService)], updateProductImage) // Admin only: Update image
  .delete([jwtService.verifyToken.bind(jwtService)], deleteProductImage); // Admin only: Delete image

module.exports = router;
