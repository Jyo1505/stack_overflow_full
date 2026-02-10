const express = require("express");
const router = express.Router();
const controller = require("../controllers/subscription.controller");
const auth = require("../middlewares/auth.middleware");

// const auth = require("../middlewares/auth");

router.post("/buy", auth, controller.buyPlan);
router.get("/me", auth, controller.getMyPlan);

module.exports = router;
