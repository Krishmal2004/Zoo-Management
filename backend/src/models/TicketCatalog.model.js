const mongoose = require('mongoose');

const ticketCatalogSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Catalog code is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Catalog name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['entry', 'show'],
      required: [true, 'Catalog category is required'],
    },
    priceLkr: {
      type: Number,
      required: [true, 'Catalog price is required'],
      min: [0, 'Catalog price must be 0 or greater'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TicketCatalog', ticketCatalogSchema);
