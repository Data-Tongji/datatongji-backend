'use strict'

const express = require('express');
const router = express.Router();
const multer = require("multer");
const controller = require('../app/controllers/UserPhotoController');
const multerConfig = require("../config/multer");
// const authMiddleware = require('../app/middlewares/auth');

// router.use(authMiddleware);

router.get("/posts",  controller.getPhoto);
router.post("/posts", multer(multerConfig).single("file"), controller.post);
router.delete("/posts/:id", controller.delete);

module.exports = router;
