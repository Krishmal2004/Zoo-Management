const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Feedback = require('../models/Feedback.model');
const Inquiry = require('../models/Inquiry.model');
const Review = require('../models/Review.model');

// --- FEEDBACK ---

exports.createFeedback = asyncHandler(async (req, res) => {
  const { type, subject, message } = req.body;

  if (!type || !subject || !message) {
    throw new AppError('Type, subject, and message are required', 400);
  }

  const feedback = await Feedback.create({
    userId: req.user._id,
    type,
    subject,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
    data: { feedback },
  });
});

exports.getMyFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'My feedbacks loaded',
    data: { feedbacks },
  });
});

exports.getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find().populate('userId', 'fullName email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'All feedbacks loaded (Admin)',
    data: { feedbacks },
  });
});

// --- INQUIRIES ---

exports.createInquiry = asyncHandler(async (req, res) => {
  const { type, subject, message } = req.body;
  const imageUrl = req.file ? `/uploads/feedback/${req.file.filename}` : undefined;

  if (!type || !subject || !message) {
    throw new AppError('Type, subject, and message are required', 400);
  }

  const inquiry = await Inquiry.create({
    userId: req.user._id,
    type,
    subject,
    message,
    imageUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Inquiry submitted successfully',
    data: { inquiry },
  });
});

exports.getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'My inquiries loaded',
    data: { inquiries },
  });
});

exports.getAllInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().populate('userId', 'fullName email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'All inquiries loaded (Admin)',
    data: { inquiries },
  });
});

// --- REVIEWS ---

exports.createReview = asyncHandler(async (req, res) => {
  const { rating, message } = req.body;

  if (!rating || !message) {
    throw new AppError('Rating and message are required', 400);
  }

  const review = await Review.create({
    userId: req.user._id,
    rating,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: { review },
  });
});

exports.getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'My reviews loaded',
    data: { reviews },
  });
});

exports.getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().populate('userId', 'fullName email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'All reviews loaded (Admin)',
    data: { reviews },
  });
});
