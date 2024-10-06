const Order = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// Create a new order
const createOrder = async (req, res) => {
  // Extract order details from request body
  const { items, totalPrice, shippingAddress } = req.body;

  // Create the new order in the database
  const order = await Order.create({
    items,
    totalPrice,
    shippingAddress,
    // user: req.user.userId (if you want to track who created the order, omit if not needed)
  });

  res.status(StatusCodes.CREATED).json({ order });
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getUserOrders = async (req, res) => {
  // Retrieve all orders without any user-specific filtering
  const orders = await Order.find({});

  if (!orders.length) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'No orders found.',
    });
  }

  // Return the orders found
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

// Get a single order by ID (no authentication required)
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
  }

  res.status(StatusCodes.OK).json({ order });
};

// Update an order (no authentication required)
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { items, totalPrice, shippingAddress } = req.body;

  const order = await Order.findOneAndUpdate(
    { _id: orderId },
    { items, totalPrice, shippingAddress },
    { new: true, runValidators: true }
  );

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
  }

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getSingleOrder,
  updateOrder,
};
