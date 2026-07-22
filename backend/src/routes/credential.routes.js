const express = require("express");
const router = express.Router();
const credentialController = require("../controllers/credential.controller");
const badgeCatalogController = require("../controllers/badgeCatalog.controller");
const requireAuth = require("../middleware/auth.middleware");

// Public endpoints
router.get("/verify", credentialController.verify);
router.get("/suggest", credentialController.suggest);
router.get("/recent", credentialController.getRecent);
router.get("/badge-catalog", badgeCatalogController.getPublicBadges);
router.get("/:id/render", credentialController.renderSVG);
router.get("/:id/svg", credentialController.renderSVG);

// Authenticated Student Wallet
router.get("/my", requireAuth, credentialController.getMyCredentials);

module.exports = router;
