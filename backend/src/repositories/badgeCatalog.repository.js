const prisma = require("../config/database");

class BadgeCatalogRepository {
  async getPublicBadges() {
    return await prisma.badgeCatalog.findMany({
      where: { is_hidden: 0 },
      orderBy: { id: 'desc' }
    });
  }

  async getAllBadges() {
    return await prisma.badgeCatalog.findMany({
      orderBy: { id: 'desc' }
    });
  }

  async getBadgeById(id) {
    return await prisma.badgeCatalog.findUnique({
      where: { id: Number(id) }
    });
  }

  async createBadge(data) {
    const code = data.badge_code || `MSC-BDG-${Math.floor(1000 + Math.random() * 9000)}`;
    const badge = await prisma.badgeCatalog.create({
      data: {
        ...data,
        badge_code: code,
        earners_count: Number(data.earners_count) || 0,
        is_hidden: data.is_hidden ? 1 : 0
      }
    });
    return badge.id;
  }

  async updateBadge(id, data) {
    return await prisma.badgeCatalog.update({
      where: { id: Number(id) },
      data: {
        ...data,
        earners_count: Number(data.earners_count) || 0,
        is_hidden: data.is_hidden ? 1 : 0
      }
    });
  }

  async toggleVisibility(id) {
    const badge = await prisma.badgeCatalog.findUnique({ where: { id: Number(id) } });
    if (!badge) return null;
    return await prisma.badgeCatalog.update({
      where: { id: Number(id) },
      data: { is_hidden: badge.is_hidden === 1 ? 0 : 1 }
    });
  }

  async deleteBadge(id) {
    return await prisma.badgeCatalog.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = new BadgeCatalogRepository();
