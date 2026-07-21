class QRService {
  generateVerificationUrl(credentialId) {
    return `http://localhost:5173/?verifyId=${credentialId}`;
  }
}

module.exports = new QRService();
