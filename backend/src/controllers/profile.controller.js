const profileRepository = require("../repositories/profile.repository");

class ProfileController {
  async updateProfile(req, res, next) {
    const { bio, headline, linkedin_url, github_url, skills } = req.body;
    const userId = req.session.userId;

    try {
      const skillsJson = typeof skills === "object" ? JSON.stringify(skills) : skills;
      await profileRepository.updateProfile(userId, bio, headline, linkedin_url, github_url, skillsJson || "{}");
      await profileRepository.createActivityLog(userId, "Updated profile bio & links");
      res.json({ message: "Profile details updated successfully." });
    } catch (err) {
      next(err);
    }
  }

  async getActivityFeed(req, res, next) {
    try {
      const list = await profileRepository.getActivityLogs(req.session.userId);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getAdminActivityLogs(req, res, next) {
    try {
      const list = await profileRepository.getAdminActivityLogs();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getRecentSentEmails(req, res, next) {
    try {
      const list = await profileRepository.getSentEmails();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfileController();
