const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, TokenBlacklist, UserSettings } = require("../models");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

const SALT_ROUNDS = 10;

const safeUser = (user, settings = {}) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  avatar_url: settings.avatar_url || null,
  phone: settings.phone || "",
  company: settings.company || "",
});

const getUserSettings = (userId) => UserSettings.findOrCreate({ where: { user_id: userId }, defaults: { user_id: userId } }).then(([settings]) => settings);

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { full_name, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ full_name, email, password_hash });

  const publicUser = safeUser(user);
  const token = generateToken(publicUser);

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: { user: publicUser, token },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  // Same generic message whether the email doesn't exist or the password
  // is wrong - avoids leaking which emails are registered.
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const settings = await getUserSettings(user.id);
  const publicUser = safeUser(user, settings);
  const token = generateToken(publicUser);

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user: publicUser, token },
  });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const { token, tokenExp, user } = req;

  // Store the token in a blacklist until its natural expiry so it can no
  // longer be used, even though JWTs are otherwise stateless.
  await TokenBlacklist.create({
    token,
    expires_at: new Date(tokenExp * 1000),
  });

  logger.info(`User logged out: ${user.email}`);

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

const updateProfile = asyncHandler(async (req, res) => {
  const full_name = req.body.full_name?.trim();
  const { phone, company, avatar_url } = req.body;
  if (avatar_url && (!/^data:image\/(jpeg|png|gif|webp);base64,/i.test(avatar_url) || Buffer.byteLength(avatar_url, "utf8") > 3 * 1024 * 1024)) throw new ApiError(400, "Avatar must be a JPG, PNG, GIF, or WebP image smaller than 2 MB");
  const user = await User.findByPk(req.user.id);
  user.full_name = full_name;
  await user.save();
  const settings = await getUserSettings(user.id);
  settings.phone = phone?.trim() || null;
  settings.company = company?.trim() || null;
  if (avatar_url !== undefined) settings.avatar_url = avatar_url || null;
  await settings.save();
  res.status(200).json({ success: true, message: "Profile updated", data: safeUser(user, settings) });
});

const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!(await bcrypt.compare(current_password, user.password_hash))) throw new ApiError(400, "Your current password is incorrect");
  if (await bcrypt.compare(new_password, user.password_hash)) throw new ApiError(400, "Choose a new password that differs from your current password");
  user.password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
  await user.save();
  logger.info(`Password changed for user ${user.id}`);
  res.status(200).json({ success: true, message: "Password updated successfully" });
});

module.exports = { register, login, logout, updateProfile, changePassword };
