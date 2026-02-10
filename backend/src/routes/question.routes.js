const express = require("express");
const router = express.Router();
const controller = require("../controllers/question.controller");
const answerController = require("../controllers/answer.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/create", auth, controller.postQuestion);
router.get("/all", auth, controller.getAllQuestions);
router.get("/:id", auth, controller.getQuestionById);
// router.get("/:id", auth, controller.getQuestionById);

// 🔥 ADD THIS
router.get("/:id/answers", auth, answerController.getAnswers);

module.exports = router;
