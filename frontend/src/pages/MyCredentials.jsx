import React, { useState } from 'react';

export default function MyCredentials({ 
  _user, 
  credentials, 
  onSelectCredential, 
  onShare, 
  onDownload, 
  _onNavigateTo,
  _getLinkedInLink 
}) {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Certificates', value: 'Certificates' },
    { label: 'Badges', value: 'Badges' }
  ];

  // Map filters to credentials array
  const filteredCredentials = credentials.filter(c => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Certificates') return c.type === 'certificate';
    if (selectedFilter === 'Badges') return c.type === 'badge';
    
    // Check category match case-insensitively
    const category = c.category ? c.category.toLowerCase() : '';
    return category === selectedFilter.toLowerCase();
  });

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
    return { bg: '#f8fafc', color: '#475569', icon: 'fa-award' };
  };

  return (
    <div className="wallet-wrapper" id="my-credentials-view-root" style={{ padding: 0 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            My Digital Wallet
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Browse, filter, download and showcase your verified credentials.
          </p>
        </div>
      </div>


      {/* Modern Horizontal Filter Tabs */}
      <div className="verify-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            className={`tab-btn ${selectedFilter === opt.value ? 'active' : ''}`}
            onClick={() => setSelectedFilter(opt.value)}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '20px',
              whiteSpace: 'nowrap'
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid of Filtered Credentials */}
      {filteredCredentials.length === 0 ? (
        <div className="empty-dashboard" style={{ padding: '60px 20px', textAlign: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <div className="empty-icon-box" style={{ background: '#f8fafc', color: '#cbd5e1', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', margin: '0 auto 16px' }}>
            <i className="fa-solid fa-award"></i>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            No Credentials Found
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            No active achievements found matching the filter "{selectedFilter}".
          </p>
        </div>
      ) : (
        <div className="wallet-badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredCredentials.map((cred) => {
            const brand = getBrandDetails(cred.title);
            const skills = (cred.skills_list || 'Technology').split(',');

            return (
              <div 
                key={cred.id} 
                className={`premium-badge-card ${cred.type}`}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
              >
                {/* Card Header Info */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div 
                      style={{ 
                        background: brand.bg, 
                        color: brand.color, 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        fontSize: '20px' 
                      }}
                    >
                      <i className={`fa-solid ${brand.icon}`}></i>
                    </div>
                    <span 
                      style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: cred.type === 'certificate' ? '#ecfdf5' : '#eff6ff',
                        color: cred.type === 'certificate' ? '#10b981' : '#2563eb'
                      }}
                    >
                      {cred.type}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                    {cred.title}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px 0', fontWeight: 600 }}>
                    Microsoft Student Club PRPCEM
                  </p>

                  <div className="badge-skills-tray" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="badge-skill-tag"
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          background: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '4px'
                        }}
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer and Actions */}
                <div>
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      fontSize: '11px', 
                      color: 'var(--text-muted)',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '12px',
                      marginBottom: '16px'
                    }}
                  >
                    <span>Issued: {cred.issue_date}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{cred.id}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <button 
                      className="badge-btn primary-btn" 
                      onClick={() => onSelectCredential(cred)}
                      style={{ padding: '8px 0', fontSize: '11px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                    >
                      View
                    </button>
                    <button 
                      className="badge-btn" 
                      onClick={() => onDownload(cred)}
                      style={{ padding: '8px 0', fontSize: '11px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', background: '#f8fafc', color: 'var(--text-main)', border: '1px solid #e2e8f0' }}
                    >
                      Download
                    </button>
                    <button 
                      className="badge-btn" 
                      onClick={() => onShare(cred)}
                      style={{ padding: '8px 0', fontSize: '11px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', background: '#f8fafc', color: 'var(--text-main)', border: '1px solid #e2e8f0' }}
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
