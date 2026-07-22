const env = require("../config/env");

class QRService {
  generateVerificationUrl(credentialId) {
    const baseUrl = env.FRONTEND_URL || 'http://localhost:5173';
    return `${baseUrl}/?verifyId=${credentialId}`;
  }
}

module.exports = new QRService();
