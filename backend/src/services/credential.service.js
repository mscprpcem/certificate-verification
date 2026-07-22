const credentialRepository = require("../repositories/credential.repository");
const userRepository = require("../repositories/user.repository");
const profileRepository = require("../repositories/profile.repository");
const emailService = require("./email.service");
const authService = require("./auth.service");

class CredentialService {
  async verifyCredential(query) {
    const { type, credentialId, email, name, badgeId, url, year, eventName, teamYear, ip, ua } = query;

    let matched = null;

    if (credentialId) {
      matched = await credentialRepository.findById(credentialId.trim());
    } else if (badgeId) {
      matched = await credentialRepository.findBadgeById(badgeId.trim());
    } else if (email) {
      const results = await credentialRepository.findByEmail(email);
      if (results.length > 0) {
        return { success: true, records: results };
      }
    } else if (name) {
      if (type === "event") {
        if (!name.trim() || !year || !year.trim() || !eventName || !eventName.trim()) {
          const queryId = name || "unknown";
          await credentialRepository.createVerificationLog(queryId, ip, ua, "not_found");
          return { success: false, message: "Details not found. Please enter Name, Event Name, and Year properly." };
        }
        matched = await credentialRepository.findByRecipientNameAndEvent(name, year, eventName);
      } else if (type === "team") {
        if (!name.trim() || !teamYear || !teamYear.trim()) {
          const queryId = name || "unknown";
          await credentialRepository.createVerificationLog(queryId, ip, ua, "not_found");
          return { success: false, message: "Details not found. Please enter Name and Team Year properly." };
        }
        matched = await credentialRepository.findByRecipientNameAndTeam(name, teamYear);
      } else {
        matched = await credentialRepository.findByRecipientNameFirst(name);
      }
    } else if (url) {
      const idMatch = url.match(/MSC-[A-Z]+-[\d-]+\d/i);
      const extractedId = idMatch ? idMatch[0] : url.trim();
      matched = await credentialRepository.findById(extractedId);
    }

    if (matched) {
      await credentialRepository.createVerificationLog(matched.id, ip, ua, "success");
      return { success: true, record: matched };
    } else {
      const queryId = credentialId || badgeId || url || email || name || "unknown";
      await credentialRepository.createVerificationLog(queryId, ip, ua, "not_found");
      return { success: false, message: "No matching credential record found." };
    }
  }

