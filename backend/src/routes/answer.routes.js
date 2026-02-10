const express = require("express");
console.log("✅ answer.routes.js LOADED");
// const router = express.Router();
// const controller = require("../controllers/answer.controller");
// const auth = require("../middlewares/auth.middleware");

// router.get("/:id/answers", auth, controller.getAnswers);
// router.post("/add", auth, controller.addAnswer);
// router.post("/upvote", auth, controller.upvoteAnswer);
// router.post("/downvote", auth, controller.downvoteAnswer);
// router.delete("/delete", auth, controller.deleteAnswer);

// module.exports = router;
// const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/answer.controller");

// GET answers for a question
router.get("/:id/answers", auth, controller.getAnswers);

// ADD answer
router.post("/add", auth, controller.addAnswer);

// UPVOTE
router.post("/upvote", auth, controller.upvoteAnswer);

// DOWNVOTE
router.post("/downvote", auth, controller.downvoteAnswer);

// DELETE answer
router.delete("/delete", auth, controller.deleteAnswer);

module.exports = router;
