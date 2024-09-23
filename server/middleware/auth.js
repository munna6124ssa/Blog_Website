const jwt = require("jsonwebtoken");
const User = require("../models/user");
const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers?.authorization;
    if (!token) return res.status(401).json("Un authorized user");
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const isUser = await User.findById(data.id).select('-password');
    if(!isUser) return res.status(404).json("User not found");
    req.user = isUser;
    next();
  } catch (error) {
    console.error("Error in isLoggedIn");
    return res.status(500).json(error.message);
  }
};

module.exports = { isLoggedIn };