const { Credential, VerificationRequest, VerificationLog, RevokedCredential, sequelize } = require("../models");
const { Op } = require("sequelize");

class CredentialRepository {
  async findById(id) {
    const cred = await Credential.findByPk(id);
    return cred ? cred.toJSON() : null;
  }

  async findBadgeById(id) {
    const cred = await Credential.findOne({
      where: { id, type: 'badge' }
    });
    return cred ? cred.toJSON() : null;
  }

  async findByEmail(email) {
    if (!email) return [];
    const creds = await Credential.findAll({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('recipient_email')), email.toLowerCase().trim()),
      order: [['issue_date', 'DESC']]
    });
    return creds.map(c => c.toJSON());
  }

  async findByRecipientNameAndEvent(name, year, eventName) {
    const cleanName = (name || '').toLowerCase().trim();
    const cleanEvent = (eventName || '').toLowerCase().trim();
    const cleanYear = (year || '').trim();

    const creds = await Credential.findAll({
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('recipient_name')), cleanName),
          {
            [Op.or]: [
              { type: 'certificate' },
              { category: 'Event' },
              { category: { [Op.like]: '%Event%' } }
            ]
          }
        ]
      },
      order: [['created_at', 'DESC']]
    });

    const list = creds.map(c => c.toJSON());
    if (cleanEvent) {
      const match = list.find(c => (c.title || '').toLowerCase().includes(cleanEvent));
      if (match) return match;
    }
    if (cleanYear) {
      const match = list.find(c => (c.issue_date || '').includes(cleanYear) || (c.id || '').includes(cleanYear));
      if (match) return match;
    }
    return list[0] || null;
  }

  async findByRecipientNameAndTeam(name, year) {
    if (!name || !year) return null;
    const cleanName = name.toLowerCase().trim();
    const cleanYear = year.trim();
    const firstYear = cleanYear.split('-')[0];

    const cred = await Credential.findOne({
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('recipient_name')), cleanName),
          {
            [Op.or]: [
              { type: 'badge' },
              { category: 'Team' },
              { category: { [Op.like]: '%Team%' } }
            ]
          },
          {
            [Op.or]: [
              { issue_date: { [Op.like]: `%${cleanYear}%` } },
              { issue_date: { [Op.like]: `%${firstYear}%` } }
            ]
          }
        ]
      }
    });
    return cred ? cred.toJSON() : null;
  }

  async findByRecipientNameFirst(name) {
    if (!name) return null;
    const cred = await Credential.findOne({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('recipient_name')), name.toLowerCase().trim())
    });
    return cred ? cred.toJSON() : null;
  }

  async findByUserIdOrEmail(userId, email) {
    const creds = await Credential.findAll({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('recipient_email')), (email || '').toLowerCase().trim()),
          { user_id: userId || null }
        ]
      },
      order: [['created_at', 'DESC']]
    });
    return creds.map(c => c.toJSON());
  }

  async updateUserIdByEmail(userId, email) {
    if (!email) return null;
    return await Credential.update(
      { user_id: userId },
      {
        where: sequelize.where(sequelize.fn('LOWER', sequelize.col('recipient_email')), email.toLowerCase().trim())
      }
    );
  }

  async create(credData) {
    const cred = await Credential.create({
      id: credData.id,
      recipient_name: credData.recipient_name,
      recipient_email: credData.recipient_email.toLowerCase().trim(),
      user_id: credData.user_id || null,
      type: credData.type,
      title: credData.title,
      category: credData.category,
      domain: credData.domain || null,
      issue_date: credData.issue_date,
      description: credData.description,
      badge_icon: credData.badge_icon,
      skills_list: credData.skills_list || '',
      score: credData.score || null
    });
    return cred.id;
  }

  async delete(id) {
    return await Credential.destroy({ where: { id } });
  }

  async findAll() {
    const creds = await Credential.findAll({ order: [['created_at', 'DESC']] });
    return creds.map(c => c.toJSON());
  }

  async findRecent() {
    const creds = await Credential.findAll({
      order: [['created_at', 'DESC']],
      limit: 5
    });
    return creds.map(c => c.toJSON());
  }

  async getCertificatesCount() {
    return await Credential.count({ where: { type: 'certificate' } });
  }

  async getBadgesCount() {
    return await Credential.count({ where: { type: 'badge' } });
  }

  async getUniqueStudentsCount() {
    return await Credential.count({
      distinct: true,
      col: 'recipient_email'
    });
  }

  async findSuggestions(credType, query) {
    const creds = await Credential.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('recipient_name')), 'recipient_name']],
      where: {
        type: credType,
        recipient_name: { [Op.like]: `%${query}%` }
      },
      limit: 6
    });
    return creds.map(c => c.recipient_name);
  }

  // Revoke logs
  async createRevocationLog(credId, name, email, type, title, category) {
    return await RevokedCredential.create({
      credential_id: credId,
      recipient_name: name,
      recipient_email: email,
      type: type,
      title: title,
      category: category
    });
  }

  async getRevokedList() {
    const logs = await RevokedCredential.findAll({ order: [['revoked_at', 'DESC']] });
    return logs.map(l => l.toJSON());
  }

  // Verification Requests & Logs
  async createVerificationLog(credId, ip, ua, status) {
    return await VerificationLog.create({
      credential_id: credId,
      verifier_ip: ip,
      verifier_user_agent: ua,
      status: status
    });
  }

  async getVerificationLogs() {
    const logs = await VerificationLog.findAll({ order: [['verified_at', 'DESC']] });
    return logs.map(l => l.toJSON());
  }

  async createVerificationRequest(name, email, type, title, category, evidence) {
    return await VerificationRequest.create({
      student_name: name,
      student_email: email,
      credential_type: type,
      title: title,
      category: category,
      evidence_url: evidence,
      status: 'pending'
    });
  }

  async getVerificationRequests() {
    const reqs = await VerificationRequest.findAll({ order: [['submitted_at', 'DESC']] });
    return reqs.map(r => r.toJSON());
  }

  async findVerificationRequestById(id) {
    const req = await VerificationRequest.findByPk(id);
    return req ? req.toJSON() : null;
  }

  async updateVerificationRequestReview(id, status, notes) {
    return await VerificationRequest.update(
      {
        status: status,
        reviewed_at: new Date(),
        reviewer_notes: notes
      },
      { where: { id } }
    );
  }
}

module.exports = new CredentialRepository();
