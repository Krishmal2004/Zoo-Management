const { body, param } = require('express-validator');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeSlotIdRule = [param('id').matches(objectIdPattern).withMessage('Invalid time slot ID')];

const createTimeSlotRules = [
  body('date').isISO8601().withMessage('date must be a valid ISO date'),
  body('startTime').matches(timePattern).withMessage('startTime must be in HH:mm format'),
  body('endTime').matches(timePattern).withMessage('endTime must be in HH:mm format'),
  body('photographer').matches(objectIdPattern).withMessage('Valid photographer ID is required'),
  body('capacity').isInt({ min: 1, max: 500 }).withMessage('capacity must be between 1 and 500'),
];

const updateTimeSlotRules = [
  ...timeSlotIdRule,
  body('date').optional().isISO8601().withMessage('date must be a valid ISO date'),
  body('startTime').optional().matches(timePattern).withMessage('startTime must be in HH:mm format'),
  body('endTime').optional().matches(timePattern).withMessage('endTime must be in HH:mm format'),
  body('photographer').optional().matches(objectIdPattern).withMessage('Invalid photographer ID'),
  body('capacity').optional().isInt({ min: 1, max: 500 }).withMessage('capacity must be between 1 and 500'),
  body('isBooked').optional().isBoolean().withMessage('isBooked must be boolean'),
];

module.exports = {
  timeSlotIdRule,
  createTimeSlotRules,
  updateTimeSlotRules,
};
