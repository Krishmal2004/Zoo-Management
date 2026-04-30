const FeedingBooking = require('../models/FeedingBooking.model');
const AppError = require('../utils/AppError');

const createBooking = async (payload) => {
  const booking = await FeedingBooking.create(payload);
  return booking;
};

const getAllBookings = async (filters = {}) => {
  const query = {};
  if (filters.animalName) {
    query.animalName = filters.animalName;
  }
  if (filters.date) {
    const date = new Date(filters.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }
  return FeedingBooking.find(query).sort({ createdAt: -1 });
};

module.exports = {
  createBooking,
  getAllBookings,
};
