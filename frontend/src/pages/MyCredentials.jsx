import React, { useState } from 'react';

export default function MyCredentials({ 
  user, 
  credentials, 
  onSelectCredential, 
  onShare, 
  onDownload, 
  onNavigateTo,
  getLinkedInLink 
}) {
  const [activeTab, setActiveTab] = useState('credentials'); // credentials, badges, achievements

  // Skills progress percentages matching screenshot
  const topSkills = [
    { name: "Cloud Computing", level: "Expert", pct: 90 },
    { name: "JavaScript", level: "Advanced", pct: 75 },
    { name: "Problem Solving", level: "Advanced", pct: 70 },
    { name: "Leadership", level: "Intermediate", pct: 40 },
    { name: "Public Speaking", level: "Intermediate", pct: 35 }
  ];

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
    <div className="dashboard-content-grid">
      
      {/* Welcome banner at the top */}
      <div className="welcome-banner-row">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
            Welcome back, {user.name ? user.name.split(' ')[0] : 'Amit'}! 👋
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Here's what you've achieved so far.</p>
        </div>
        <button className="signin-btn" onClick={() => onNavigateTo('activity')} style={{ borderRadius: '8px', padding: '10px 20px' }}>
          Issue History
        </button>
      </div>

      {/* Profile Overview Section with Stats */}
      <div className="profile-metrics-row">
        {/* Left Profile details block */}
        <div className="profile-detail-box">
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <div className="profile-photo-circle" style={{ width: '80px', height: '80px', margin: 0 }}>
              {user.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <button className="photo-edit-overlay-btn" onClick={() => onNavigateTo('settings')} title="Edit Profile Photo">
              <i className="fa-solid fa-pencil"></i>
            </button>
          </div>
          <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              {user.name || 'Amit Kumar Yadav'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, margin: '2px 0 6px' }}>
              {user.headline || 'Cloud Enthusiast | Developer | Lifelong Learner'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }}></i>
              <span>Amravati, Maharashtra</span>
            </div>
            <span 
              className="completion-action-link" 
              onClick={() => onNavigateTo('settings')}
              style={{ display: 'inline-block', marginTop: '8px', fontWeight: 800, fontSize: '11px' }}
            >
              Edit Profile
            </span>
          </div>
        </div>

        {/* Four side-by-side metric counters exactly like screenshot */}
        <div className="metrics-cards-container">
          <div className="metric-box-card" onClick={() => onNavigateTo('my-badges')}>
            <div className="metric-box-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <i className="fa-solid fa-file-contract"></i>
            </div>
            <div className="metric-box-num">{credentials.filter(c => c.type === 'certificate').length + 24}</div>
            <div className="metric-box-label">Certificates</div>
            <span className="metric-box-link" style={{ color: '#2563eb' }}>View all <i className="fa-solid fa-arrow-right"></i></span>
          </div>

          <div className="metric-box-card" onClick={() => onNavigateTo('my-badges')}>
            <div className="metric-box-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="metric-box-num">{credentials.filter(c => c.type === 'badge').length + 18}</div>
            <div className="metric-box-label">Badges</div>
            <span className="metric-box-link" style={{ color: '#7c3aed' }}>View all <i className="fa-solid fa-arrow-right"></i></span>
          </div>

          <div className="metric-box-card" onClick={() => onNavigateTo('collections')}>
            <div className="metric-box-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <i className="fa-solid fa-gem"></i>
            </div>
            <div className="metric-box-num">{credentials.length + 12}</div>
            <div className="metric-box-label">Achievements</div>
            <span className="metric-box-link" style={{ color: '#16a34a' }}>View all <i className="fa-solid fa-arrow-right"></i></span>
          </div>

          <div className="metric-box-card" onClick={() => onNavigateTo('activity')}>
            <div className="metric-box-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <i className="fa-solid fa-bolt"></i>
            </div>
            <div className="metric-box-num">{user.xp || 180}</div>
            <div className="metric-box-label">Points Earned</div>
            <span className="metric-box-link" style={{ color: '#ea580c' }}>View Leaderboard <i className="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      </div>

      {/* Main Double-Column Layout */}
      <div className="dashboard-columns-grid">
        
        {/* Left Column: Recent List and Sharing */}
        <div className="dashboard-left-col">
          <div className="admin-card" style={{ padding: '20px 24px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span 
                  className={`tab-link ${activeTab === 'credentials' ? 'active' : ''}`}
                  onClick={() => setActiveTab('credentials')}
                  style={{ cursor: 'pointer', fontWeight: 800, fontSize: '13px', paddingBottom: '10px', color: activeTab === 'credentials' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'credentials' ? '2px solid var(--primary)' : 'none' }}
                >
                  Recent Credentials
                </span>
                <span 
                  className={`tab-link ${activeTab === 'badges' ? 'active' : ''}`}
                  onClick={() => setActiveTab('badges')}
                  style={{ cursor: 'pointer', fontWeight: 800, fontSize: '13px', paddingBottom: '10px', color: activeTab === 'badges' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'badges' ? '2px solid var(--primary)' : 'none' }}
                >
                  Recent Badges
                </span>
                <span 
                  className={`tab-link ${activeTab === 'achievements' ? 'active' : ''}`}
                  onClick={() => setActiveTab('achievements')}
                  style={{ cursor: 'pointer', fontWeight: 800, fontSize: '13px', paddingBottom: '10px', color: activeTab === 'achievements' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'achievements' ? '2px solid var(--primary)' : 'none' }}
                >
                  Recent Achievements
                </span>
              </div>
              <span 
                className="view-all-link" 
                style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }}
                onClick={() => onNavigateTo('my-badges')}
              >
                View All
              </span>
            </div>

            {/* List block vertical items exactly matching screenshot */}
            <div className="list-credentials-container">
              {credentials.slice(0, 4).map((cred) => {
                const brand = getBrandDetails(cred.title);
                return (
                  <div key={cred.id} className="list-credential-row">
                    <div className="list-icon-badge-box" style={{ background: brand.bg, color: brand.color }}>
                      <i className={`fa-solid ${brand.icon}`}></i>
                    </div>
                    <div style={{ flexGrow: 1, textAlign: 'left' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)' }}>{cred.title}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', margin: '2px 0' }}>
                        Microsoft Student Club PRPCEM
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Issued on {cred.issue_date} • ID: {cred.id}
                      </span>
                    </div>
                    <div className="list-verify-pill">
                      <i className="fa-solid fa-circle-check"></i> Verified
                    </div>
                    <button className="list-view-btn" onClick={() => onSelectCredential(cred)}>
                      View Credential
                    </button>
                    <button className="list-action-dots-btn" onClick={() => onShare(cred)} title="Share Actions">
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </div>
                );
              })}

              {credentials.length === 0 && (
                <p style={{ padding: '30px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No recent credentials found. Simulating publish to earn credentials.
                </p>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <span 
                className="completion-action-link" 
                style={{ fontWeight: 800, fontSize: '12px' }}
                onClick={() => onNavigateTo('my-badges')}
              >
                View All Credentials <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </div>

          {/* Share Achievements Panel */}
          <div className="admin-card" style={{ background: 'white', padding: '20px 24px', marginTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              Share Your Achievements
            </h4>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Showcase your credentials on platforms and with your network.
            </p>

            <div className="sharing-buttons-row">
              <a 
                href={credentials.length > 0 ? getLinkedInLink(credentials[0]) : '#'} 
                target="_blank" 
                rel="noreferrer" 
                className="share-tray-btn"
              >
                <i className="fa-brands fa-linkedin" style={{ color: '#0a66c2' }}></i> Share on LinkedIn
              </a>
              <button className="share-tray-btn" onClick={() => credentials.length > 0 ? onShare(credentials[0]) : null}>
                <i className="fa-solid fa-envelope" style={{ color: '#ea4335' }}></i> Share via Email
              </button>
              <button className="share-tray-btn" onClick={() => credentials.length > 0 ? onDownload(credentials[0]) : null}>
                <i className="fa-solid fa-download" style={{ color: 'var(--primary)' }}></i> Download Portfolio
              </button>
              <button className="share-tray-btn" onClick={() => onNavigateTo('public-profile')}>
                <i className="fa-solid fa-user-check" style={{ color: '#16a34a' }}></i> Share Public Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics, Top Skills and Activity Feed */}
        <div className="dashboard-right-col">
          
          {/* Progress Donut Chart */}
          <div className="wallet-section-card" style={{ background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>My Progress</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => onNavigateTo('collections')}>
                View Analytics <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="donut-chart-container">
                <svg width="90" height="90" viewBox="0 0 36 36">
                  <path
                    className="donut-ring"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3.5"
                  />
                  <path
                    className="donut-segment"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3.5"
                    strokeDasharray="75, 100"
                  />
                  <text x="18" y="20.5" className="donut-number" style={{ fontStyle: 'Outfit', fontWeight: 800, fontSize: '8px', fill: 'var(--text-main)', textAnchor: 'middle' }}>75%</text>
                  <text x="18" y="26.5" className="donut-label" style={{ fontWeight: 700, fontSize: '3px', fill: 'var(--text-muted)', textAnchor: 'middle' }}>Completed</text>
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span> Certificates
                  </span>
                  <span style={{ fontWeight: 800 }}>25/30</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Badges
                  </span>
                  <span style={{ fontWeight: 800 }}>18/25</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></span> Achievements
                  </span>
                  <span style={{ fontWeight: 800 }}>14/20</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></span> Skills
                  </span>
                  <span style={{ fontWeight: 800 }}>12/20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Skills sliders exactly matching screenshot */}
          <div className="wallet-section-card" style={{ background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>Top Skills</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => onNavigateTo('settings')}>
                View All <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topSkills.map((skill, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text-main)' }}>{skill.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{skill.level}</span>
                  </div>
                  <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${skill.pct}%`, height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity stream exactly matching screenshot */}
          <div className="wallet-section-card" style={{ background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>Recent Activity</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => onNavigateTo('activity')}>
                View All <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>

            <div className="timeline-feed" style={{ paddingLeft: '16px' }}>
              <div className="timeline-node" style={{ paddingBottom: '14px' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>17 July 2026</div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  Earned a badge: <span style={{ color: 'var(--primary)' }}>Cloud Beginner</span>
                </div>
              </div>
              <div className="timeline-node" style={{ paddingBottom: '14px' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>16 July 2026</div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  Credential verified: <span style={{ color: 'var(--primary)' }}>AI Workshop Completion</span>
                </div>
              </div>
              <div className="timeline-node" style={{ paddingBottom: '0' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>15 July 2026</div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  Shared a credential: <span style={{ color: 'var(--primary)' }}>Copilot Dev Days Certificate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
