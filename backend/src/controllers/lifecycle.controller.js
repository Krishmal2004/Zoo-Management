const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const LifeCycle = require('../models/LifeCycle.model');

exports.getLifeCyclesByAnimal = asyncHandler(async (req, res) => {
  const cycles = await LifeCycle.find({ animal: req.params.animalId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: cycles.length, data: cycles });
});

exports.createLifeCycle = asyncHandler(async (req, res) => {
  const cycle = await LifeCycle.create(req.body);
  res.status(201).json({ success: true, data: cycle });
});

exports.updateLifeCycle = asyncHandler(async (req, res) => {
  const cycle = await LifeCycle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!cycle) throw new AppError('Life cycle not found', 404);
  res.status(200).json({ success: true, data: cycle });
});

exports.deleteLifeCycle = asyncHandler(async (req, res) => {
  const cycle = await LifeCycle.findByIdAndDelete(req.params.id);
  if (!cycle) throw new AppError('Life cycle not found', 404);
  res.status(200).json({ success: true, data: {} });
});
