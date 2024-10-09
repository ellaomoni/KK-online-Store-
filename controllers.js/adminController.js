const Admin = require("../models/Admin");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createJWT } = require("../utils/jwt");

//admin registration
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailAlreadyExists = await Admin.findOne({ email });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError("Email already exists");
    }

    const admin = await Admin.create({ email, password, name });
    const tokenUser = createJWT(admin);
    attachCookiesToResponse({ res, user: tokenUser });
    return res.status(StatusCodes.CREATED).json({
      status: 201,
      message: "created successfully",
      accessToken: tokenUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};
//admin login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  //Admin.findOne, instead of user.findOne
  const admin = await Admin.findOne({ email });

  if (!admin) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  //tokenAdmin
  const tokenAdmin = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenAdmin });
  res.status(StatusCodes.OK).json({ user: tokenAdmin });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: newDate(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out successfully" });
};

module.exports = {
  register,
  login,
  logout,
};
