const asyncHandler = require('../utils/asyncHandler');

/** Prepared for Phase 2 — Online Store */
exports.getModuleInfo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Store module — prepared for Phase 2',
    data: { module: 'store' },
  });
});
