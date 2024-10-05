const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// This will be used to fetch the admin user's profile
const getAdminUser = async (req, res) => {
  // Assuming there's only one admin in the system
  const admin = await User.findOne({ role: 'admin' }).select('-password');
  
  if (!admin) {
    throw new CustomError.NotFoundError('Admin user not found');
  }
  
  res.status(StatusCodes.OK).json({ admin });
};

// This function is kept in case you want to fetch the current user (admin) based on a session or token
const showCurrentAdmin = async (req, res) => {
  // Simply return the admin user (assumes req.user is populated with the admin)
  res.status(StatusCodes.OK).json({ admin: req.user });
};

module.exports = {
  getAdminUser,
  showCurrentAdmin,
};
