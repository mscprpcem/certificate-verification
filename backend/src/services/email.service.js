const profileRepository = require("../repositories/profile.repository");
const env = require("../config/env");

class EmailService {
  async sendQuizBadgeEmail(name, email, title, score, dateStr, credId) {
    const baseUrl = env.FRONTEND_URL || 'http://localhost:5173';
    const subject = `🎉 You've earned a new Microsoft Student Club Badge`;
    const body = `
Congratulations, ${name}!

You earned a new badge.

🏅 ${title}
Microsoft Student Club PRPCEM

Score: ${score}%
Issued: ${dateStr}

-------------------------------------------------
[ View Badge ] -> ${baseUrl}/credential/${credId}
[ Share ]
-------------------------------------------------
    `;

    await profileRepository.logSentEmail(email, subject, body.trim());
  }

  async sendIssueEmail(name, email, title, type, customId, issue_date) {
    const baseUrl = env.FRONTEND_URL || 'http://localhost:5173';
    const subject = `🎉 New Credential Issued: ${title}`;
    const body = `
Hello ${name},

You have been issued a new digital credential from the Microsoft Student Club PRPCEM!

Title: ${title}
Type: ${type}
ID: ${customId}
Date: ${issue_date}

-------------------------------------------------
[ View Credential ] -> ${baseUrl}/?verifyId=${customId}
-------------------------------------------------
    `;

    await profileRepository.logSentEmail(email, subject, body.trim());
  }
}

module.exports = new EmailService();
