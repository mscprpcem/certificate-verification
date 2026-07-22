const azureBlobService = require("../services/azureBlob.service");
const prisma = require("../config/database");

class TemplateController {
  async uploadSVGTemplate(req, res, next) {
    const { name, svgContent, category = "Event", is_default = false } = req.body;

    if (!name || !svgContent) {
      return res.status(400).json({ error: "Template 'name' and 'svgContent' string are required." });
    }

    try {
      // 1. Store SVG in Azure Blob Storage
      const templateUrl = await azureBlobService.uploadSVGTemplate(name, svgContent);

      // 2. Save Metadata in Neon PostgreSQL via Prisma
      const template = await prisma.certificateTemplate.create({
        data: {
          name,
          template_url: templateUrl,
          category,
          is_default: Boolean(is_default)
        }
      });

      res.status(201).json({
        success: true,
        message: "SVG template successfully uploaded to Azure Blob Storage and metadata saved to Neon PostgreSQL via Prisma.",
        template
      });
    } catch (err) {
      next(err);
    }
  }

  async getTemplates(req, res, next) {
    try {
      const templates = await prisma.certificateTemplate.findMany({
        orderBy: { created_at: "desc" }
      });
      res.json(templates);
    } catch (err) {
      next(err);
    }
  }

  async createTemplate(req, res, next) {
    try {
      const template = await prisma.badgeTemplate.create({
        data: req.body
      });
      res.status(201).json(template);
    } catch (err) {
      next(err);
    }
  }

  async deleteTemplate(req, res, next) {
    const { id } = req.params;
    try {
      await prisma.badgeTemplate.deleteMany({ where: { id: Number(id) } });
      await prisma.certificateTemplate.deleteMany({ where: { id: Number(id) } });
      res.json({ message: `Template ${id} deleted successfully.` });
    } catch (err) {
      next(err);
    }
  }

  async getCollections(req, res, next) {
    try {
      const collections = await prisma.collection.findMany({
        orderBy: { created_at: "desc" }
      });
      res.json(collections);
    } catch (err) {
      next(err);
    }
  }

  async createCollection(req, res, next) {
    try {
      const collection = await prisma.collection.create({
        data: req.body
      });
      res.status(201).json(collection);
    } catch (err) {
      next(err);
    }
  }

  async deleteCollection(req, res, next) {
    const { id } = req.params;
    try {
      await prisma.collection.delete({ where: { id: Number(id) } });
      res.json({ message: `Collection ${id} deleted successfully.` });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TemplateController();
