const templateService = require("../services/template.service");

class TemplateController {
  async getTemplates(req, res, next) {
    try {
      const list = await templateService.getTemplates();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async createTemplate(req, res, next) {
    try {
      await templateService.createTemplate(req.body);
      res.json({ success: true, message: "Template created successfully." });
    } catch (err) {
      next(err);
    }
  }

  async deleteTemplate(req, res, next) {
    const { id } = req.params;
    try {
      await templateService.deleteTemplate(id);
      res.json({ success: true, message: "Template deleted successfully." });
    } catch (err) {
      next(err);
    }
  }

  async getCollections(req, res, next) {
    try {
      const list = await templateService.getCollections();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async createCollection(req, res, next) {
    try {
      await templateService.createCollection(req.body);
      res.json({ success: true, message: "Collection pathway created successfully." });
    } catch (err) {
      next(err);
    }
  }

  async deleteCollection(req, res, next) {
    const { id } = req.params;
    try {
      await templateService.deleteCollection(id);
      res.json({ success: true, message: "Collection deleted successfully." });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TemplateController();
