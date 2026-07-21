const analyticsService = require("../services/analytics.service");

class AnalyticsController {
  async getMetrics(req, res, next) {
    try {
      const metrics = await analyticsService.getMetrics();
      res.json(metrics);
    } catch (err) {
      next(err);
    }
  }

  incrementDownload(req, res, next) {
    const downloadsToday = analyticsService.incrementDownloads();
    res.json({ downloadsToday });
  }

  incrementShare(req, res, next) {
    const linkedinShares = analyticsService.incrementShares();
    res.json({ linkedinShares });
  }
}

module.exports = new AnalyticsController();
