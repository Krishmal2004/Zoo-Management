const asyncHandler = require('../utils/asyncHandler');

/** Prepared for Phase 2 — Ticket & Show Management */
exports.getModuleInfo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ticket & Show module — prepared for Phase 2',
    data: { module: 'ticketShow' },
  });
});
