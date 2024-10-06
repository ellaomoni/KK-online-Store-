const express = require('express');
const router = express.Router();
const { register, login, authenticateAdmin, uploadProduct, viewOrders } = require('../controllers/adminController');


// Admin registration route (only needed once to set up the admin)
router.post('/register', register);

// Admin login route
router.post('/login', login);

// Protected routes (require authentication)
router.post('/upload-product', authenticateAdmin, uploadProduct);
router.get('/orders', authenticateAdmin, viewOrders);

module.exports = router;
