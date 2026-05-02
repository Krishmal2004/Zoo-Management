const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const DidYouKnow = require('../models/DidYouKnow.model');

exports.getDidYouKnowByAnimal = asyncHandler(async (req, res) => {
  const facts = await DidYouKnow.find({ animal: req.params.animalId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: facts.length, data: facts });
});

exports.getAllDidYouKnow = asyncHandler(async (req, res) => {
  const facts = await DidYouKnow.find().populate('animal', 'name').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: facts.length, data: facts });
});

exports.createDidYouKnow = asyncHandler(async (req, res) => {
  const fact = await DidYouKnow.create(req.body);
  res.status(201).json({ success: true, data: fact });
});

exports.updateDidYouKnow = asyncHandler(async (req, res) => {
  const fact = await DidYouKnow.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!fact) throw new AppError('Fact not found', 404);
  res.status(200).json({ success: true, data: fact });
});

exports.deleteDidYouKnow = asyncHandler(async (req, res) => {
  const fact = await DidYouKnow.findByIdAndDelete(req.params.id);
  if (!fact) throw new AppError('Fact not found', 404);
  res.status(200).json({ success: true, data: {} });
});
