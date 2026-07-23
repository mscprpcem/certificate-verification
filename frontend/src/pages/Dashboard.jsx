import React, { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../config/api';

export default function Dashboard({ user, onShowNotification }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCred, setSelectedCred] = useState(null); // For modal preview
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchMyCredentials();
  }, []);

  const fetchMyCredentials = async () => {
    try {
      const res = await apiFetch('/api/credentials/my');
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error("Error fetching credentials:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pre-filled LinkedIn Certification Link generator
  const getLinkedInLink = (cred) => {
    const orgName = encodeURIComponent("Microsoft Student Club PRPCEM");
    const certName = encodeURIComponent(cred.title + (cred.type === 'certificate' ? ' Certificate' : ' Badge'));
    const certId = encodeURIComponent(cred.id);
    // Use window.location.origin to point to this local server deployment
    const verifyUrl = encodeURIComponent(`${window.location.origin}?verifyId=${cred.id}`);

    // Parse issue month and year
    let issueYear = 2026;
    let issueMonth = 7; // July default
    const yearMatch = cred.issue_date.match(/\d{4}/);
    if (yearMatch) issueYear = parseInt(yearMatch[0]);

    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    months.forEach((m, idx) => {
      if (cred.issue_date.toLowerCase().includes(m)) {
        issueMonth = idx + 1;
      }
    });

    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certId=${certId}&certUrl=${verifyUrl}`;
  };

  const handleShare = async (cred) => {
    const shareUrl = `${window.location.origin}?verifyId=${cred.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      onShowNotification("Verification link copied to clipboard!");
      
      // Increment share counter in backend
      apiFetch('/api/credentials/increment-share', { method: 'POST' });
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Draw and download dynamic certificate onto HTML5 canvas
  // Draw and download dynamic certificate onto HTML5 canvas using .NET Conf 2025 SVG Template
  const handleDownload = async (cred) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1685;
    canvas.height = 1191;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw .NET Conf 2025 SVG Template background
    const svgPath = '/assets/.NET%20Conf%202025.svg';
    const templateImg = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = svgPath;
    });

    if (templateImg) {
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Overlay Recipient's Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 48px Outfit, sans-serif';
    ctx.fillText(cred.recipient_name, canvas.width / 2, 595);

    ctx.strokeStyle = '#512bd4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 200, 615);
    ctx.lineTo(canvas.width / 2 + 200, 615);
    ctx.stroke();

    // 3. Overlay Verification URL and QR Code on Open Space
    const verifyUrl = `${window.location.origin}?verifyId=${cred.id}`;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#512bd4';
    ctx.font = '800 14px Outfit, sans-serif';
    ctx.fillText('OFFICIAL VERIFICATION PROTOCOL', 120, 990);
    ctx.font = '500 13px Manrope, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('This certificate is registered & verified in the MSC PRPCEM Registry.', 120, 1015);
    ctx.fillStyle = '#1e293b';
    ctx.font = '700 13px Outfit, sans-serif';
    ctx.fillText(`Verification Portal: ${verifyUrl}`, 120, 1040);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}`;
    try {
      const qrImg = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = qrCodeUrl;
      });

      if (qrImg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(canvas.width - 250, 930, 150, 190);
        ctx.strokeStyle = '#512bd4';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width - 250, 930, 150, 190);

        ctx.drawImage(qrImg, canvas.width - 240, 940, 130, 130);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#512bd4';
        ctx.font = '800 11px Outfit, sans-serif';
        ctx.fillText('SCAN TO VERIFY', canvas.width - 175, 1090);
        ctx.fillStyle = '#64748b';
        ctx.font = '600 10px Manrope, sans-serif';
        ctx.fillText(`ID: ${cred.id}`, canvas.width - 175, 1108);
      }
    } catch (qrErr) {
      console.warn('Could not render QR code on certificate canvas:', qrErr);
    }

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${cred.title.replace(/\s+/g, '_')}_${cred.id}.png`;
    link.href = dataURL;
    link.click();

    apiFetch('/api/credentials/increment-download', { method: 'POST' });
    onShowNotification('Certificate downloaded successfully!');
  };

  return (
    <div className="dashboard-container">
      <div className="student-profile-header">
        <div className="student-meta">
          <div className="student-avatar">
            {user.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div className="student-info">
            <h2>{user.name}</h2>
            <p>Member Email: {user.email}</p>
          </div>
        </div>
        <div className="dashboard-stats">
          <div className="stat-item">
            <div className="stat-num">{credentials.length}</div>
            <div className="stat-label">Credentials</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">
              {credentials.filter(c => c.type === 'certificate').length}
            </div>
            <div className="stat-label">Certificates</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">
              {credentials.filter(c => c.type === 'badge').length}
            </div>
            <div className="stat-label">Badges</div>
          </div>
        </div>
      </div>

      <div className="badge-grid-section">
        <h3>My Issued Credentials</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Loading achievements...
          </div>
        ) : credentials.length === 0 ? (
          <div className="empty-dashboard">
            <div className="empty-icon-box">
              <i className="fa-solid fa-award"></i>
            </div>
            <h3>No Credentials Issued Yet</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>
              Your event certificates and team badges will appear here once issued by the club administrator. Make sure you registered with your club email.
            </p>
          </div>
        ) : (
          <div className="badge-grid">
            {credentials.map((cred) => (
              <div key={cred.id} className={`badge-card ${cred.type}`}>
                <div className="badge-card-icon-box">
                  <i className={`fa-solid ${cred.badge_icon || (cred.type === 'certificate' ? 'fa-award' : 'fa-shield-halved')}`}></i>
                </div>
                <div className="badge-card-title">{cred.title}</div>
                <div className="badge-card-category">{cred.category}</div>
                <p className="badge-card-desc">{cred.description}</p>
                
                <div className="badge-card-footer">
                  <span className="badge-card-date">{cred.issue_date}</span>
                  <span className="badge-card-id">{cred.id}</span>
                </div>

                <div className="badge-card-actions">
                  <button className="badge-action-btn primary-action" onClick={() => setSelectedCred(cred)}>
                    <i className="fa-solid fa-eye"></i> View
                  </button>
                  <button className="badge-action-btn" onClick={() => handleDownload(cred)}>
                    <i className="fa-solid fa-download"></i> Download
                  </button>
                  <a
                    className="badge-action-btn"
                    href={getLinkedInLink(cred)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-brands fa-linkedin"></i> Add to LinkedIn
                  </a>
                  <button className="badge-action-btn" onClick={() => handleShare(cred)}>
                    <i className="fa-solid fa-share-nodes"></i> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* High fidelity Modal Preview */}
      {selectedCred && (
        <div className="modal-overlay" onClick={() => setSelectedCred(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedCred(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="modal-body">
              <h3 style={{ marginBottom: '14px', textAlign: 'center', fontSize: '18px', fontWeight: 800 }}>Digital Achievement</h3>
              
              <div className="certificate-preview-card">
                <div className="certificate-inner">
                  <div className="cert-logo-container">
                    <img src="/assets/MSC_logo.png" alt="MSC Logo" />
                    <h4>MICROSOFT STUDENT CLUB PRPCEM</h4>
                  </div>
                  
                  <div className="cert-title-label">Certificate of Achievement</div>
                  
                  <p className="cert-text-detail">This certifies that the recipient</p>
                  <div className="cert-name-label">{selectedCred.recipient_name}</div>
                  
                  <p className="cert-text-detail">has successfully completed the program</p>
                  <div className="cert-course-title">{selectedCred.title}</div>
                  
                  <p className="cert-text-detail" style={{ fontSize: '10px' }}>
                    {selectedCred.description}
                  </p>

                  <div className="cert-verified-stamp">Verified Achievement</div>

                  <div className="cert-meta-bottom">
                    <div className="cert-meta-item">
                      <div className="label">Date Issued</div>
                      <div className="val">{selectedCred.issue_date}</div>
                    </div>
                    <div className="cert-meta-item" style={{ textAlign: 'center' }}>
                      <div className="label">Credential ID</div>
                      <div className="val" style={{ fontStyle: 'monospace' }}>{selectedCred.id}</div>
                    </div>
                    <div className="cert-meta-item" style={{ textAlign: 'right' }}>
                      <div className="label">MSC President</div>
                      <div className="cert-signature-name">Club President</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions-bar">
                <button
                  className="badge-action-btn primary-action"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                  onClick={() => handleDownload(selectedCred)}
                >
                  <i className="fa-solid fa-download"></i> Download PNG Certificate
                </button>
                <button
                  className="badge-action-btn"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                  onClick={() => handleShare(selectedCred)}
                >
                  <i className="fa-solid fa-share-nodes"></i> Copy Sharing Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden offscreen canvas for certificate compilation */}
      <canvas
        ref={canvasRef}
        width="1600"
        height="1100"
        className="canvas-offscreen"
      ></canvas>
    </div>
  );
}
