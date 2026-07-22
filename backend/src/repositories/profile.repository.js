const { User, ActivityLog, EmailSent } = require("../models");

class ProfileRepository {
  async updateProfile(userId, name, bio, headline, profilePhoto, linkedinUrl, githubUrl, skillsJson) {
    const updateFields = { bio, headline, linkedin_url: linkedinUrl, github_url: githubUrl, skills: skillsJson };
    if (name) updateFields.name = name;
    if (profilePhoto) updateFields.profile_photo = profilePhoto;

    return await User.update(updateFields, { where: { id: userId } });
  }

  async createActivityLog(userId, action) {
    return await ActivityLog.create({
      user_id: userId,
      action: action
    });
  }

  async getActivityLogs(userId) {
    const logs = await ActivityLog.findAll({
      where: { user_id: userId },
      order: [['timestamp', 'DESC']],
      limit: 15
    });
    return logs.map(l => l.toJSON());
  }

  async getAdminActivityLogs() {
    const logs = await ActivityLog.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['timestamp', 'DESC']]
    });
    return logs.map(l => {
      const json = l.toJSON();
      json.user_name = json.User ? json.User.name : 'Unknown';
      json.user_email = json.User ? json.User.email : 'Unknown';
      return json;
    });
  }

  async getSentEmails() {
    const emails = await EmailSent.findAll({
      order: [['sent_at', 'DESC']],
      limit: 8
    });
    return emails.map(e => e.toJSON());
  }

  async logSentEmail(email, subject, body) {
    return await EmailSent.create({
      recipient_email: email,
      subject: subject,
      body: body
    });
  }
}

module.exports = new ProfileRepository();
