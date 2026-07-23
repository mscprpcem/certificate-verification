const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.get("/check-username", authController.checkUsername);
// Public registration removed — only admins can create accounts
router.post("/login", authController.login);
router.post("/lazy-login", authController.lazyLogin);
router.get("/me", authController.getMe);
router.get("/logout", authController.logout);

module.exports = router;

