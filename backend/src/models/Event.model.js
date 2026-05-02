<<<<<<< HEAD
const mongoose = require('mongoose');
=======
const mongoose = require("mongoose");
>>>>>>> main

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
<<<<<<< HEAD
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
=======
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: ["Wedding", "Birthday", "Corporate", "Anniversary", "Graduation", "Other"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
>>>>>>> main
      trim: true,
    },
    capacity: {
      type: Number,
<<<<<<< HEAD
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['conservation', 'education', 'entertainment', 'feeding', 'seasonal', 'other'],
      default: 'other',
=======
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    pricePerPerson: {
      type: Number,
      required: [true, "Price per person is required"],
      min: [0, "Price cannot be negative"],
    },
    availableDates: {
      type: [Date],
      default: [],
    },
    duration: {
      type: String, // e.g. "4 hours", "Full Day"
      default: "Full Day",
    },
    includes: {
      type: [String], // e.g. ["Catering", "Decoration", "Photography"]
      default: [],
    },
    requirements: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: null,
>>>>>>> main
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

<<<<<<< HEAD
module.exports = mongoose.model('Event', eventSchema);
=======
module.exports = mongoose.model("Event", eventSchema);
>>>>>>> main
