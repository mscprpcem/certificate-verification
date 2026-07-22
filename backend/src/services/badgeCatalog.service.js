const badgeCatalogRepository = require("../repositories/badgeCatalog.repository");

class BadgeCatalogService {
  async getPublicBadges() {
    return await badgeCatalogRepository.getPublicBadges();
  }

  async getAllBadges() {
    return await badgeCatalogRepository.getAllBadges();
  }

  async createBadge(data) {
    return await badgeCatalogRepository.createBadge(data);
  }

  async updateBadge(id, data) {
    return await badgeCatalogRepository.updateBadge(id, data);
  }

  async toggleVisibility(id) {
    return await badgeCatalogRepository.toggleVisibility(id);
  }

  async deleteBadge(id) {
    return await badgeCatalogRepository.deleteBadge(id);
  }
}

module.exports = new BadgeCatalogService();
