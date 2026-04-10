const express = require('express');
const storeController = require('../controllers/store.controller');

const router = express.Router();

router.get('/', storeController.getModuleInfo);

module.exports = router;
