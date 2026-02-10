const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/points.controller");

router.post("/transfer", auth, controller.transferPoints);

module.exports = router;
