const badgeCatalogService = require("../services/badgeCatalog.service");

class BadgeCatalogController {
  async getPublicBadges(req, res, next) {
    try {
      const list = await badgeCatalogService.getPublicBadges();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getAllBadges(req, res, next) {
    try {
      const list = await badgeCatalogService.getAllBadges();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async createBadge(req, res, next) {
    try {
      await badgeCatalogService.createBadge(req.body);
      res.json({ success: true, message: "Badge catalog item created successfully." });
    } catch (err) {
      next(err);
    }
  }

  async updateBadge(req, res, next) {
    const { id } = req.params;
    try {
      await badgeCatalogService.updateBadge(id, req.body);
      res.json({ success: true, message: "Badge updated successfully." });
    } catch (err) {
      next(err);
    }
  }

  async toggleVisibility(req, res, next) {
    const { id } = req.params;
    try {
      await badgeCatalogService.toggleVisibility(id);
      res.json({ success: true, message: "Badge visibility toggled." });
    } catch (err) {
      next(err);
    }
  }

  async deleteBadge(req, res, next) {
    const { id } = req.params;
    try {
      await badgeCatalogService.deleteBadge(id);
      res.json({ success: true, message: "Badge deleted successfully." });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BadgeCatalogController();
