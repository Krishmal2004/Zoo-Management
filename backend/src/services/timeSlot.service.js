const mongoose = require('mongoose');
const TimeSlot = require('../models/TimeSlot.model');
const AppError = require('../utils/AppError');

const populatePhotographer = { path: 'photographer', select: 'name specialty isActive' };

const createTimeSlot = async (payload) => {
  // Manual validation for conditional fields
  if (payload.type === 'Photography' && !payload.photographer) {
    throw new AppError('Photographer is required for photography slots', 400);
  }
  if (payload.type === 'Feeding' && !payload.animalName) {
    throw new AppError('Animal name is required for feeding slots', 400);
  }

  try {
    const slot = await TimeSlot.create(payload);
    return slot.populate(populatePhotographer);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('This time slot already exists.', 400);
    }
    throw error;
  }
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
  ['isBooked', 'capacity', 'startTime', 'endTime', 'photographer', 'date', 'type', 'animalName'].forEach((field) => {
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
