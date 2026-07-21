const express = require("express");
const router = express.Router();
const credentialController = require("../controllers/credential.controller");
const requireAuth = require("../middleware/auth.middleware");

// Public endpoints
router.get("/verify", credentialController.verify);
router.get("/suggest", credentialController.suggest);
router.get("/recent", credentialController.getRecent);

// Authenticated Student Wallet
router.get("/my", requireAuth, credentialController.getMyCredentials);

module.exports = router;
