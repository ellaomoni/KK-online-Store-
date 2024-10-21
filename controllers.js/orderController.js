const Order = require("../models/Order");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Product = require("../models/Product");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      items,
      billingAddress,
      shippingAddress,
      paymentInfo,
      customerNote,
    } = req.body;

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error("Product not found");
        }
        // console.log(product);

        if (item.amount > product.quantitySelector.max) {
          throw new Error(
            `Only ${product.quantitySelector.max} items are available for ${product.name}`
          );
        }

        return {
          name: product.name,
          image: product.productImage.productImageUrl,
          price: product.price,
          amount: item.amount,
          product: product._id,
        };
      })
    );

    const subtotal = orderItems.reduce(
      (acc, item) => acc + item.price * item.amount,
      0
    );
    const shippingFee = req.body.shippingFee || 0;
    const total = subtotal + shippingFee;

    const order = new Order({
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      billingAddress,
      shippingAddress,
      paymentInfo,
      customerNote,
    });

    // Save the order
    const savedOrder = await order.save();

    await Promise.all(
      orderItems.map(async (item) => {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: { "quantitySelector.max": -item.amount },
          },
          { new: true }
        );
      })
    );

    return res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
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
      message: "No orders found.",
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
