const mongoose = require('mongoose');
const Animal = require('../models/Animal.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.addAnimal = asyncHandler(async (req, res) => {
  let fileName = '';
  if (req.file) {
    fileName = req.file.filename;
  } else if (req.files && req.files.length > 0) {
    fileName = req.files[0].filename;
  }

  const animalData = {
    ...req.body,
    imageUrl: fileName ? `/uploads/animals/${fileName}` : '/uploads/animals/default.jpg',
  };

  const animal = await Animal.create(animalData);
  res.status(201).json({ success: true, message: 'Saved!', data: animal });
});

exports.getAllAnimals = asyncHandler(async (req, res) => {
  const { search, species, category } = req.query;
  const query = {};
  if (species) query.species = { $regex: species.trim(), $options: 'i' };
  if (category && category !== 'All') query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };

  const animals = await Animal.find(query).sort({ name: 1 });
  res.status(200).json({
    success: true,
    count: animals.length,
    data: animals,
  });
});

exports.getRandomFact = asyncHandler(async (req, res) => {
  const count = await Animal.countDocuments();
  if (!count) {
    return res.status(200).json({
      success: true,
      data: {
        animalName: 'Zoo',
        fact: 'Did you know that zoos play a critical role in conservation?',
      },
    });
  }

  const random = Math.floor(Math.random() * count);
  const animal = await Animal.findOne().skip(random);

  if (!animal || !animal.funFacts || animal.funFacts.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        animalName: 'Zoo',
        fact: 'Did you know that zoos play a critical role in conservation?',
      },
    });
  }

  const randomFactIndex = Math.floor(Math.random() * animal.funFacts.length);
  res.status(200).json({
    success: true,
    data: {
      animalName: animal.name,
      fact: animal.funFacts[randomFactIndex],
    },
  });
});

exports.getAnimalById = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id);
  if (!animal) throw new AppError('Animal not found', 404);
  res.status(200).json({ success: true, data: animal });
});

exports.updateAnimal = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) updateData.imageUrl = `/uploads/animals/${req.file.filename}`;

  const updatedAnimal = await Animal.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedAnimal) throw new AppError('Animal not found', 404);
  res.status(200).json({ success: true, data: updatedAnimal });
});

exports.deleteAnimal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ID format', 400);
  }

  const deletedAnimal = await Animal.findByIdAndDelete(id);
  if (!deletedAnimal) throw new AppError('Animal not found', 404);

  res.status(200).json({
    success: true,
    message: 'Animal deleted successfully',
  });
});

exports.markAnimalUnavailable = asyncHandler(async (req, res) => {
  const animal = await Animal.findByIdAndUpdate(
    req.params.id,
    { isAvailableForPhotography: false },
    { new: true }
  );
  if (!animal) throw new AppError('Animal not found', 404);
  res.status(200).json({ success: true, data: animal });
});
