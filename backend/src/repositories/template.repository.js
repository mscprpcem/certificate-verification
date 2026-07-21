const { dbRun, dbAll, dbGet } = require("../config/database");

class TemplateRepository {
  async getTemplates() {
    return await dbAll("SELECT * FROM badge_templates ORDER BY id DESC");
  }

  async createTemplate(title, type, category, description, icon, skills) {
    return await dbRun(
      `INSERT INTO badge_templates (title, type, category, description, badge_icon, skills_list)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, type, category, description, icon, skills]
    );
  }

  async deleteTemplate(id) {
    return await dbRun("DELETE FROM badge_templates WHERE id = ?", [id]);
  }

  async getCollections() {
    return await dbAll("SELECT * FROM collections ORDER BY id DESC");
  }

  async createCollection(name, description, badgeIds) {
    return await dbRun(
      `INSERT INTO collections (name, description, badge_ids)
       VALUES (?, ?, ?)`,
      [name, description, badgeIds]
    );
  }

  async deleteCollection(id) {
    return await dbRun("DELETE FROM collections WHERE id = ?", [id]);
  }
}

module.exports = new TemplateRepository();
