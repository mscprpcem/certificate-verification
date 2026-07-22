const express = require("express");
const router = express.Router();
const templateController = require("../controllers/template.controller");
const requireAuth = require("../middleware/auth.middleware");

router.get("/", templateController.getTemplates);
router.post("/upload-svg", requireAuth, templateController.uploadSVGTemplate);

module.exports = router;
