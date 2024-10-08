const CustomError = require('../errors');
const { isTokenValid } = require('../utils');  

const authenticateUser = async (req, res, next) => {
  // Extract token from signed cookies
  const token = req.signedCookies.token;

  // If the token is missing, throw an authentication error
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    // Validate the token and extract admin info from the payload
    const { name, adminId } = isTokenValid({ token });

    // Attach the user information to the request object
    req.user = { name, adminId };
    
    // Call the next middleware or route handler
    next();
  } catch (error) {
    // If token validation fails, throw an authentication error
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

// Middleware for role-based authorization
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is authorized to access the route
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
