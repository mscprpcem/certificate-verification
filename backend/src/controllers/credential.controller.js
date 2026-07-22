const credentialService = require("../services/credential.service");
const credentialRepository = require("../repositories/credential.repository");
const analyticsService = require("../services/analytics.service");

class CredentialController {
  async verify(req, res, next) {
    try {
      const query = {
        ...req.query,
        ip: req.ip || "unknown",
        ua: req.headers["user-agent"] || "unknown"
      };

      const result = await credentialService.verifyCredential(query);
      if (result.success) {
        analyticsService.incrementVerifications();
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async publishResults(req, res, next) {
    try {
      const apiKey = req.headers["x-api-key"];
      if (apiKey && apiKey !== "msc_quiz_verification_secret_key_2026") {
        return res.status(401).json({ error: "Unauthorized key" });
      }

      const { event, attendees, quizTitle, participants, publishDate, rules } = req.body;
      const title = event?.title || event?.eventName || quizTitle || "MSC Quiz Session";
      const list = attendees || participants || [];

      if (!list || !Array.isArray(list)) {
        return res.status(400).json({ error: "Quiz Title and array of participants/attendees are required." });
      }

      const dateStr = event?.date
        ? new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : publishDate;

      const records = await credentialService.publishQuizResults(title, list, dateStr, rules);
      res.json({
        success: true,
        message: `Processed ${records.length} certificate/badge records for event "${title}".`,
        records,
        eventId: event?.quizId || `EVT-${Date.now()}`
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyCredentials(req, res, next) {
    try {
      const list = await credentialService.getMyCredentials(req.session.userId, req.session.email);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getPublicProfile(req, res, next) {
    const { username } = req.params;
    try {
      const result = await credentialService.getPublicProfile(username);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async suggest(req, res, next) {
    const { query, type } = req.query;
    if (!query) return res.json([]);

    try {
      const credType = type === "team" ? "badge" : "certificate";
      const results = await credentialRepository.findSuggestions(credType, query);
      res.json(results);
    } catch (err) {
      next(err);
    }
  }

  async getRecent(req, res, next) {
    try {
      const list = await credentialRepository.findRecent();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  // Claim requests
  async submitClaim(req, res, next) {
    try {
      await credentialService.submitClaim(req.session.userId, req.body);
      res.json({ success: true, message: "Claim submitted successfully to the administrator review queue!" });
    } catch (err) {
      next(err);
    }
  }

  async getClaims(req, res, next) {
    try {
      const list = await credentialRepository.getVerificationRequests();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async reviewClaim(req, res, next) {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status specified." });
    }

    try {
      await credentialService.adminReviewClaim(id, status, notes);
      res.json({ success: true, message: `Request successfully ${status}.` });
    } catch (err) {
      next(err);
    }
  }

  // Admin issue, bulk issue & revoke
  async issue(req, res, next) {
    try {
      const credentialId = await credentialService.adminIssue(req.body);
      res.status(201).json({
        message: "Credential issued successfully",
        credentialId
      });
    } catch (err) {
      next(err);
    }
  }

  async bulkIssue(req, res, next) {
    const { csvContent } = req.body;
    if (!csvContent || !csvContent.trim()) {
      return res.status(400).json({ error: "CSV content is required." });
    }

    try {
      const issuedCount = await credentialService.adminBulkIssue(csvContent);
      res.json({ success: true, message: `Bulk issued ${issuedCount} credentials.`, issuedCount });
    } catch (err) {
      next(err);
    }
  }

  async revoke(req, res, next) {
    const { id } = req.params;
    try {
      await credentialService.adminRevoke(id);
      res.json({ message: `Credential ${id} revoked successfully.` });
    } catch (err) {
      next(err);
    }
  }

  async getRevoked(req, res, next) {
    try {
      const list = await credentialRepository.getRevokedList();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const list = await credentialRepository.findAll();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getVerificationLogs(req, res, next) {
    try {
      const list = await credentialRepository.getVerificationLogs();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CredentialController();