  async publishQuizResults(quizTitle, participants, publishDate, rules) {
    const dateStr = publishDate || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const resultsLog = [];

    for (const p of participants) {
      if (!p.name || !p.email) continue;
      if (p.disqualified) continue;

      const score = p.score || 0;
      const normEmail = p.email.toLowerCase().trim();

      let credentialType = "certificate";
      let title = `${quizTitle} - Certificate of Participation`;
      let category = p.certificateCategory || "Participation Certificate";
      let badgeIcon = "fa-award";
      let skillsList = "Technical Knowledge, Problem Solving";
      let description = `Awarded to ${p.name} for active participation in the MSC PRPCEM ${quizTitle}.`;
      let xpEarned = 100;

      if (p.rank === 1) {
        credentialType = "badge";
        title = `${quizTitle} - 1st Place Winner`;
        category = "Badge";
        badgeIcon = "fa-trophy";
        skillsList = "Problem Solving, Excellence, Quiz Champion";
        description = `Awarded to ${p.name} for securing 1st Place in the MSC PRPCEM ${quizTitle}.`;
        xpEarned = 500;
      } else if (p.rank === 2 || p.rank === 3) {
        credentialType = "badge";
        title = `${quizTitle} - Runner-Up (${p.rank}${p.rank === 2 ? 'nd' : 'rd'} Place)`;
        category = "Badge";
        badgeIcon = "fa-medal";
        skillsList = "Problem Solving, High Standing";
        description = `Awarded to ${p.name} for securing ${p.rank}${p.rank === 2 ? 'nd' : 'rd'} Place in the MSC PRPCEM ${quizTitle}.`;
        xpEarned = 300;
      } else if (p.rank <= 10 && p.rank > 3) {
        credentialType = "certificate";
        title = `${quizTitle} - Top 10 Merit Certificate`;
        category = "Merit Certificate";
        badgeIcon = "fa-star";
        skillsList = "Problem Solving, Merit";
        description = `Awarded to ${p.name} for securing Rank #${p.rank} in the MSC PRPCEM ${quizTitle}.`;
        xpEarned = 200;
      }

      let user = await userRepository.findByEmail(normEmail);
      let userId;

      if (!user) {
        userId = await userRepository.create({
          name: p.name,
          email: normEmail,
          password_hash: null,
          role: "student",
          bio: "Microsoft Student Club Member",
          headline: "Student Developer",
          profile_photo: "",
          linkedin_url: "",
          github_url: "",
          skills: "{}",
          xp: xpEarned,
          level: authService.calculateLevel(xpEarned)
        });
      } else {
        userId = user.id;
        const newXp = (user.xp || 0) + xpEarned;
        await userRepository.updateXpAndLevel(userId, newXp, authService.calculateLevel(newXp));
      }

      // Check duplicate issuance for same quiz and title
      const existing = await credentialRepository.findByEmail(normEmail);
      const alreadyIssued = existing.find(c => c.title === title || (c.domain === quizTitle && c.type === credentialType));

      let credId = alreadyIssued ? alreadyIssued.id : null;

      if (!alreadyIssued) {
        const randId = Math.floor(10000 + Math.random() * 90000);
        credId = `MSC-${credentialType === "badge" ? "BDG" : "CRT"}-${String(randId).padStart(5, "0")}`;

        await credentialRepository.create({
          id: credId,
          recipient_name: p.name,
          recipient_email: normEmail,
          user_id: userId,
          type: credentialType,
          title,
          category,
          domain: quizTitle,
          issue_date: dateStr,
          description,
          badge_icon: badgeIcon,
          skills_list: skillsList,
          score
        });

        await profileRepository.createActivityLog(userId, `Earned ${title}`);
        try {
          await emailService.sendQuizBadgeEmail(p.name, normEmail, title, score, dateStr, credId);
        } catch (e) {
          console.warn('Email dispatch warning:', e.message);
        }
      }

      resultsLog.push({
        name: p.name,
        email: normEmail,
        issued: true,
        id: credId,
        score,
        xpEarned
      });
    }

    return resultsLog;
  }

  async getMyCredentials(userId, email) {
    return await credentialRepository.findByUserIdOrEmail(userId, email);
  }

  async getPublicProfile(username) {
    const searchString = username.toLowerCase();
    
    // Use low-level check or queries since config is loaded
    const { dbGet } = require("../config/database");
    const user = await dbGet(
      `SELECT id, name, email, role, bio, headline, profile_photo, linkedin_url, github_url, skills, xp, level, created_at 
       FROM users 
       WHERE LOWER(email) LIKE ? OR LOWER(name) LIKE ? OR REPLACE(LOWER(name), ' ', '') = ? OR REPLACE(LOWER(name), ' ', '') LIKE ?`,
      [`%${searchString}%`, `%${searchString}%`, searchString, `%${searchString}%`]
    );

    if (!user || user.role === 'admin') {
      throw new Error("Public profile not found.");
    }

    const credentialsList = await credentialRepository.findByUserIdOrEmail(user.id, user.email);

    return { user, credentials: credentialsList };
  }

  async adminIssue(data) {
    const { recipient_name, recipient_email, type, title, category, domain, issue_date, description, badge_icon, skills_list } = data;

    const rand = Math.floor(10000 + Math.random() * 90000);
    const prefix = type === "certificate" ? "CRT" : "BDG";
    const customId = `MSC-${prefix}-${rand}`;

    const user = await userRepository.findByEmail(recipient_email);
    const userId = user ? user.id : null;

    await credentialRepository.create({
      id: customId,
      recipient_name,
      recipient_email,
      user_id: userId,
      type,
      title,
      category,
      domain: domain || null,
      issue_date,
      description: description || `Awarded for ${title} on ${issue_date}.`,
      badge_icon: badge_icon || (type === "certificate" ? "fa-award" : "fa-shield-halved"),
      skills_list: skills_list || (type === "certificate" ? "Collaboration, Learning" : "Leadership, Teamwork")
    });

    if (userId) {
      const xpBonus = type === "certificate" ? 100 : 200;
      const newXp = user.xp + xpBonus;
      await userRepository.updateXpAndLevel(userId, newXp, authService.calculateLevel(newXp));
      await profileRepository.createActivityLog(userId, `Earned ${title} ${category}`);
    }

    await emailService.sendIssueEmail(recipient_name, recipient_email, title, type, customId, issue_date);

    return customId;
  }

