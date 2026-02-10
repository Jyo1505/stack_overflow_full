const express = require("express");
const router = express.Router();
const controller = require("../controllers/password.controller");

router.post("/forgot", controller.forgotPassword);
router.post("/generate", controller.generatePassword);
router.post("/update", controller.updatePassword);

module.exports = router;
