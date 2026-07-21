import React from 'react';

export default function StudentDashboard({ 
  user, 
  credentials, 
  onSelectCredential, 
  onDownload, 
  onShare,
  onNavigateTo
}) {
  const recent = credentials.slice(0, 3);

  // Helper to map credential title to a visual color / icon brand
  const getBrandDetails = (title) => {
    const t = title.toLowerCase();
    if (t.includes('google cloud') || t.includes('gcp')) {
      return { bg: '#fff7ed', color: '#ea580c', icon: 'fa-cloud' };
    }
    if (t.includes('azure') || t.includes('microsoft')) {
      return { bg: '#eff6ff', color: '#2563eb', icon: 'fa-terminal' };
    }
    if (t.includes('ai') || t.includes('workshop')) {
      return { bg: '#faf5ff', color: '#7c3aed', icon: 'fa-brain' };
    }
    if (t.includes('javascript') || t.includes('js') || t.includes('code')) {
      return { bg: '#fef9c3', color: '#ca8a04', icon: 'fa-mug-hot' };
    }
    return { bg: '#f1f5f9', color: '#475569', icon: 'fa-award' };
  };

  return (
    <div className="dashboard-content-grid" id="student-dashboard-root">
      
      {/* Welcome banner at the top */}
      <div className="welcome-banner-row" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Welcome back, {user.name ? user.name.split(' ')[0] : 'Student'}! 👋
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Here is a summary of your verified credentials and club achievements.
          </p>
        </div>
        <button 
          className="signin-btn" 
          onClick={() => onNavigateTo('my-credentials')} 
          style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: 700 }}
        >
          View All Credentials
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Total Credentials Card */}
        <div className="metric-box-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div className="metric-box-icon" style={{ background: '#eff6ff', color: '#2563eb', fontSize: '20px', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0 }}>
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)' }}>{credentials.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Credentials Earned</div>
          </div>
        </div>

        {/* Certificates Card */}
        <div className="metric-box-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div className="metric-box-icon" style={{ background: '#ecfdf5', color: '#10b981', fontSize: '20px', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0 }}>
            <i className="fa-solid fa-certificate"></i>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)' }}>
              {credentials.filter(c => c.type === 'certificate').length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Certificates</div>
          </div>
        </div>

        {/* Badges Card */}
        <div className="metric-box-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div className="metric-box-icon" style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '20px', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0 }}>
            <i className="fa-solid fa-award"></i>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)' }}>
              {credentials.filter(c => c.type === 'badge').length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Earned Badges</div>
          </div>
        </div>

      </div>

      {/* Recently Issued Section */}
      <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            <i className="fa-regular fa-clock" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
            Recently Issued Credentials
          </h3>
          <span 
            className="view-all-link" 
            style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }}
            onClick={() => onNavigateTo('my-credentials')}
          >
            View All
          </span>
        </div>

        <div className="list-credentials-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recent.map((cred) => {
            const brand = getBrandDetails(cred.title);
            return (
              <div key={cred.id} className="list-credential-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="list-icon-badge-box" style={{ background: brand.bg, color: brand.color, width: '42px', height: '42px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' }}>
                  <i className={`fa-solid ${brand.icon}`}></i>
                </div>
                
                <div style={{ flexGrow: 1, textAlign: 'left' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {cred.title}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    Microsoft Student Club PRPCEM
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    Issued: {cred.issue_date} • ID: <strong style={{ fontFamily: 'monospace' }}>{cred.id}</strong>
                  </span>
                </div>

                <div className="list-verify-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                  <i className="fa-solid fa-circle-check"></i> Verified
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="list-view-btn" 
                    onClick={() => onSelectCredential(cred)}
                    style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '6px' }}
                  >
                    View
                  </button>
                  <button 
                    className="list-view-btn" 
                    onClick={() => onDownload(cred)}
                    style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '6px', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid #cbd5e1' }}
                  >
                    <i className="fa-solid fa-download"></i>
                  </button>
                  <button 
                    className="list-view-btn" 
                    onClick={() => onShare(cred)}
                    style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '6px', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid #cbd5e1' }}
                  >
                    <i className="fa-solid fa-share-nodes"></i>
                  </button>
                </div>
              </div>
            );
          })}

          {credentials.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-award" style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '12px' }}></i>
              <p style={{ margin: 0, fontSize: '13px' }}>No achievements found in your wallet yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
