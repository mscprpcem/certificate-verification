const prisma = require("../config/database");

class ProfileRepository {
  async updateProfile(userId, name, bio, headline, profilePhoto, linkedinUrl, githubUrl, skillsJson) {
    const data = { bio, headline, linkedin_url: linkedinUrl, github_url: githubUrl, skills: skillsJson };
    if (name) data.name = name;
    if (profilePhoto) data.profile_photo = profilePhoto;

    return await prisma.user.update({
      where: { id: Number(userId) },
      data
    });
  }

  async createActivityLog(userId, action) {
    return await prisma.activityLog.create({
      data: {
        user_id: Number(userId),
        action
      }
    });
  }

  async getActivityLogs(userId) {
    return await prisma.activityLog.findMany({
      where: { user_id: Number(userId) },
      orderBy: { timestamp: 'desc' },
      take: 15
    });
  }

  async getAdminActivityLogs() {
    const logs = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });

    return logs.map(l => ({
      ...l,
      user_name: l.user ? l.user.name : 'Unknown',
      user_email: l.user ? l.user.email : 'Unknown'
    }));
  }

  async getSentEmails() {
    return await prisma.emailSent.findMany({
      orderBy: { sent_at: 'desc' },
      take: 8
    });
  }

  async logSentEmail(email, subject, body) {
    return await prisma.emailSent.create({
      data: {
        recipient_email: email,
        subject,
        body
      }
    });
  }
}

module.exports = new ProfileRepository();
