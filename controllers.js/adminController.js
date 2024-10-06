const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');


// Handle admin registration (one-time use for the first admin)
const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide a username and password' });
  }

  // Check if an admin already exists
  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) {
    return res.status(400).json({ message: 'Admin already exists' });
  }

  try {
    const admin = await Admin.create({ username, password });
    res.status(201).json({ message: 'Admin registered successfully', admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handle admin login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  const admin = await Admin.findOne({ username });
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
    req.admin = { adminId: payload.adminId, username: payload.username };
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
