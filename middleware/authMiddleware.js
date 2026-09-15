const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, TokenBlacklist } = require("../models");
const { asyncHandler } = require("./errorHandler");

// Verifies the Bearer token, rejects blacklisted (logged-out) tokens,
// confirms the user still exists, and attaches req.user for downstream
// route handlers to use for ownership checks.
const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ success: false, message: "Invalid token." });
  }

  const blacklisted = await TokenBlacklist.findOne({ where: { token } });
  if (blacklisted) {
    return res.status(401).json({ success: false, message: "Token has been revoked. Please log in again." });
  }

  const user = await User.findByPk(decoded.id, {
    attributes: ["id", "full_name", "email"],
  });
  if (!user) {
    return res.status(401).json({ success: false, message: "User no longer exists." });
  }

  req.user = user;
  req.token = token;
  req.tokenExp = decoded.exp; // used by logout to store blacklist expiry
  next();
});

module.exports = authMiddleware;