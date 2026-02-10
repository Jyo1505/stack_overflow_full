const express = require("express");
const router = express.Router();
const controller = require("../controllers/friend.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/request", auth, controller.sendRequest);
router.get("/requests", auth, controller.getIncomingRequests);
router.post("/accept", auth, controller.acceptRequest);
router.get("/list", auth, controller.getFriends);

// ✅ ADD THIS
router.post("/remove", auth, controller.removeFriend);

module.exports = router;
