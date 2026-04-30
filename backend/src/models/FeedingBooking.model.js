const mongoose = require('mongoose');

/**
 * FeedingBooking – records a visitor's booking for an animal feeding session.
 * The timeSlot field is a plain string in "HH:mm - HH:mm" format (no foreign-key
 * overhead needed for feeding sessions).
 */
const feedingBookingSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
      minlength: [2, 'Visitor name must be at least 2 characters'],
      maxlength: [120, 'Visitor name cannot exceed 120 characters'],
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact info is required'],
      trim: true,
      minlength: [5, 'Contact info must be at least 5 characters'],
      maxlength: [200, 'Contact info cannot exceed 200 characters'],
    },
    animalName: {
      type: String,
      required: [true, 'Animal name is required'],
      trim: true,
      enum: {
        values: ['Parrots', 'Deer', 'Giraffe', 'Zebra'],
        message: 'Animal must be one of: Parrots, Deer, Giraffe, Zebra',
      },
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      // Format: "HH:mm - HH:mm", e.g. "09:00 - 10:00"
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)$/,
        'Time slot must be in HH:mm - HH:mm format',
      ],
    },
    numberOfParticipants: {
      type: Number,
      required: [true, 'Number of participants is required'],
      min: [1, 'At least 1 participant required'],
      max: [20, 'Maximum 20 participants per session'],
    },
    status: {
      type: String,
      enum: {
        values: ['booked', 'completed', 'cancelled'],
        message: 'Status must be one of: booked, completed, cancelled',
      },
      default: 'booked',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeedingBooking', feedingBookingSchema);
