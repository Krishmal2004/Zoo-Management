const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Insect'],
    },
    age: {
      type: Number,
      default: 0,
    },
    feedingSchedule: {
      type: String,
      default: 'Standard',
    },
    isAvailableForPhotography: {
      type: Boolean,
      default: true,
    },
    healthStatus: {
      type: String,
      default: 'healthy',
    },
    feedingRestrictions: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    habitat: {
      type: String,
      default: '',
      trim: true,
    },
    diet: {
      type: String,
      default: '',
      trim: true,
    },
    lifespan: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    weight: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    funFacts: {
      type: [String],
      default: [],
    },
    conservationStatus: {
      type: String,
      enum: [
        'Extinct',
        'Extinct in the Wild',
        'Critically Endangered',
        'Endangered',
        'Vulnerable',
        'Near Threatened',
        'Least Concern',
        'Data Deficient',
      ],
      default: 'Least Concern',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '/uploads/animals/default.jpg',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Animal', animalSchema);
