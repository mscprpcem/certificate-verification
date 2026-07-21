const credentialRepository = require("../repositories/credential.repository");

class AnalyticsService {
  constructor() {
    this.verifiedTodayCount = 0;
    this.downloadsTodayCount = 0;
    this.linkedinSharesCount = 0;
  }

  incrementVerifications() {
    this.verifiedTodayCount++;
  }

  incrementDownloads() {
    this.downloadsTodayCount++;
    return this.downloadsTodayCount;
  }

  incrementShares() {
    this.linkedinSharesCount++;
    return this.linkedinSharesCount;
  }

  async getMetrics() {
    const certsCount = await credentialRepository.getCertificatesCount();
    const badgesCount = await credentialRepository.getBadgesCount();
    const studentsCount = await credentialRepository.getUniqueStudentsCount();

    return {
      certificatesIssued: certsCount,
      badgesIssued: badgesCount,
      studentsCount: studentsCount,
      verifiedToday: this.verifiedTodayCount,
      downloadsToday: this.downloadsTodayCount,
      linkedinShares: this.linkedinSharesCount
    };
  }
}

module.exports = new AnalyticsService();
