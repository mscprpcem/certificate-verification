import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ credentials, onNavigateToSubView, onShowNotification }) {
  const [dbMetrics, setDbMetrics] = useState(null);

  useEffect(() => {
    fetch('/api/credentials/metrics')
      .then(res => res.json())
      .then(data => setDbMetrics(data))
      .catch(err => console.error("Failed to load dashboard live metrics:", err));
  }, [credentials]);

  // Compute metrics dynamically from current credentials list
  const certificatesCount = credentials.filter(c => c.type === 'certificate').length;
  const badgesCount = credentials.filter(c => c.type === 'badge').length;
  const uniqueStudents = new Set(credentials.map(c => c.recipient_email)).size;

  const displayCertificates = certificatesCount;
  const displayBadges = badgesCount;
  const displayStudents = uniqueStudents;
  const displayVerifications = dbMetrics ? dbMetrics.verifiedToday : 0;
  const displayDownloads = dbMetrics ? dbMetrics.downloadsToday : 0;
  const displayShares = dbMetrics ? dbMetrics.linkedinShares : 0;

  // Visual metrics matching live database sync
  const cards = [
    { title: "Credentials Issued", count: displayCertificates.toLocaleString(), change: "↑ 18.8% this month", icon: "fa-file-invoice", sub: "View all", target: "credentials" },
    { title: "Badges Issued", count: displayBadges.toLocaleString(), change: "↑ 22.4% this month", icon: "fa-award", sub: "View all", target: "badges" },
    { title: "Active Students", count: displayStudents.toLocaleString(), change: "↑ 12.3% this month", icon: "fa-users", sub: "View all", target: "users" },
    { title: "Verifications", count: displayVerifications.toLocaleString(), change: "↑ 16.7% this month", icon: "fa-circle-check", sub: "View all", target: "requests" },
    { title: "Downloads", count: displayDownloads.toLocaleString(), change: "↑ 15.3% this month", icon: "fa-download", sub: "View all", target: "analytics" },
    { title: "Shares", count: displayShares.toLocaleString(), change: "↑ 20.1% this month", icon: "fa-share-nodes", sub: "View all", target: "analytics" }
  ];

  // Group credentials by title to find the most common ones
  const credentialCounts = {};
  credentials.forEach(c => {
    credentialCounts[c.title] = (credentialCounts[c.title] || 0) + 1;
  });
  const topCredentials = Object.entries(credentialCounts)
    .map(([name, count]) => {
      let icon = "fa-award";
      const lower = name.toLowerCase();
      if (lower.includes("azure") || lower.includes("cloud")) icon = "fa-cloud";
      else if (lower.includes("ai") || lower.includes("intelligence") || lower.includes("copilot")) icon = "fa-brain";
      else if (lower.includes("web") || lower.includes("code") || lower.includes("git")) icon = "fa-code";
      else if (lower.includes("lead") || lower.includes("president") || lower.includes("member")) icon = "fa-shield-halved";
      return { name, count, icon };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentIssued = credentials
    .slice()
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5)
    .map(c => ({
      name: c.recipient_name,
      id: c.id,
      date: c.issue_date,
      status: "Verified"
    }));

  const recentVerifications = [
    { label: "A credential was verified", id: "MSC-CERT-2026-0123", time: "18 Jun 2026 11:42 AM" },
    { label: "A badge was verified", id: "MSC-BDG-2026-0054", time: "18 Jun 2026 11:28 AM" },
    { label: "A credential was verified", id: "MSC-CERT-2026-0102", time: "18 Jun 2026 11:14 AM" },
    { label: "A credential was verified", id: "MSC-CERT-2026-0098", time: "18 Jun 2026 10:59 AM" },
    { label: "A badge was verified", id: "MSC-BDG-2026-0041", time: "18 Jun 2026 10:47 AM" }
  ];

  return (
    <div className="dashboard-content-grid" style={{ padding: 0 }}>
      {/* Title block */}
      <div className="welcome-banner-row" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '24px 32px', borderRadius: '16px', color: 'white', border: 'none', boxShadow: '0 8px 30px rgba(37, 99, 235, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'white', margin: 0 }}>Admin Dashboard 👋</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', marginTop: '4px', margin: 0 }}>Control Center: Configure pathways, issue badges, and audit student credentials.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 700, color: 'white' }}>
          <i className="fa-regular fa-calendar-days"></i> 16 May - 15 Jun 2026 <i className="fa-solid fa-angle-down" style={{ fontSize: '10px' }}></i>
        </div>
      </div>

      {/* 6 stats counters row */}
      <div className="metrics-cards-container" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
        {cards.map((c, i) => (
          <div key={i} className="metric-box-card" onClick={() => onNavigateToSubView(c.target)}>
            <div className="metric-box-icon" style={{ alignSelf: 'flex-start', background: c.bg || '#eff6ff', color: c.color || 'var(--primary)' }}>
              <i className={`fa-solid ${c.icon}`}></i>
            </div>
            <div style={{ textAlign: 'left', width: '100%', marginTop: '8px' }}>
              <div className="metric-box-num" style={{ fontSize: '20px', fontWeight: 900 }}>{c.count}</div>
              <div className="metric-box-label" style={{ fontSize: '9px', fontWeight: 800, margin: '2px 0 4px' }}>{c.title}</div>
              <div style={{ fontSize: '9px', color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                {c.change}
              </div>
              <div className="metric-box-link" style={{ borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '6px', color: c.color || 'var(--primary)' }}>
                {c.sub} <i className="fa-solid fa-arrow-right" style={{ fontSize: '7px' }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="dashboard-columns-grid" style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr' }}>
        {/* Issuance trend chart */}
        <div className="wallet-section-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>Credential Issuance Overview</h3>
            <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>This Month <i className="fa-solid fa-angle-down"></i></span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '10px', fontWeight: 700, marginBottom: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#2563eb', borderRadius: '50%' }}></span> Certificates 3,251</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#7c3aed', borderRadius: '50%' }}></span> Badges 8,142</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span> Achievements 2,431</span>
          </div>

          {/* SVG Trend Line Chart exactly like mockup */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <svg viewBox="0 0 500 150" width="100%" height="130px" style={{ overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* Certificates line (Blue) */}
              <path d="M 0 110 Q 100 90 200 80 T 400 60 T 500 40" fill="none" stroke="#2563eb" strokeWidth="2.5" />
              {/* Badges line (Purple) */}
              <path d="M 0 130 Q 100 100 200 95 T 400 70 T 500 30" fill="none" stroke="#7c3aed" strokeWidth="2.5" />
              {/* Achievements line (Green) */}
              <path d="M 0 140 Q 100 130 200 120 T 400 110 T 500 90" fill="none" stroke="#10b981" strokeWidth="2.5" />

              {/* Chart Dates */}
              <text x="0" y="146" fill="#94a3b8" fontSize="8" fontWeight="bold">16 May</text>
              <text x="100" y="146" fill="#94a3b8" fontSize="8" fontWeight="bold">23 May</text>
              <text x="200" y="146" fill="#94a3b8" fontSize="8" fontWeight="bold">30 May</text>
              <text x="300" y="146" fill="#94a3b8" fontSize="8" fontWeight="bold">6 Jun</text>
              <text x="400" y="146" fill="#94a3b8" fontSize="8" fontWeight="bold">13 Jun</text>
              <text x="470" y="146" fill="#94a3b8" fontSize="8" fontWeight="bold">15 Jun</text>
            </svg>
          </div>
        </div>

        {/* Donut distribution chart */}
        <div className="wallet-section-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px' }}>Credential Type Distribution</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexGrow: 1 }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 36 36" style={{ overflow: 'visible' }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3.2" strokeDasharray="23.5 76.5" strokeDashoffset="25" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c3aed" strokeWidth="3.2" strokeDasharray="58.8 41.2" strokeDashoffset="1.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3.2" strokeDasharray="17.6 82.4" strokeDashoffset="-57.3" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', lineHeight: '1.1' }}>
                <span style={{ fontSize: '13px', fontWeight: 900 }}>13,824</span>
                <span style={{ fontSize: '7px', color: 'var(--text-muted)', fontWeight: 800 }}>Total Issued</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-main)' }}><span style={{ color: '#2563eb' }}>●</span> Certificates</span>
                <span style={{ color: 'var(--text-muted)', paddingLeft: '8px' }}>23.5% (3,251)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-main)' }}><span style={{ color: '#7c3aed' }}>●</span> Badges</span>
                <span style={{ color: 'var(--text-muted)', paddingLeft: '8px' }}>58.8% (8,142)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-main)' }}><span style={{ color: '#10b981' }}>●</span> Achievements</span>
                <span style={{ color: 'var(--text-muted)', paddingLeft: '8px' }}>17.6% (2,431)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top issued list */}
        <div className="wallet-section-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>Top Issued Credentials</h3>
            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }} onClick={() => onNavigateToSubView("credentials")}>View all</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
            {topCredentials.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#eff6ff', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px' }}>
                    <i className={`fa-solid ${c.icon}`}></i>
                  </div>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--text-main)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{c.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 900 }}>{c.count}</div>
                  <div style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700 }}>Issued</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details & Actions row */}
      <div className="dashboard-columns-grid" style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr' }}>
        {/* Recent issued credentials list */}
        <div className="wallet-section-card" style={{ margin: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>Recent Issued Credentials</h3>
            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }} onClick={() => onNavigateToSubView("credentials")}>View all</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentIssued.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="profile-photo-circle" style={{ width: '28px', height: '28px', fontSize: '10px', margin: 0, border: '1px solid #cbd5e1', background: '#eff6ff' }}>
                    {c.name[0]}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-main)' }}>{c.name}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{c.id} • {c.date}</div>
                  </div>
                </div>
                <span style={{ fontSize: '9px', background: '#ecfdf5', color: '#10b981', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Verification Activity */}
        <div className="wallet-section-card" style={{ margin: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>Recent Verification Activity</h3>
            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }} onClick={() => onNavigateToSubView("requests")}>View all</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentVerifications.map((v, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '9px', marginTop: '2px' }}>
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800 }}>{v.label}</div>
                    <div style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>{v.id}</div>
                  </div>
                </div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', marginTop: '2px' }}>
                  {v.time.split(' ').slice(0, 3).join(' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="wallet-section-card" style={{ margin: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', textAlign: 'left' }}>Quick Actions</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <button 
              className="share-tray-btn" 
              style={{ justifyContent: 'flex-start', padding: '10px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              onClick={() => onNavigateToSubView("issue")}
            >
              <i className="fa-solid fa-square-plus" style={{ color: 'var(--primary)', fontSize: '13px' }}></i> Issue Credential
            </button>
            <button 
              className="share-tray-btn" 
              style={{ justifyContent: 'flex-start', padding: '10px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              onClick={() => onNavigateToSubView("issue")}
            >
              <i className="fa-solid fa-award" style={{ color: '#7c3aed', fontSize: '13px' }}></i> Issue Badge
            </button>
            <button 
              className="share-tray-btn" 
              style={{ justifyContent: 'flex-start', padding: '10px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              onClick={() => onNavigateToSubView("bulk")}
            >
              <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#10b981', fontSize: '13px' }}></i> Bulk Issue
            </button>
            <button 
              className="share-tray-btn" 
              style={{ justifyContent: 'flex-start', padding: '10px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              onClick={() => onNavigateToSubView("bulk")}
            >
              <i className="fa-solid fa-file-excel" style={{ color: '#f59e0b', fontSize: '13px' }}></i> Upload Recipients
            </button>
            <button 
              className="share-tray-btn" 
              style={{ justifyContent: 'flex-start', padding: '10px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              onClick={() => onNavigateToSubView("templates")}
            >
              <i className="fa-solid fa-pen-to-square" style={{ color: '#f43f5e', fontSize: '13px' }}></i> Create Template
            </button>
            <button 
              className="share-tray-btn" 
              style={{ justifyContent: 'flex-start', padding: '10px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              onClick={() => onNavigateToSubView("analytics")}
            >
              <i className="fa-solid fa-chart-line" style={{ color: '#06b6d4', fontSize: '13px' }}></i> View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Platform Summary Strip */}
      <div className="wallet-section-card" style={{ margin: 0, padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Platform Summary</h4>
          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }} onClick={() => onNavigateToSubView("analytics")}>View Full Report</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 900 }}>1,250</div>
              <div style={{ fontSize: '8px', color: '#16a34a', fontWeight: 800 }}>Total Users ↑ 12.3%</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px' }}>
              <i className="fa-solid fa-user-clock"></i>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 900 }}>890</div>
              <div style={{ fontSize: '8px', color: '#16a34a', fontWeight: 800 }}>Active Users ↑ 11.2%</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px' }}>
              <i className="fa-solid fa-file-lines"></i>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 900 }}>13,824</div>
              <div style={{ fontSize: '8px', color: '#16a34a', fontWeight: 800 }}>Credentials ↑ 19.4%</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fff1f2', color: '#f43f5e', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 900 }}>8,142</div>
              <div style={{ fontSize: '8px', color: '#16a34a', fontWeight: 800 }}>Total Badges ↑ 22.4%</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f0fdfa', color: '#0d9488', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 900 }}>45,231</div>
              <div style={{ fontSize: '8px', color: '#16a34a', fontWeight: 800 }}>Verifications ↑ 17.6%</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fff7ed', color: '#fbbf24', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px' }}>
              <i className="fa-solid fa-earth-americas"></i>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 900 }}>12</div>
              <div style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 800 }}>Countries Reached</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
