const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const requireAuth = require("../middleware/auth.middleware");

router.post("/update", requireAuth, profileController.updateProfile);
router.get("/activity", requireAuth, profileController.getActivityFeed);

module.exports = router;
