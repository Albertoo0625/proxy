const express = require('express');
const router = express.Router();
const controller = require('../controllers/streamController');

router.post('/', controller.handleRequest);

module.exports = router;
