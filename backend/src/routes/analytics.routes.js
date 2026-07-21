const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");

router.get("/metrics", analyticsController.getMetrics);
router.post("/increment-download", analyticsController.incrementDownload);
router.post("/increment-share", analyticsController.incrementShare);

module.exports = router;
