'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../app/controllers/CorrRegController');
const authMiddleware = require('../app/middlewares/auth');

router.use(authMiddleware);

router.post('/corr_reg', controller.corrReg);
router.post('/save', controller.save);

module.exports = router;
