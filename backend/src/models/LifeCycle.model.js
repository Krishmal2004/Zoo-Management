const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
  stageName: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: true });

const lifeCycleSchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Life Cycle',
    },
    stages: {
      type: [stageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LifeCycle', lifeCycleSchema);
