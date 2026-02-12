// backend/src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const userController = require("../controllers/user.controller");
// IMPORT your auth middleware here.
// If your middleware file is at src/middleware/auth.middleware.js, require it like this:
const auth = require("../middlewares/auth.middleware");

// Use the imported `auth` in the routes
// router.get("/me", auth, controller.getMe);
router.get("/list", auth, controller.getOtherUsers);
router.get("/search", auth, controller.searchUsers);
router.get("/me", auth, controller.getProfile);
router.get("/all", auth, controller.getAllUsersForTransfer);

module.exports = router;
