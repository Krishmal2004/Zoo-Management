const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const { registerRules, loginRules } = require('../validations/auth.validation');
const validateRequest = require('../validations/validateRequest');

const router = express.Router();

router.post('/register', requireDatabase, registerRules, validateRequest, authController.register);
router.post('/login', requireDatabase, loginRules, validateRequest, authController.login);
router.get('/me', requireDatabase, protect, authController.getMe);

module.exports = router;
