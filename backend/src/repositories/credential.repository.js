const { dbRun, dbAll, dbGet } = require("../config/database");

class CredentialRepository {
  async findById(id) {
    return await dbGet("SELECT * FROM credentials WHERE id = ?", [id]);
  }

  async findBadgeById(id) {
    return await dbGet("SELECT * FROM credentials WHERE id = ? AND type = 'badge'", [id]);
  }

  async findByEmail(email) {
    return await dbAll("SELECT * FROM credentials WHERE LOWER(recipient_email) = ? ORDER BY issue_date DESC", [email.toLowerCase().trim()]);
  }

  async findByRecipientNameAndEvent(name, year, eventName) {
    const cleanName = (name || '').toLowerCase().trim();
    const cleanEvent = (eventName || '').toLowerCase().trim();
    const cleanYear = (year || '').trim();

    const typeCond = `(type = 'certificate' OR category = 'Event' OR category LIKE '%Event%')`;

    // 1. Primary search: Name AND Event Name title match (Top Priority)
    if (cleanEvent) {
      let sql = `SELECT * FROM credentials WHERE LOWER(recipient_name) = ? AND ${typeCond} AND LOWER(title) LIKE ?`;
      const params = [cleanName, `%${cleanEvent}%`];

      if (cleanYear) {
        let sqlWithYear = sql + ` AND (issue_date LIKE ? OR id LIKE ?) ORDER BY created_at DESC LIMIT 1`;
        const resWithYear = await dbGet(sqlWithYear, [...params, `%${cleanYear}%`, `%${cleanYear}%`]);
        if (resWithYear) return resWithYear;
      }

      sql += ` ORDER BY created_at DESC LIMIT 1`;
      const res = await dbGet(sql, params);
      if (res) return res;
    }

    // 2. Secondary search: Name AND Year match
    if (cleanYear) {
      let sql = `SELECT * FROM credentials WHERE LOWER(recipient_name) = ? AND ${typeCond} AND (issue_date LIKE ? OR id LIKE ?) ORDER BY created_at DESC LIMIT 1`;
      const res = await dbGet(sql, [cleanName, `%${cleanYear}%`, `%${cleanYear}%`]);
      if (res) return res;
    }

    // 3. Fallback search: Name match
    return await dbGet(
      `SELECT * FROM credentials WHERE LOWER(recipient_name) = ? AND ${typeCond} ORDER BY created_at DESC LIMIT 1`,
      [cleanName]
    );
  }

  async findByRecipientNameAndTeam(name, year) {
    if (!name || !name.trim() || !year || !year.trim()) {
      return null;
    }

    const cleanName = name.toLowerCase().trim();
    const cleanYear = year.trim();
    const firstYear = cleanYear.split('-')[0];

    return await dbGet(
      `SELECT * FROM credentials 
       WHERE LOWER(recipient_name) = ? 
       AND (type = 'badge' OR category = 'Team' OR category LIKE '%Team%')
       AND (issue_date LIKE ? OR issue_date LIKE ?)`,
      [cleanName, `%${cleanYear}%`, `%${firstYear}%`]
    );
  }

  async findByRecipientNameFirst(name) {
    return await dbGet("SELECT * FROM credentials WHERE LOWER(recipient_name) = ? LIMIT 1", [name.toLowerCase().trim()]);
  }

  async findByUserIdOrEmail(userId, email) {
    return await dbAll(
      "SELECT * FROM credentials WHERE LOWER(recipient_email) = ? OR user_id = ? ORDER BY created_at DESC",
      [email.toLowerCase(), userId]
    );
  }

  async updateUserIdByEmail(userId, email) {
    return await dbRun("UPDATE credentials SET user_id = ? WHERE LOWER(recipient_email) = ?", [userId, email.toLowerCase().trim()]);
  }

  async create(cred) {
    return await dbRun(
      `INSERT INTO credentials (id, recipient_name, recipient_email, user_id, type, title, category, domain, issue_date, description, badge_icon, skills_list, score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cred.id,
        cred.recipient_name,
        cred.recipient_email.toLowerCase().trim(),
        cred.user_id,
        cred.type,
        cred.title,
        cred.category,
        cred.domain || null,
        cred.issue_date,
        cred.description,
        cred.badge_icon,
        cred.skills_list,
        cred.score || null
      ]
    );
  }

  async delete(id) {
    return await dbRun("DELETE FROM credentials WHERE id = ?", [id]);
  }

  async findAll() {
    return await dbAll("SELECT * FROM credentials ORDER BY created_at DESC");
  }

  async findRecent() {
    return await dbAll("SELECT * FROM credentials ORDER BY created_at DESC LIMIT 5");
  }

  async getCertificatesCount() {
    const row = await dbGet("SELECT COUNT(*) as count FROM credentials WHERE type = 'certificate'");
    return row ? row.count : 0;
  }

  async getBadgesCount() {
    const row = await dbGet("SELECT COUNT(*) as count FROM credentials WHERE type = 'badge'");
    return row ? row.count : 0;
  }

  async getUniqueStudentsCount() {
    const row = await dbGet("SELECT COUNT(DISTINCT recipient_email) as count FROM credentials");
    return row ? row.count : 0;
  }

  async findSuggestions(credType, query) {
    const rows = await dbAll(
      "SELECT DISTINCT recipient_name FROM credentials WHERE type = ? AND recipient_name LIKE ? LIMIT 6",
      [credType, `%${query}%`]
    );
    return rows.map(r => r.recipient_name);
  }

  // Revoke logs
  async createRevocationLog(credId, name, email, type, title, category) {
    return await dbRun(
      `INSERT INTO revoked_credentials (credential_id, recipient_name, recipient_email, type, title, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [credId, name, email, type, title, category]
    );
  }

  async getRevokedList() {
    return await dbAll("SELECT * FROM revoked_credentials ORDER BY revoked_at DESC");
  }

  // Verification Requests & Logs
  async createVerificationLog(credId, ip, ua, status) {
    return await dbRun(
      "INSERT INTO verification_logs (credential_id, verifier_ip, verifier_user_agent, status) VALUES (?, ?, ?, ?)",
      [credId, ip, ua, status]
    );
  }

  async getVerificationLogs() {
    return await dbAll("SELECT * FROM verification_logs ORDER BY verified_at DESC");
  }

  async createVerificationRequest(name, email, type, title, category, evidence) {
    return await dbRun(
      `INSERT INTO verification_requests (student_name, student_email, credential_type, title, category, evidence_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [name, email, type, title, category, evidence]
    );
  }

  async getVerificationRequests() {
    return await dbAll("SELECT * FROM verification_requests ORDER BY submitted_at DESC");
  }

  async findVerificationRequestById(id) {
    return await dbGet("SELECT * FROM verification_requests WHERE id = ?", [id]);
  }

  async updateVerificationRequestReview(id, status, notes) {
    return await dbRun(
      "UPDATE verification_requests SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewer_notes = ? WHERE id = ?",
      [status, notes, id]
    );
  }
}

module.exports = new CredentialRepository();
