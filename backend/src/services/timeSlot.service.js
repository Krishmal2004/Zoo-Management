const mongoose = require('mongoose');
const TimeSlot = require('../models/TimeSlot.model');
const AppError = require('../utils/AppError');

const populatePhotographer = { path: 'photographer', select: 'name specialty isActive' };

const createTimeSlot = async (payload) => {
  const slot = await TimeSlot.create(payload);
  return slot.populate(populatePhotographer);
};

const getAllTimeSlots = () => TimeSlot.find().populate(populatePhotographer).sort({ createdAt: -1 });

const getTimeSlotById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid time slot ID', 400);
  }

  const slot = await TimeSlot.findById(id).populate(populatePhotographer);
  if (!slot) {
    throw new AppError('Time slot not found', 404);
  }
  return slot;
};

const updateTimeSlot = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid time slot ID', 400);
  }

  const updatePayload = {};
  ['isBooked', 'capacity', 'startTime', 'endTime', 'photographer', 'date'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updatePayload[field] = payload[field];
    }
  });

  const slot = await TimeSlot.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).populate(populatePhotographer);

  if (!slot) {
    throw new AppError('Time slot not found', 404);
  }
  return slot;
};

const deleteTimeSlot = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid time slot ID', 400);
  }

  const deleted = await TimeSlot.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Time slot not found', 404);
  }
};

module.exports = {
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot,
};
