const express = require('express');
const feedingBookingController = require('../controllers/feedingBooking.controller');
const { requireDatabase } = require('../middleware/db.middleware');

const router = express.Router();

router
  .route('/')
  .post(requireDatabase, feedingBookingController.createBooking)
  .get(requireDatabase, feedingBookingController.getAllBookings);

module.exports = router;
