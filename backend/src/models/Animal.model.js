const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Animal name is required'],
      trim: true,
      minlength: [2, 'Animal name must be at least 2 characters'],
      maxlength: [100, 'Animal name cannot exceed 100 characters'],
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      trim: true,
      minlength: [2, 'Species must be at least 2 characters'],
      maxlength: [100, 'Species cannot exceed 100 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age cannot exceed 150'],
    },
    feedingSchedule: {
      type: String,
      required: [true, 'Feeding schedule is required'],
      trim: true,
      minlength: [3, 'Feeding schedule must be at least 3 characters'],
      maxlength: [200, 'Feeding schedule cannot exceed 200 characters'],
    },
    isAvailableForPhotography: {
      type: Boolean,
      default: true,
    },
    healthStatus: {
      type: String,
      required: [true, 'Health status is required'],
      enum: {
        values: ['healthy', 'under_observation', 'sick', 'quarantined'],
        message:
          'Health status must be one of: healthy, under_observation, sick, quarantined',
      },
      default: 'healthy',
    },
    feedingRestrictions: {
      type: String,
      trim: true,
      maxlength: [300, 'Feeding restrictions cannot exceed 300 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Animal', animalSchema);
