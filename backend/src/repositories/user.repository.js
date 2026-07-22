const { dbRun, dbAll, dbGet } = require("../config/database");

class UserRepository {
  async findById(id) {
    return await dbGet("SELECT * FROM users WHERE id = ?", [id]);
  }

  async findByEmail(email) {
    return await dbGet("SELECT * FROM users WHERE LOWER(email) = ?", [email.toLowerCase().trim()]);
  }

  async create(user) {
    const result = await dbRun(
      `INSERT INTO users (name, email, password_hash, role, bio, headline, profile_photo, linkedin_url, github_url, skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.name,
        user.email.toLowerCase().trim(),
        user.password_hash,
        user.role,
        user.bio,
        user.headline,
        user.profile_photo,
        user.linkedin_url,
        user.github_url,
        user.skills
      ]
    );
    return result.lastID;
  }

  async updatePassword(id, passwordHash) {
    return await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
  }

  async updateLazyProfile(id, name, passwordHash) {
    return await dbRun("UPDATE users SET name = ?, password_hash = ? WHERE id = ?", [name, passwordHash, id]);
  }

  async updateRole(id, role) {
    return await dbRun("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  }

  async getAdminUsersDirectory() {
    return await dbAll(`
      SELECT u.id, u.name, u.email, u.role, u.bio, u.headline, u.profile_photo, u.linkedin_url, u.github_url, u.skills, u.created_at,
             COUNT(c.id) as credentials_count,
             SUM(CASE WHEN c.type = 'certificate' THEN 1 ELSE 0 END) as certificates_count,
             SUM(CASE WHEN c.type = 'badge' THEN 1 ELSE 0 END) as badges_count
      FROM users u
      LEFT JOIN credentials c ON u.id = c.user_id OR LOWER(u.email) = LOWER(c.recipient_email)
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
  }
}

module.exports = new UserRepository();
