const templateRepository = require("../repositories/template.repository");

class TemplateService {
  async getTemplates() {
    return await templateRepository.getTemplates();
  }

  async createTemplate(data) {
    const { title, type, category, description, badge_icon, skills_list } = data;
    return await templateRepository.createTemplate(title, type, category, description, badge_icon, skills_list);
  }

  async deleteTemplate(id) {
    return await templateRepository.deleteTemplate(id);
  }

  async getCollections() {
    return await templateRepository.getCollections();
  }

  async createCollection(data) {
    const { name, description, badge_ids } = data;
    return await templateRepository.createCollection(name, description, badge_ids);
  }

  async deleteCollection(id) {
    return await templateRepository.deleteCollection(id);
  }
}

module.exports = new TemplateService();
