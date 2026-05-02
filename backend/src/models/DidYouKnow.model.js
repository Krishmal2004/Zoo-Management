const mongoose = require('mongoose');

const didYouKnowSchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: true,
    },
    fact: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DidYouKnow', didYouKnowSchema);
