const express = require('express');
<<<<<<< HEAD
const {
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require('../controllers/feedback.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
=======
const feedbackController = require('../controllers/feedback.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { createUpload } = require('../middleware/upload.middleware');
>>>>>>> main
const { requireDatabase } = require('../middleware/db.middleware');

const router = express.Router();

<<<<<<< HEAD
router.use(requireDatabase);

// Public: visitors submit feedback
router.route('/').get(protect, restrictTo('admin'), getAllFeedback).post(createFeedback);

// Admin: view single, update status, or delete
router.route('/:id').get(protect, restrictTo('admin'), getFeedbackById).delete(protect, restrictTo('admin'), deleteFeedback);
router.patch('/:id/status', protect, restrictTo('admin'), updateFeedbackStatus);
=======
const inquiryUpload = createUpload('feedback', {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.use(requireDatabase, protect);

// Feedback
router.post('/', feedbackController.createFeedback);
router.get('/user', feedbackController.getMyFeedbacks);
router.patch('/:id', feedbackController.updateFeedback);
router.delete('/:id', feedbackController.deleteFeedback);
router.get('/all', restrictTo('admin'), feedbackController.getAllFeedbacks);

// Inquiries
router.post('/inquiries', inquiryUpload.single('image'), feedbackController.createInquiry);
router.get('/inquiries/user', feedbackController.getMyInquiries);
router.patch('/inquiries/:id', inquiryUpload.single('image'), feedbackController.updateInquiry);
router.delete('/inquiries/:id', feedbackController.deleteInquiry);
router.get('/inquiries/all', restrictTo('admin'), feedbackController.getAllInquiries);

// Reviews
router.post('/reviews', feedbackController.createReview);
router.get('/reviews/user', feedbackController.getMyReviews);
router.patch('/reviews/:id', feedbackController.updateReview);
router.delete('/reviews/:id', feedbackController.deleteReview);
router.get('/reviews/all', restrictTo('admin'), feedbackController.getAllReviews);

// Admin Replies
router.post('/:id/reply', restrictTo('admin'), feedbackController.replyToFeedback);
router.post('/inquiries/:id/reply', restrictTo('admin'), feedbackController.replyToInquiry);
router.post('/reviews/:id/reply', restrictTo('admin'), feedbackController.replyToReview);
>>>>>>> main

module.exports = router;
