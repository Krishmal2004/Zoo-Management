const mongoose = require('mongoose');
const Animal = require('../models/Animal.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.addAnimal = asyncHandler(async (req, res) => {
  const animal = await Animal.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Animal added successfully',
    data: animal,
  });
});

exports.getAllAnimals = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.species) {
    query.species = { $regex: req.query.species.trim(), $options: 'i' };
  }

  const animals = await Animal.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: animals.length,
    data: animals,
  });
});

exports.getAnimalById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid animal ID', 400);
  }

  const animal = await Animal.findById(id);
  if (!animal) {
    throw new AppError('Animal not found', 404);
  }

  res.status(200).json({
    success: true,
    data: animal,
  });
});

exports.updateAnimal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid animal ID', 400);
  }

  const updatedAnimal = await Animal.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedAnimal) {
    throw new AppError('Animal not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Animal updated successfully',
    data: updatedAnimal,
  });
});

exports.deleteAnimal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid animal ID', 400);
  }

  const deletedAnimal = await Animal.findByIdAndDelete(id);
  if (!deletedAnimal) {
    throw new AppError('Animal not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Animal deleted successfully',
  });
});

exports.markAnimalUnavailable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid animal ID', 400);
  }

  const animal = await Animal.findByIdAndUpdate(
    id,
    { isAvailableForPhotography: false },
    { new: true, runValidators: true }
  );

  if (!animal) {
    throw new AppError('Animal not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Animal marked as unavailable for photography',
    data: animal,
  });
});
