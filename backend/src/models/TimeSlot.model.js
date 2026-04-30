const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photographer',
      required: [true, 'Photographer is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [500, 'Capacity cannot exceed 500'],
    },
  },
  { timestamps: true }
);

timeSlotSchema.path('endTime').validate(function validateEndTime(value) {
  return this.startTime < value;
}, 'End time must be later than start time');

timeSlotSchema.index({ photographer: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
