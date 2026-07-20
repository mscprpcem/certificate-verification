import React, { useEffect, useState, useRef } from 'react';

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
      const res = await fetch('/api/credentials/my');
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
      fetch('/api/credentials/increment-share', { method: 'POST' });
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Draw and download dynamic certificate onto HTML5 canvas
  const handleDownload = async (cred) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Background
    const bgGradient = ctx.createRadialGradient(800, 600, 100, 800, 600, 1000);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Outer Borders (Royal Blue and gold styles)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 20;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = '#d97706'; // Gold accent border
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Decorative corner notches
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(40, 40, 30, 30);
    ctx.fillRect(canvas.width - 70, 40, 30, 30);
    ctx.fillRect(40, canvas.height - 70, 30, 30);
    ctx.fillRect(canvas.width - 70, canvas.height - 70, 30, 30);

    // 3. Header text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 24px Outfit, sans-serif';
    ctx.fillText('MICROSOFT STUDENT CLUB PRPCEM', canvas.width / 2, 160);

    ctx.font = '600 14px Manrope, sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('STUDENT-LED TECH COMMUNITY', canvas.width / 2, 190);

    // 4. Main Certificate Title
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '800 52px Outfit, sans-serif';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 280);

    // 5. Presentation text
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 500 20px Georgia, serif';
    ctx.fillText('This is proudly presented to', canvas.width / 2, 360);

    // 6. Recipient Name
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 48px Outfit, sans-serif';
    ctx.fillText(cred.recipient_name, canvas.width / 2, 440);

    // Underline name
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 200, 460);
    ctx.lineTo(canvas.width / 2 + 200, 460);
    ctx.stroke();

    // 7. Achievement detail text
    ctx.fillStyle = '#64748b';
    ctx.font = '500 18px Manrope, sans-serif';
    
    let detailText = `for outstanding participation and completion of the`;
    if (cred.type === 'badge') {
      detailText = `for verified membership and core service in the capacity of`;
    }
    ctx.fillText(detailText, canvas.width / 2, 520);

    // 8. Program / Title
    ctx.fillStyle = '#2563eb';
    ctx.font = '800 36px Outfit, sans-serif';
    ctx.fillText(cred.title, canvas.width / 2, 580);

    // 9. Extra Description
    ctx.fillStyle = '#64748b';
    ctx.font = '500 15px Manrope, sans-serif';
    const descText = cred.description || "";
    // Simple line wrap for description
    if (descText.length > 80) {
      ctx.fillText(descText.slice(0, 80) + "...", canvas.width / 2, 630);
    } else {
      ctx.fillText(descText, canvas.width / 2, 630);
    }

    // 10. Footer Section (Date & ID left, Signatures right)
    // Date & ID
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 16px Manrope, sans-serif';
    ctx.fillText(`Date: ${cred.issue_date}`, 120, 760);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '500 14px Manrope, sans-serif';
    ctx.fillText(`Verification ID: ${cred.id}`, 120, 790);

    // Signatures
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic 700 18px Georgia, serif';
    ctx.fillText('Club President', canvas.width - 120, 760);
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 260, 740);
    ctx.lineTo(canvas.width - 120, 740);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '500 14px Manrope, sans-serif';
    ctx.fillText('MSC PRPCEM', canvas.width - 120, 790);

    // 11. Certified Seal badge (drawn dynamically)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 760, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 12px Outfit, sans-serif';
    ctx.fillText('VERIFIED', canvas.width / 2, 755);
    ctx.font = '700 9px Outfit, sans-serif';
    ctx.fillText('MSC SECURITY', canvas.width / 2, 772);

    // Seal outer ring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 760, 38, 0, Math.PI * 2);
    ctx.stroke();

    // 12. Trigger browser download
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${cred.title.replace(/\s+/g, "_")}_Certificate_${cred.id}.png`;
    link.href = dataURL;
    link.click();

    // Increment download counter in backend
    fetch('/api/credentials/increment-download', { method: 'POST' });
    onShowNotification("Certificate downloaded successfully!");
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
