const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Slot type is required'],
      default: 'Photography',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photographer',
    },
    animalName: {
      type: String,
      default: 'All',
    },
    capacity: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

// End time validation
timeSlotSchema.path('endTime').validate(function validateEndTime(value) {
  return !this.startTime || this.startTime < value;
}, 'End time must be later than start time');

// REMOVED UNIQUE INDEX TO PREVENT CONFLICTS DURING DEVELOPMENT
// timeSlotSchema.index({ type: 1, photographer: 1, animalName: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
