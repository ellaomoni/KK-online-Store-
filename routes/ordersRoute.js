const express = require('express');
const router = express.Router();

// Importing necessary controller functions
const {
  getAllOrders,
  getSingleOrder,
  getUserOrders,
  createOrder,
  updateOrder,
} = require('../controllers.js/orderController');

// Admin authentication/authorization middleware
const {authorizePermissions } = require('../middlewares/authentication');

router.route('/')
  .post(createOrder) 
  .get(authorizePermissions('admin'), getAllOrders); // Admin-only: Get all orders


router.route('/MyOrders')
  .get(getUserOrders); // Only authenticated users can view their orders

router.route('/:id')
  .get(getSingleOrder)
  .patch(updateOrder); 

module.exports = router;
