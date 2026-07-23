const prisma = require("../config/database");

class CredentialRepository {
  async findById(id) {
    if (!id) return null;
    return await prisma.credential.findUnique({
      where: { id }
    });
  }

  async findBadgeById(id) {
    if (!id) return null;
    return await prisma.credential.findFirst({
      where: { id, type: 'badge' }
    });
  }

  async findByEmail(email) {
    if (!email) return [];
    return await prisma.credential.findMany({
      where: {
        recipient_email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive'
        }
      },
      orderBy: { issue_date: 'desc' }
    });
  }

  async findByRecipientNameAndEvent(name, year, eventName) {
    const cleanName = (name || '').toLowerCase().trim();
    const cleanEvent = (eventName || '').toLowerCase().trim();
    const cleanYear = (year || '').trim();

    const creds = await prisma.credential.findMany({
      where: {
        recipient_name: {
          equals: cleanName,
          mode: 'insensitive'
        }
      },
      orderBy: { created_at: 'desc' }
    });

    if (creds.length === 0) return null;

    let matched = creds;

    // Filter by Event Name matching title or domain
    if (cleanEvent) {
      matched = matched.filter(c => 
        (c.title || '').toLowerCase().includes(cleanEvent) ||
        (c.domain || '').toLowerCase().includes(cleanEvent)
      );
    }

    // Filter by Year matching issue_date or created_at
    if (cleanYear && matched.length > 0) {
      const yearMatches = matched.filter(c => 
        (c.issue_date || '').includes(cleanYear) ||
        new Date(c.created_at).getFullYear().toString() === cleanYear
      );
      if (yearMatches.length > 0) {
        matched = yearMatches;
      }
    }

    return matched.length > 0 ? matched[0] : null;
  }

  async getPublicEvents() {
    const creds = await prisma.credential.findMany({
      select: {
        title: true,
        domain: true,
        issue_date: true,
        created_at: true
      }
    });

    const templates = await prisma.template.findMany({
      select: {
        title: true
      }
    });

    const eventsByYear = {};
    const allEventsSet = new Set();

    templates.forEach(t => {
      if (t.title) allEventsSet.add(t.title);
    });

    creds.forEach(c => {
      const name = c.title || c.domain;
      if (!name) return;

      allEventsSet.add(name);

      let yr = "2026";
      if (c.issue_date) {
        const yearMatch = c.issue_date.match(/\b(202\d)\b/);
        if (yearMatch) yr = yearMatch[1];
      } else if (c.created_at) {
        yr = new Date(c.created_at).getFullYear().toString();
      }

      if (!eventsByYear[yr]) eventsByYear[yr] = new Set();
      eventsByYear[yr].add(name);
    });

    const formattedEventsByYear = {};
    Object.keys(eventsByYear).forEach(yr => {
      formattedEventsByYear[yr] = Array.from(eventsByYear[yr]);
    });

    return {
      events: Array.from(allEventsSet),
      eventsByYear: formattedEventsByYear
    };
  }

  async findByRecipientNameAndTeam(name, year) {
    if (!name || !year) return null;
    const cleanName = name.toLowerCase().trim();
    const cleanYear = year.trim();
    const firstYear = cleanYear.split('-')[0];

    return await prisma.credential.findFirst({
      where: {
        recipient_name: {
          equals: cleanName,
          mode: 'insensitive'
        },
        OR: [
          { type: 'badge' },
          { category: { contains: 'Team', mode: 'insensitive' } }
        ],
        AND: [
          {
            OR: [
              { issue_date: { contains: cleanYear } },
              { issue_date: { contains: firstYear } }
            ]
          }
        ]
      }
    });
  }

  async findByRecipientNameFirst(name) {
    if (!name) return null;
    return await prisma.credential.findFirst({
      where: {
        recipient_name: {
          equals: name.toLowerCase().trim(),
          mode: 'insensitive'
        }
      }
    });
  }

  async findByUserIdOrEmail(userId, email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    return await prisma.credential.findMany({
      where: {
        OR: [
          { recipient_email: { equals: cleanEmail, mode: 'insensitive' } },
          { user_id: userId ? Number(userId) : -1 }
        ]
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async updateUserIdByEmail(userId, email) {
    if (!email) return null;
    return await prisma.credential.updateMany({
      where: {
        recipient_email: { equals: email.toLowerCase().trim(), mode: 'insensitive' }
      },
      data: { user_id: Number(userId) }
    });
  }

  async create(credData) {
    const cred = await prisma.credential.create({
      data: {
        id: credData.id,
        recipient_name: credData.recipient_name,
        recipient_email: credData.recipient_email.toLowerCase().trim(),
        user_id: credData.user_id ? Number(credData.user_id) : null,
        type: credData.type,
        title: credData.title,
        category: credData.category,
        domain: credData.domain || null,
        issue_date: credData.issue_date,
        description: credData.description,
        badge_icon: credData.badge_icon,
        skills_list: credData.skills_list || '',
        score: credData.score ? Number(credData.score) : null,
        template_url: credData.template_url || null
      }
    });
    return cred.id;
  }

  async delete(id) {
    return await prisma.credential.delete({
      where: { id }
    });
  }

  async findAll() {
    return await prisma.credential.findMany({
      orderBy: { created_at: 'desc' }
    });
  }

  async findRecent() {
    return await prisma.credential.findMany({
      orderBy: { created_at: 'desc' },
      take: 5
    });
  }

  async getCertificatesCount() {
    return await prisma.credential.count({
      where: { type: 'certificate' }
    });
  }

  async getBadgesCount() {
    return await prisma.credential.count({
      where: { type: 'badge' }
    });
  }

  async getUniqueStudentsCount() {
    const res = await prisma.credential.groupBy({
      by: ['recipient_email']
    });
    return res.length;
  }

  async findSuggestions(credType, query) {
    const creds = await prisma.credential.findMany({
      distinct: ['recipient_name'],
      where: {
        type: credType,
        recipient_name: { contains: query, mode: 'insensitive' }
      },
      take: 6
    });
    return creds.map(c => c.recipient_name);
  }

  // Revoke logs
  async createRevocationLog(credId, name, email, type, title, category) {
    return await prisma.revokedCredential.create({
      data: {
        credential_id: credId,
        recipient_name: name,
        recipient_email: email,
        type,
        title,
        category
      }
    });
  }

  async getRevokedList() {
    return await prisma.revokedCredential.findMany({
      orderBy: { revoked_at: 'desc' }
    });
  }

  // Verification Requests & Logs
  async createVerificationLog(credId, ip, ua, status) {
    return await prisma.verificationLog.create({
      data: {
        credential_id: credId,
        verifier_ip: ip,
        verifier_user_agent: ua,
        status
      }
    });
  }

  async getVerificationLogs() {
    return await prisma.verificationLog.findMany({
      orderBy: { verified_at: 'desc' }
    });
  }

  async createVerificationRequest(name, email, type, title, category, evidence) {
    return await prisma.verificationRequest.create({
      data: {
        student_name: name,
        student_email: email,
        credential_type: type,
        title,
        category,
        evidence_url: evidence,
        status: 'pending'
      }
    });
  }

  async getVerificationRequests() {
    return await prisma.verificationRequest.findMany({
      orderBy: { submitted_at: 'desc' }
    });
  }

  async findVerificationRequestById(id) {
    return await prisma.verificationRequest.findUnique({
      where: { id: Number(id) }
    });
  }

  async updateVerificationRequestReview(id, status, notes) {
    return await prisma.verificationRequest.update({
      where: { id: Number(id) },
      data: {
        status,
        reviewed_at: new Date(),
        reviewer_notes: notes
      }
    });
  }
}

module.exports = new CredentialRepository();
