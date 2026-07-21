import React from 'react';

export default function BadgeDetail({ 
  credential, 
  onBack, 
  onShare, 
  onDownload, 
  getLinkedInLink 
}) {
  if (!credential) return null;

  const isBadge = credential.type === 'badge';
  const isNetConf = (credential.title || '').toLowerCase().includes('.net') || 
                    (credential.category || '').toLowerCase().includes('.net');
  const skills = (credential.skills_list || 'Logic, Problem Solving, Technology').split(',');

  return (
    <div className="detail-page-container">
      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
        <button 
          className="badge-btn" 
          style={{ padding: '8px 16px', display: 'inline-flex', gap: '6px' }}
          onClick={onBack}
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Credentials
        </button>
      </div>

      {isBadge ? (
        /* Badge Detail Layout exactly like requested */
        <div className="badge-detail-card">
          <div className="detail-badge-icon-box">
            <i className={`fa-solid ${credential.badge_icon || 'fa-shield-halved'}`}></i>
          </div>
          
          <h2>{credential.title}</h2>
          <h3>Microsoft Student Club PRPCEM</h3>
          
          <div className="badge-verified-pill" style={{ display: 'inline-flex', margin: '0 auto 16px' }}>
            <i className="fa-solid fa-circle-check"></i> Verified Achievement
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 20px' }}>
            {credential.description || 'Verified achievement badge issued by the Microsoft Student Club chapter.'}
          </p>

          <div className="detail-meta-table">
            <div className="detail-meta-row">
              <span className="label">Issued To</span>
              <span className="val">{credential.recipient_name}</span>
            </div>
            <div className="detail-meta-row">
              <span className="label">Issued By</span>
              <span className="val">Microsoft Student Club</span>
            </div>
            <div className="detail-meta-row">
              <span className="label">Issue Date</span>
              <span className="val">{credential.issue_date}</span>
            </div>
            <div className="detail-meta-row">
              <span className="label">Credential ID</span>
              <span className="val" style={{ fontFamily: 'monospace' }}>{credential.id}</span>
            </div>
            {credential.score && (
              <div className="detail-meta-row">
                <span className="label">Score Achieved</span>
                <span className="val" style={{ color: 'var(--primary)' }}>{credential.score}%</span>
              </div>
            )}
          </div>

          <div className="skills-earned-section">
            <h4>Skills Earned</h4>
            <div className="badge-skills-tray" style={{ justifyContent: 'center' }}>
              {skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="badge-skill-tag" 
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-action-grid">
            <a 
              className="badge-btn primary-btn" 
              href={getLinkedInLink(credential)} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ padding: '10px 0' }}
            >
              <i className="fa-brands fa-linkedin"></i> Share
            </a>
            <button className="badge-btn" onClick={() => onShare(credential)}>
              <i className="fa-solid fa-link"></i> Copy Link
            </button>
            <button className="badge-btn" onClick={() => onDownload(credential)}>
              <i className="fa-solid fa-download"></i> Download PNG
            </button>
            <a 
              className="badge-btn" 
              href={`mailto:?subject=${encodeURIComponent("Earned " + credential.title)}&body=${encodeURIComponent("Check it out here: " + window.location.origin + "?verifyId=" + credential.id)}`}
              style={{ padding: '10px 0' }}
            >
              <i className="fa-solid fa-envelope"></i> Email Share
            </a>
          </div>
        </div>
      ) : (
        /* Certificate Detail Split Layout */
        <div className="certificate-split-detail">
          
          {/* Left Panel: Certificate Mock Preview */}
          {isNetConf ? (
            /* .NET Conf 2025 SVG Template Preview */
            <div className="certificate-preview-card" style={{ padding: '0', overflow: 'hidden', position: 'relative', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              <img 
                src="/assets/.NET%20Conf%202025.svg" 
                alt=".NET Conf 2025 Certificate Template" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />

              {/* Cover previous sample name in template */}
              <div 
                style={{
                  position: 'absolute',
                  top: '49.5%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60%',
                  height: '13%',
                  background: '#ffffff',
                  zIndex: 1
                }}
              />

              {/* Overlaid Recipient Name */}
              <div 
                style={{
                  position: 'absolute',
                  top: '49.5%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: 'clamp(14px, 2.5vw, 24px)',
                  color: '#0f172a',
                  fontFamily: 'Outfit, sans-serif',
                  zIndex: 2
                }}
              >
                {credential.recipient_name}
              </div>

              {/* Bottom Verification Protocol Bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '2.5%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '92%',
                  background: '#ffffff',
                  border: '1px solid #512bd4',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 2
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#512bd4', letterSpacing: '0.5px' }}>OFFICIAL VERIFICATION PROTOCOL</div>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#1e293b' }}>
                    {window.location.origin}?verifyId={credential.id}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '?verifyId=' + credential.id)}`}
                    alt="QR Code"
                    style={{ width: '38px', height: '38px', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Standard Certificate Mock Preview for non-.NET events */
            <div className="certificate-preview-card" style={{ padding: '12px' }}>
              <div className="certificate-inner" style={{ padding: '36px 20px', border: '3px solid #e2e8f0' }}>
                <div className="cert-logo-container" style={{ marginBottom: '12px' }}>
                  <img src="/assets/MSC_logo.png" alt="MSC Logo" style={{ height: '24px' }} />
                  <h4 style={{ fontSize: '10px' }}>MICROSOFT STUDENT CLUB PRPCEM</h4>
                </div>
                
                <div className="cert-title-label" style={{ fontSize: '9px', letterSpacing: '1px', marginBottom: '8px' }}>
                  Certificate of Achievement
                </div>
                
                <p className="cert-text-detail" style={{ fontSize: '10px', marginBottom: '4px' }}>This certifies that the recipient</p>
                <div className="cert-name-label" style={{ fontSize: '20px', marginBottom: '4px' }}>{credential.recipient_name}</div>
                
                <p className="cert-text-detail" style={{ fontSize: '10px', marginBottom: '4px' }}>has successfully completed the program</p>
                <div className="cert-course-title" style={{ fontSize: '14px', marginBottom: '12px' }}>{credential.title}</div>
                
                <p className="cert-text-detail" style={{ fontSize: '9px', lineHeight: 1.3, marginBottom: '24px' }}>
                  {credential.description}
                </p>

                <div className="cert-verified-stamp" style={{ bottom: '44px', right: '24px', fontSize: '8px', padding: '3px 8px' }}>
                  Verified Certificate
                </div>

                <div className="cert-meta-bottom" style={{ marginTop: '0', paddingTop: '10px' }}>
                  <div className="cert-meta-item">
                    <div className="label" style={{ fontSize: '8px' }}>Date Issued</div>
                    <div className="val" style={{ fontSize: '9px' }}>{credential.issue_date}</div>
                  </div>
                  <div className="cert-meta-item">
                    <div className="label" style={{ fontSize: '8px' }}>Credential ID</div>
                    <div className="val" style={{ fontSize: '9px', fontFamily: 'monospace' }}>{credential.id}</div>
                  </div>
                  <div className="cert-meta-item">
                    <div className="label" style={{ fontSize: '8px' }}>MSC Chapter</div>
                    <div className="cert-signature-name" style={{ fontSize: '10px' }}>Club President</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Panel: Detail Fields */}
          <div className="admin-card" style={{ height: '100%' }}>
            <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '16px', fontSize: '20px' }}>
              {credential.title}
            </h3>

            <div className="badge-verified-pill" style={{ marginBottom: '16px' }}>
              <i className="fa-solid fa-circle-check"></i> Verified Certificate
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
              {credential.description}
            </p>

            <div className="detail-meta-table" style={{ margin: '0 0 20px 0', maxWidth: '100%' }}>
              <div className="detail-meta-row">
                <span className="label">Awarded To</span>
                <span className="val">{credential.recipient_name}</span>
              </div>
              <div className="detail-meta-row">
                <span className="label">Issuer</span>
                <span className="val">Microsoft Student Club PRPCEM</span>
              </div>
              <div className="detail-meta-row">
                <span className="label">Issue Date</span>
                <span className="val">{credential.issue_date}</span>
              </div>
              <div className="detail-meta-row">
                <span className="label">Expiration Date</span>
                <span className="val" style={{ color: '#10b981' }}>Never Expires</span>
              </div>
              <div className="detail-meta-row">
                <span className="label">Credential ID</span>
                <span className="val" style={{ fontFamily: 'monospace' }}>{credential.id}</span>
              </div>
            </div>

            <div className="skills-earned-section" style={{ margin: '0 0 20px 0' }}>
              <h4 style={{ fontSize: '11px' }}>Associated Skills</h4>
              <div className="badge-skills-tray">
                {skills.map((skill, index) => (
                  <span key={index} className="badge-skill-tag">{skill.trim()}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <a 
                className="badge-btn primary-btn" 
                href={getLinkedInLink(credential)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ padding: '10px 0', fontSize: '12px' }}
              >
                <i className="fa-brands fa-linkedin"></i> Add to LinkedIn
              </a>
              <button 
                className="badge-btn" 
                style={{ padding: '10px 0', fontSize: '12px' }}
                onClick={() => onDownload(credential)}
              >
                <i className="fa-solid fa-download"></i> Download PNG
              </button>
              <button 
                className="badge-btn" 
                style={{ padding: '10px 0', fontSize: '12px' }}
                onClick={() => onShare(credential)}
              >
                <i className="fa-solid fa-copy"></i> Copy Link
              </button>
              <a 
                className="badge-btn" 
                href={`mailto:?subject=MSC Verified Credential&body=Verify my certificate at: ${window.location.origin}?verifyId=${credential.id}`}
                style={{ padding: '10px 0', fontSize: '12px' }}
              >
                <i className="fa-solid fa-envelope"></i> Email Share
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
