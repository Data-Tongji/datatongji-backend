"use strict";

const express = require("express");
const router = express.Router();
const controller = require("../app/controllers/authController");

router.get("/get_user", controller.getUser);
router.get("/get_user_config", controller.getUserConfig);
router.post("/user_config", controller.userConfig);
router.post("/register", controller.register);
router.post("/authenticate", controller.authenticate);
router.post("/authenticate_token", controller.authenticateToken);
router.post("/forgot_password", controller.forgotPassword);
router.put("/reset_password", controller.resetPassword);
router.post("/talk_with_us", controller.talkwithus);
router.post("/valid_token", controller.validToken);
router.put("/updateuser", controller.updateuser);

module.exports = router;