  async adminRevoke(id) {
    const record = await credentialRepository.findById(id);
    if (!record) {
      throw new Error("Record not found.");
    }

    await credentialRepository.createRevocationLog(record.id, record.recipient_name, record.recipient_email, record.type, record.title, record.category);
    await credentialRepository.delete(id);

    if (record.user_id) {
      await profileRepository.createActivityLog(record.user_id, `Revoked credential ${id}: ${record.title}`);
    }
  }

  async submitClaim(userId, claimData) {
    const { title, category, evidence_url } = claimData;
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("Authenticated user not found.");
    }

    await credentialRepository.createVerificationRequest(user.name, user.email, "certificate", title, category, evidence_url);
    await profileRepository.createActivityLog(userId, `Submitted manual claim verification request for ${title}`);
  }

  async adminReviewClaim(id, status, notes) {
    const requestRecord = await credentialRepository.findVerificationRequestById(id);
    if (!requestRecord) {
      throw new Error("Verification request not found.");
    }

    await credentialRepository.updateVerificationRequestReview(id, status, notes);

    if (status === "approved") {
      const type = requestRecord.credential_type || "certificate";
      const title = requestRecord.title;
      const category = requestRecord.category;
      const recipient_name = requestRecord.student_name;
      const recipient_email = requestRecord.student_email;

      const rand = Math.floor(10000 + Math.random() * 90000);
      const prefix = type === "certificate" ? "CRT" : "BDG";
      const customId = `MSC-${prefix}-${rand}`;

      const user = await userRepository.findByEmail(recipient_email);
      const userId = user ? user.id : null;

      await credentialRepository.create({
        id: customId,
        recipient_name,
        recipient_email,
        user_id: userId,
        type,
        title,
        category,
        domain: null,
        issue_date: "21 July 2026",
        description: `Awarded for ${title} following manual verification of claim.`,
        badge_icon: type === "certificate" ? "fa-award" : "fa-shield-halved",
        skills_list: type === "certificate" ? "Collaboration, Learning" : "Leadership, Teamwork"
      });

      if (userId) {
        const xpBonus = type === "certificate" ? 100 : 200;
        const newXp = user.xp + xpBonus;
        await userRepository.updateXpAndLevel(userId, newXp, authService.calculateLevel(newXp));
        await profileRepository.createActivityLog(userId, `Earned ${title} via manual claim approval`);
      }
    }
  }

  async adminBulkIssue(csvContent) {
    const lines = csvContent.trim().split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) {
      throw new Error("CSV must have a header row and at least one data row.");
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    let issuedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      const recipientName = row.name || '';
      const recipientEmail = (row.email || '').toLowerCase().trim();
      const type = row.type || 'certificate';
      const title = row.title || '';
      const category = row.category || 'General';
      const issueDate = row.issue_date || '20 July 2026';
      const badgeIcon = row.badge_icon || (type === 'certificate' ? 'fa-award' : 'fa-shield-halved');
      const description = row.description || `Awarded for ${title}.`;
      const skillsList = row.skills_list || (type === 'certificate' ? 'Collaboration, Learning' : 'Leadership, Teamwork');

      if (!recipientName || !recipientEmail || !title) continue;

      const rand = Math.floor(10000 + Math.random() * 90000);
      const prefix = type === 'certificate' ? 'CRT' : 'BDG';
      const customId = `MSC-${prefix}-${rand}`;

      const user = await userRepository.findByEmail(recipientEmail);
      const userId = user ? user.id : null;

      await credentialRepository.create({
        id: customId,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        user_id: userId,
        type,
        title,
        category,
        domain: null,
        issue_date: issueDate,
        description,
        badge_icon: badgeIcon,
        skills_list: skillsList
      });

      if (userId) {
        const xpBonus = type === 'certificate' ? 100 : 200;
        const newXp = user.xp + xpBonus;
        await userRepository.updateXpAndLevel(userId, newXp, authService.calculateLevel(newXp));
        await profileRepository.createActivityLog(userId, `Earned ${title} via bulk issue`);
      }

      await emailService.sendIssueEmail(recipientName, recipientEmail, title, type, customId, issueDate);
      issuedCount++;
    }

    return issuedCount;
  }
}

module.exports = new CredentialService();
