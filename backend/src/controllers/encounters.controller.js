const asyncHandler = require('../utils/asyncHandler');
<<<<<<< HEAD
const AppError = require('../utils/AppError');
const Encounter = require('../models/Encounter.model');

// GET /api/encounters
exports.getAllEncounters = asyncHandler(async (req, res) => {
  const encounters = await Encounter.find().populate('animal', 'name').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: encounters.length, data: encounters });
});

// GET /api/encounters/:id
exports.getEncounterById = asyncHandler(async (req, res) => {
  const encounter = await Encounter.findById(req.params.id).populate('animal', 'name');
  if (!encounter) throw new AppError('Encounter not found', 404);
  res.status(200).json({ success: true, data: encounter });
});

// POST /api/encounters
exports.createEncounter = asyncHandler(async (req, res) => {
  const encounter = await Encounter.create(req.body);
  res.status(201).json({ success: true, data: encounter });
});

// PUT /api/encounters/:id
exports.updateEncounter = asyncHandler(async (req, res) => {
  const encounter = await Encounter.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!encounter) throw new AppError('Encounter not found', 404);
  res.status(200).json({ success: true, data: encounter });
});

// DELETE /api/encounters/:id
exports.deleteEncounter = asyncHandler(async (req, res) => {
  const encounter = await Encounter.findByIdAndDelete(req.params.id);
  if (!encounter) throw new AppError('Encounter not found', 404);
  res.status(200).json({ success: true, data: {} });
=======

/** Prepared for Phase 2 — Animal Encounter & Photography */
exports.getModuleInfo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Encounters module — prepared for Phase 2',
    data: { module: 'encounters' },
  });
>>>>>>> main
});
