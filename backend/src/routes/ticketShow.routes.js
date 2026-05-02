const express = require('express');
const ticketShowController = require('../controllers/ticketShow.controller');

const router = express.Router();

router.get('/', ticketShowController.getModuleInfo);

module.exports = router;
