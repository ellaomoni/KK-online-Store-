const jwt = require("jsonwebtoken");

const createJWT = (user) => {
  const payload = {
    user: user.name,
    email: user.email,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFECYCLE,
  });
  return token;
};

const isTokenValid = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
};

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // Check if Authorization header exists and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({
        status: 403,
        message: "Access denied: No bearer token provided",
      });
    }

    // Extract the token from the Bearer string
    const token = authHeader.split(" ")[1];

    // Verify the token using the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 401,
          message: "Invalid or expired token",
        });
      }

      // Attach the decoded user data to the request object
      req.user = decoded;
      next();
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = {
  createJWT,
  isTokenValid,
  verifyToken,
  attachCookiesToResponse,
};
