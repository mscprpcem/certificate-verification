class SVGService {
  generateCertificateSVG(cred) {
    const name = cred.recipient_name || "Verified Student";
    const title = cred.title || "Certificate of Excellence";
    const date = cred.issue_date || new Date().toLocaleDateString();
    const id = cred.id || "MSC-CERT-0000";
    const category = cred.category || "Official Credential";
    const skills = cred.skills_list || "Cloud, Technology, Leadership";

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="700" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background Card -->
  <rect width="1000" height="700" fill="url(#bgGrad)"/>
  
  <!-- Outer Gold/Blue Border -->
  <rect x="25" y="25" width="950" height="650" fill="none" stroke="url(#accentGrad)" stroke-width="4" rx="16"/>
  <rect x="35" y="35" width="930" height="630" fill="none" stroke="#334155" stroke-width="1" rx="12"/>

  <!-- Top Banner / Header -->
  <g transform="translate(60, 70)">
    <!-- Microsoft Logo / Icon -->
    <rect x="0" y="0" width="18" height="18" fill="#f25022"/>
    <rect x="22" y="0" width="18" height="18" fill="#7fba00"/>
    <rect x="0" y="22" width="18" height="18" fill="#00a4ef"/>
    <rect x="22" y="22" width="18" height="18" fill="#ffb900"/>
    <text x="54" y="28" fill="#f8fafc" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" letter-spacing="1">MICROSOFT STUDENT CLUB</text>
    <text x="54" y="48" fill="#94a3b8" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" letter-spacing="2">PRPCEM CHAPTER • VERIFIED DIGITAL CREDENTIAL</text>
  </g>

  <!-- Certificate Title Category -->
  <text x="500" y="210" fill="#93c5fd" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" text-anchor="middle" letter-spacing="4" text-transform="uppercase">CERTIFICATE OF ACHIEVEMENT</text>
  
  <text x="500" y="250" fill="#94a3b8" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="400" text-anchor="middle">PROUDLY PRESENTED TO</text>

  <!-- Student Recipient Name -->
  <text x="500" y="315" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" text-anchor="middle" filter="url(#shadow)">${this.escapeXml(name)}</text>
  
  <line x1="300" y1="335" x2="700" y2="335" stroke="url(#accentGrad)" stroke-width="2"/>

  <!-- Description / Achievement Title -->
  <text x="500" y="380" fill="#cbd5e1" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="400" text-anchor="middle">For successful participation and verified completion in</text>
  
  <text x="500" y="425" fill="#60a5fa" font-family="'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" text-anchor="middle">${this.escapeXml(title)}</text>

  <text x="500" y="465" fill="#94a3b8" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Category: ${this.escapeXml(category)} | Competencies: ${this.escapeXml(skills)}</text>

  <!-- Footer Section: Issue Date & Credential ID -->
  <g transform="translate(80, 560)">
    <text x="0" y="0" fill="#64748b" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700">DATE ISSUED</text>
    <text x="0" y="20" fill="#f8fafc" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">${this.escapeXml(date)}</text>
  </g>

  <g transform="translate(500, 560)">
    <!-- Official Seal Badge -->
    <circle cx="0" cy="0" r="32" fill="#1e3a8a" stroke="url(#accentGrad)" stroke-width="3"/>
    <path d="M-10,-4 L0,12 L12,-10" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="0" y="46" fill="#94a3b8" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" text-anchor="middle">OFFICIALLY VERIFIED</text>
  </g>

  <g transform="translate(920, 560)">
    <text x="0" y="0" fill="#64748b" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" text-anchor="end">CREDENTIAL ID</text>
    <text x="0" y="20" fill="#60a5fa" font-family="Consolas, monospace" font-size="14" font-weight="800" text-anchor="end">${this.escapeXml(id)}</text>
  </g>
</svg>`;
  }

  escapeXml(unsafe) {
    return String(unsafe || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}

module.exports = new SVGService();
