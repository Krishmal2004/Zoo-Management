const express = require('express');
<<<<<<< HEAD
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketShow.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');

const router = express.Router();

router.use(requireDatabase);

router
  .route('/')
  .get(getAllTickets)
  .post(protect, restrictTo('admin'), createTicket);

router
  .route('/:id')
  .get(getTicketById)
  .put(protect, restrictTo('admin'), updateTicket)
  .delete(protect, restrictTo('admin'), deleteTicket);
=======
const ticketShowController = require('../controllers/ticketShow.controller');
const groupBookingRequestRoutes = require('./groupBookingRequest.routes');
const { protect } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const validateRequest = require('../validations/validateRequest');
const { createBookingRules, bookingIdParamRules, verifyEntryRules } = require('../validations/ticketShow.validation');

const router = express.Router();

router.use('/group-requests', groupBookingRequestRoutes);

router.get('/', ticketShowController.getModuleInfo);
router.get('/catalog', requireDatabase, ticketShowController.getCatalog);
router.post(
  '/bookings',
  requireDatabase,
  protect,
  createBookingRules,
  validateRequest,
  ticketShowController.createBooking
);
router.get('/bookings/me', requireDatabase, protect, ticketShowController.getMyBookings);
router.get(
  '/bookings/:id',
  requireDatabase,
  protect,
  bookingIdParamRules,
  validateRequest,
  ticketShowController.getBookingById
);
router.post(
  '/bookings/verify-entry',
  requireDatabase,
  protect,
  verifyEntryRules,
  validateRequest,
  ticketShowController.verifyEntry
);
>>>>>>> main

module.exports = router;
