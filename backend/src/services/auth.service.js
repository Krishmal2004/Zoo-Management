const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

const hashPassword = async (plain) => bcrypt.hash(plain, SALT_ROUNDS);

const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

const signToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const registerUser = async ({ fullName, email, phone, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }
  const hashed = await hashPassword(password);
  const user = await User.create({
    fullName,
    email,
    phone,
    password: hashed,
    role: 'visitor',
  });
  const token = signToken(user._id, user.role);
  const safeUser = await User.findById(user._id).select('-password');
  return { user: safeUser, token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  const match = await comparePassword(password, user.password);
  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }
  const token = signToken(user._id, user.role);
  user.password = undefined;
  return { user, token };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  signToken,
};
