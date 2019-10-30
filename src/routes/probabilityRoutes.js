'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../app/controllers/probabilityController');
const authMiddleware = require('../app/middlewares/auth');

router.use(authMiddleware);

router.post('/binomial', controller.binomial);
router.post('/normal', controller.normal);
router.post('/uniform', controller.uniform);
router.post('/save', controller.uniform);

module.exports = router;
