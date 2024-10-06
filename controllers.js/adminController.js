const Admin = require('../models/Admin');  // Ensure Admin schema includes email
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Handle admin registration (one-time use for the first admin)
const register = async (req, res) => {
  const { email, password } = req.body;

  // Check if email already exists
  const emailAlreadyExists = await Admin.findOne({ email });
  if (emailAlreadyExists) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email, username, and password' });
  }
  try {
    const admin = await Admin.create({ email, password });
    res.status(201).json({ message: 'Admin registered successfully', admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handle admin login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordCorrect = await admin.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = admin.createJWT();
  res.status(200).json({ message: 'Login successful', token });
};

// Middleware to verify JWT token
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { adminId: payload.adminId, email: payload.email };  // Added email to payload
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication invalid' });
  }
};

// Handle product upload (protected)
const uploadProduct = async (req, res) => {
  const { name, price, description } = req.body;
  const productImage = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const product = await Product.create({
      name,
      price,
      description,
      image: productImage,
    });
    res.status(201).json({ message: 'Product uploaded successfully', product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handle viewing orders (protected)
const viewOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('product');
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  authenticateAdmin,
  uploadProduct,
  viewOrders,
};
