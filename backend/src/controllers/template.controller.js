const azureBlobService = require("../services/azureBlob.service");
const { CertificateTemplate, BadgeTemplate, Collection } = require("../models");

class TemplateController {
  async uploadSVGTemplate(req, res, next) {
    const { name, svgContent, category = "Event", is_default = false } = req.body;

    if (!name || !svgContent) {
      return res.status(400).json({ error: "Template 'name' and 'svgContent' string are required." });
    }

    try {
      // 1. Store SVG in Azure Blob Storage
      const templateUrl = await azureBlobService.uploadSVGTemplate(name, svgContent);

      // 2. Save Metadata in Neon PostgreSQL
      const template = await CertificateTemplate.create({
        name,
        template_url: templateUrl,
        category,
        is_default: Boolean(is_default)
      });

      res.status(201).json({
        success: true,
        message: "SVG template successfully uploaded to Azure Blob Storage and metadata saved to Neon PostgreSQL.",
        template: template.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  async getTemplates(req, res, next) {
    try {
      const templates = await CertificateTemplate.findAll({
        order: [["created_at", "DESC"]]
      });
      res.json(templates.map(t => t.toJSON()));
    } catch (err) {
      next(err);
    }
  }

  async createTemplate(req, res, next) {
    try {
      const template = await BadgeTemplate.create(req.body);
      res.status(201).json(template.toJSON());
    } catch (err) {
      next(err);
    }
  }

  async deleteTemplate(req, res, next) {
    const { id } = req.params;
    try {
      await BadgeTemplate.destroy({ where: { id } });
      await CertificateTemplate.destroy({ where: { id } });
      res.json({ message: `Template ${id} deleted successfully.` });
    } catch (err) {
      next(err);
    }
  }

  async getCollections(req, res, next) {
    try {
      const collections = await Collection.findAll({ order: [["created_at", "DESC"]] });
      res.json(collections.map(c => c.toJSON()));
    } catch (err) {
      next(err);
    }
  }

  async createCollection(req, res, next) {
    try {
      const collection = await Collection.create(req.body);
      res.status(201).json(collection.toJSON());
    } catch (err) {
      next(err);
    }
  }

  async deleteCollection(req, res, next) {
    const { id } = req.params;
    try {
      await Collection.destroy({ where: { id } });
      res.json({ message: `Collection ${id} deleted successfully.` });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TemplateController();
