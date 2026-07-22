const { dbRun, dbAll, dbGet } = require("../config/database");

class BadgeCatalogRepository {
  async getPublicBadges() {
    return await dbAll("SELECT * FROM badge_catalog WHERE is_hidden = 0 ORDER BY id DESC");
  }

  async getAllBadges() {
    return await dbAll("SELECT * FROM badge_catalog ORDER BY id DESC");
  }

  async getBadgeById(id) {
    return await dbGet("SELECT * FROM badge_catalog WHERE id = ?", [id]);
  }

  async createBadge(data) {
    const {
      badge_code,
      title,
      organization = 'Microsoft Student Club PRPCEM',
      release_date = 'Jul 2026',
      category = 'Programming & Logic',
      level = 'Intermediate',
      icon = 'fa-trophy',
      gradient = 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bg_light = '#ecfdf5',
      accent_color = '#059669',
      description = '',
      criteria = '',
      skills_list = '',
      earners_count = 0,
      issuance_frequency = 'Weekly',
      is_hidden = 0
    } = data;

    const code = badge_code || `MSC-BDG-${Math.floor(1000 + Math.random() * 9000)}`;

    return await dbRun(
      `INSERT INTO badge_catalog (badge_code, title, organization, release_date, category, level, icon, gradient, bg_light, accent_color, description, criteria, skills_list, earners_count, issuance_frequency, is_hidden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, title, organization, release_date, category, level, icon, gradient, bg_light, accent_color, description, criteria, skills_list, Number(earners_count) || 0, issuance_frequency, is_hidden ? 1 : 0]
    );
  }

  async updateBadge(id, data) {
    const {
      badge_code,
      title,
      organization,
      release_date,
      category,
      level,
      icon,
      gradient,
      bg_light,
      accent_color,
      description,
      criteria,
      skills_list,
      earners_count,
      issuance_frequency,
      is_hidden
    } = data;

    return await dbRun(
      `UPDATE badge_catalog 
       SET badge_code = ?, title = ?, organization = ?, release_date = ?, category = ?, level = ?, icon = ?, gradient = ?, bg_light = ?, accent_color = ?, description = ?, criteria = ?, skills_list = ?, earners_count = ?, issuance_frequency = ?, is_hidden = ?
       WHERE id = ?`,
      [badge_code, title, organization, release_date, category, level, icon, gradient, bg_light, accent_color, description, criteria, skills_list, Number(earners_count) || 0, issuance_frequency, is_hidden ? 1 : 0, id]
    );
  }

  async toggleVisibility(id) {
    return await dbRun("UPDATE badge_catalog SET is_hidden = CASE WHEN is_hidden = 1 THEN 0 ELSE 1 END WHERE id = ?", [id]);
  }

  async deleteBadge(id) {
    return await dbRun("DELETE FROM badge_catalog WHERE id = ?", [id]);
  }
}

module.exports = new BadgeCatalogRepository();
