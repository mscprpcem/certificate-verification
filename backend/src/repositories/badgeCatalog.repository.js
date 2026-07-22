const { BadgeCatalog } = require("../models");

class BadgeCatalogRepository {
  async getPublicBadges() {
    const badges = await BadgeCatalog.findAll({
      where: { is_hidden: 0 },
      order: [['id', 'DESC']]
    });
    return badges.map(b => b.toJSON());
  }

  async getAllBadges() {
    const badges = await BadgeCatalog.findAll({
      order: [['id', 'DESC']]
    });
    return badges.map(b => b.toJSON());
  }

  async getBadgeById(id) {
    const badge = await BadgeCatalog.findByPk(id);
    return badge ? badge.toJSON() : null;
  }

  async createBadge(data) {
    const code = data.badge_code || `MSC-BDG-${Math.floor(1000 + Math.random() * 9000)}`;
    const badge = await BadgeCatalog.create({
      ...data,
      badge_code: code,
      earners_count: Number(data.earners_count) || 0,
      is_hidden: data.is_hidden ? 1 : 0
    });
    return badge.id;
  }

  async updateBadge(id, data) {
    return await BadgeCatalog.update(
      {
        ...data,
        earners_count: Number(data.earners_count) || 0,
        is_hidden: data.is_hidden ? 1 : 0
      },
      { where: { id } }
    );
  }

  async toggleVisibility(id) {
    const badge = await BadgeCatalog.findByPk(id);
    if (!badge) return null;
    const newVisibility = badge.is_hidden === 1 ? 0 : 1;
    return await badge.update({ is_hidden: newVisibility });
  }

  async deleteBadge(id) {
    return await BadgeCatalog.destroy({ where: { id } });
  }
}

module.exports = new BadgeCatalogRepository();
