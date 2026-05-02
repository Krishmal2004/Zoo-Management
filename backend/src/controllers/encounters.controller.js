const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Encounter = require('../models/Encounter.model');

exports.getAllEncounters = asyncHandler(async (req, res) => {
  const encounters = await Encounter.find().populate('animal', 'name').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: encounters.length, data: encounters });
});

exports.getEncounterById = asyncHandler(async (req, res) => {
  const encounter = await Encounter.findById(req.params.id).populate('animal', 'name');
  if (!encounter) throw new AppError('Encounter not found', 404);
  res.status(200).json({ success: true, data: encounter });
});

exports.createEncounter = asyncHandler(async (req, res) => {
  const encounter = await Encounter.create(req.body);
  res.status(201).json({ success: true, data: encounter });
});

exports.updateEncounter = asyncHandler(async (req, res) => {
  const encounter = await Encounter.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!encounter) throw new AppError('Encounter not found', 404);
  res.status(200).json({ success: true, data: encounter });
});

exports.deleteEncounter = asyncHandler(async (req, res) => {
  const encounter = await Encounter.findByIdAndDelete(req.params.id);
  if (!encounter) throw new AppError('Encounter not found', 404);
  res.status(200).json({ success: true, data: {} });
});
