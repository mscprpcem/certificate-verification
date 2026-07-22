const { dbRun, dbAll, dbGet } = require("../config/database");

class ProfileRepository {
  async updateProfile(userId, name, bio, headline, profilePhoto, linkedinUrl, githubUrl, skillsJson) {
    return await dbRun(
      `UPDATE users 
       SET name = COALESCE(?, name), bio = ?, headline = ?, profile_photo = COALESCE(?, profile_photo), linkedin_url = ?, github_url = ?, skills = ?
       WHERE id = ?`,
      [name, bio, headline, profilePhoto, linkedinUrl, githubUrl, skillsJson, userId]
    );
  }

  async createActivityLog(userId, action) {
    return await dbRun("INSERT INTO activity_logs (user_id, action) VALUES (?, ?)", [userId, action]);
  }

  async getActivityLogs(userId) {
    return await dbAll(
      "SELECT * FROM activity_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 15",
      [userId]
    );
  }

  async getAdminActivityLogs() {
    return await dbAll(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
    `);
  }

  async getSentEmails() {
    return await dbAll("SELECT * FROM emails_sent ORDER BY sent_at DESC LIMIT 8");
  }

  async logSentEmail(email, subject, body) {
    return await dbRun(
      "INSERT INTO emails_sent (recipient_email, subject, body) VALUES (?, ?, ?)",
      [email, subject, body]
    );
  }
}

module.exports = new ProfileRepository();
