const rateLimit = require("express-rate-limit");

// Applies to /register and /login - mitigates brute-force attacks from a
// single IP by capping how many attempts it can make in a time window.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts from this IP. Please try again after 15 minutes.",
  },
});

module.exports = { authLimiter };