class PDFService {
  async generatePDF(credential) {
    return {
      status: "success",
      filename: `MSC-${credential.id}.pdf`,
      contentType: "application/pdf"
    };
  }
}

module.exports = new PDFService();
