const Admin = require("../models/Admin");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

//admin registration
const register = async (req, res) => {
  const { name, email, password } = req.body;
  const emailAlreadyExists = await User.findone({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  const user = await User.create({ email, password, name, role });
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};
//admin login
const login = async (req, res) => {
  const { email, password } = req.body;

  const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError.BadRequestError(
        "Please provide email and password"
      );
    }

    //Admin.findOne, instead of user.findOne
    const user = await Admin.findOne({ email });

    if (!user) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
  };
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
