const express = require('express');
const router = express.Router();
const { register, login} = require('../controllers.js/adminController');


// Admin registration route (only needed once to set up the admin)
router.post('/register', register);

// Admin login route
router.post('/login', login);

module.exports = router;
