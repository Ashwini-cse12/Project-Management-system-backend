const express = require("express");
const router = express.Router();

const { register, login, logout, updateProfile, changePassword } = require("../controllers/authController");
const { registerValidator, loginValidator, changePasswordValidator, profileValidator } = require("../validators/authValidator");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/ratelimiter");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/logout", authMiddleware, logout);
router.put("/profile", authMiddleware, profileValidator, validate, updateProfile);
router.put("/change-password", authMiddleware, changePasswordValidator, validate, changePassword);

module.exports = router;
