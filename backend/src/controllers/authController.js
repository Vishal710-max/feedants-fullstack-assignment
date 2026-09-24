const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) => jwt.sign({ sub: String(id) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const toUserDTO = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  profileImage: u.profileImage || null,
  referralCode: u.referralCode,
  referralLink: `${config.referralBaseUrl}/${u.referralCode}`,
});

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, referralCode } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({
      name,
      email,
      passwordHash,
      referredBy: referralCode || null,
      referralCode: `${name.replace(/[^a-z]/gi, '').slice(0, 4).toLowerCase()}${crypto.randomBytes(3).toString('hex')}`,
    });
    res.status(201).json({ success: true, data: { token: signToken(user._id), user: toUserDTO(user) } });
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
    throw err;
  }
});

exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
  const ok = user && (await bcrypt.compare(req.body.password, user.passwordHash));
  if (!ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');
  res.json({ success: true, data: { token: signToken(user._id), user: toUserDTO(user) } });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError(401, 'INVALID_TOKEN', 'Account no longer exists.');
  res.json({ success: true, data: toUserDTO(user) });
});
