'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../app/controllers/descriptiveController');
const authMiddleware = require('../app/middlewares/auth');

router.use(authMiddleware);

router.post('/simple_frequency', controller.simpleFrequency);
router.get('/user_simple_frequency', controller.userSimpleFrequency);
router.post('/save', controller.save);

module.exports = router;
