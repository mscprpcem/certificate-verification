const express = require("express");
const router = express.Router();
const credentialController = require("../controllers/credential.controller");
const userController = require("../controllers/user.controller");
const templateController = require("../controllers/template.controller");
const profileController = require("../controllers/profile.controller");
const requireAdmin = require("../middleware/role.middleware")("admin");

// Apply admin role middleware to all admin routes
router.use(requireAdmin);

// Credentials
router.get("/credentials", credentialController.getAll);
router.post("/credentials", credentialController.issue);
router.delete("/credentials/:id", credentialController.revoke);
router.get("/revoked", credentialController.getRevoked);
router.post("/bulk-issue", credentialController.bulkIssue);

// Users
router.get("/users", userController.getAdminUsers);
router.post("/users/:id/role", userController.updateRole);

// Verification claims review
router.get("/verification-requests", credentialController.getClaims);
router.post("/verification-requests/:id/review", credentialController.reviewClaim);
router.get("/verification-logs", credentialController.getVerificationLogs);

// Activity/Audit
router.get("/activity-logs", profileController.getAdminActivityLogs);

// Badge Templates & Pathways
router.get("/templates", templateController.getTemplates);
router.post("/templates", templateController.createTemplate);
router.delete("/templates/:id", templateController.deleteTemplate);

router.get("/collections", templateController.getCollections);
router.post("/collections", templateController.createCollection);
router.delete("/collections/:id", templateController.deleteCollection);

module.exports = router;
