const mongoose = require('mongoose');
const Photo = require('../models/Photo.model');
const PhotographyBooking = require('../models/PhotographyBooking.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const populatedPhotoQuery = Photo.find().populate({
  path: 'booking',
  select: 'visitorName date time status',
});

exports.uploadPhoto = asyncHandler(async (req, res) => {
  const bookingId = req.body.booking;
  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Valid booking ID is required', 400);
  }

  const booking = await PhotographyBooking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  const uploadedFiles = req.files || [];
  if (!uploadedFiles.length) {
    throw new AppError('At least one photo file is required', 400);
  }

  let parsedTags = req.body.tags;
  if (typeof parsedTags === 'string') {
    try {
      parsedTags = JSON.parse(parsedTags);
    } catch {
      parsedTags = parsedTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }
  if (parsedTags && !Array.isArray(parsedTags)) {
    throw new AppError('tags must be an array or comma-separated string', 400);
  }

  const docs = uploadedFiles.map((file) => ({
    booking: bookingId,
    imageUrl: `/uploads/photos/${file.filename}`,
    caption: req.body.caption || '',
    tags: parsedTags || [],
    isFavorite: req.body.isFavorite === 'true' || req.body.isFavorite === true,
  }));

  const createdPhotos = await Photo.insertMany(docs);
  const createdPhotoIds = createdPhotos.map((photo) => photo._id);
  const populatedPhotos = await Photo.find({ _id: { $in: createdPhotoIds } })
    .populate({ path: 'booking', select: 'visitorName date time status' })
    .sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    message: 'Photos uploaded successfully',
    count: populatedPhotos.length,
    data: populatedPhotos,
  });
});

exports.getAllPhotos = asyncHandler(async (req, res) => {
  const photos = await populatedPhotoQuery.clone().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: photos.length,
    data: photos,
  });
});

exports.getPhotosByBookingId = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking ID', 400);
  }

  const booking = await PhotographyBooking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  const photos = await Photo.find({ booking: bookingId })
    .populate({ path: 'booking', select: 'visitorName date time status' })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: photos.length,
    data: photos,
  });
});

exports.updatePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid photo ID', 400);
  }

  const updatePayload = {};
  if (Object.prototype.hasOwnProperty.call(req.body, 'caption')) {
    updatePayload.caption = req.body.caption;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'tags')) {
    updatePayload.tags = req.body.tags;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'isFavorite')) {
    updatePayload.isFavorite = req.body.isFavorite;
  }

  const updatedPhoto = await Photo.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).populate({ path: 'booking', select: 'visitorName date time status' });

  if (!updatedPhoto) {
    throw new AppError('Photo not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Photo updated successfully',
    data: updatedPhoto,
  });
});

exports.deletePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid photo ID', 400);
  }

  const deletedPhoto = await Photo.findByIdAndDelete(id);
  if (!deletedPhoto) {
    throw new AppError('Photo not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Photo deleted successfully',
  });
});

exports.markPhotoFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid photo ID', 400);
  }

  const photo = await Photo.findByIdAndUpdate(
    id,
    { isFavorite: req.body.isFavorite !== false },
    { new: true, runValidators: true }
  ).populate({ path: 'booking', select: 'visitorName date time status' });

  if (!photo) {
    throw new AppError('Photo not found', 404);
  }

  res.status(200).json({
    success: true,
    message: `Photo ${photo.isFavorite ? 'marked as favorite' : 'removed from favorites'}`,
    data: photo,
  });
});
