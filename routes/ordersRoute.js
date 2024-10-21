const express = require("express");
const router = express.Router();
const jwtService = require("../utils/jwt");

// Importing necessary controller functions
const {
  getAllOrders,
  getSingleOrder,
  getUserOrders,
  createOrder,
  updateOrder,
} = require("../controllers.js/orderController");

// Admin authentication/authorization middleware
const { authorizePermissions } = require("../middlewares/authentication");

router
  .route("/")
  .post(createOrder)
  .get([jwtService.verifyToken.bind(jwtService)], getAllOrders); // Admin-only: Get all orders

router.route("/MyOrders").get(getUserOrders); // Only authenticated users can view their orders

router
  .route("/:id")
  .get([jwtService.verifyToken.bind(jwtService)], getSingleOrder)
  .patch(updateOrder);

module.exports = router;
