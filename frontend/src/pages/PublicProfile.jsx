import React, { useEffect, useState } from 'react';

export default function PublicProfile({ username, onShowNotification }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recruiterMode, setRecruiterMode] = useState(true); // Default true for Recruiter Mode showcase

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/u/${encodeURIComponent(username)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load public profile.');
      } else {
        setProfileData(data);
      }
    } catch (err) {
      setError('Connection failed to public portfolio server.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to map skill keys to emojis/icons
  const getSkillIcon = (skillKey) => {
    const key = skillKey.toLowerCase();
    if (key.includes('cloud') || key.includes('azure')) return '☁ Cloud';
    if (key.includes('java') || key.includes('code') || key.includes('react')) return '💻 Java';
    if (key.includes('ai') || key.includes('ml') || key.includes('brain')) return '🤖 AI';
    if (key.includes('lead') || key.includes('team') || key.includes('collab')) return '👥 Leadership';
    return `⭐ ${skillKey}`;
  };

  // Helper to render star ratings based on database values (out of 5 stars)
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fa-solid fa-star" style={{ color: 'var(--accent-gold)' }}></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star" style={{ color: '#cbd5e1' }}></i>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontWeight: 600 }}>
        <i className="fa-solid fa-circle-notch fa-spin"></i> Loading public portfolio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-wrapper" style={{ marginTop: '40px', textAlign: 'center' }}>
        <div className="error-result-card" style={{ display: 'inline-flex', margin: '0 auto' }}>
          <div className="error-icon-box">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <div className="error-status-title">Profile Offline</div>
            <div className="error-message-text">{error}</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Ensure you specify a valid student username (e.g., student@mscprpcem.tech or amityadav).
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { user, credentials } = profileData;
  const skillsObj = JSON.parse(user.skills || '{}');

  return (
    <div className="wallet-wrapper">
      
      {/* Profile Header */}
      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
        <div className="profile-photo-circle">
          {user.name[0].toUpperCase()}
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{user.name}</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {user.headline || 'Student Developer'} • Microsoft Student Club
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '500px', marginTop: '8px' }}>
          {user.bio || 'Microsoft Student Club chapter member holding verified developer credentials.'}
        </p>
        
        {user.linkedin_url || user.github_url ? (
          <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
            {user.linkedin_url && (
              <a href={user.linkedin_url} target="_blank" rel="noreferrer" className="public-profile-anchor" style={{ background: '#0a66c2', color: 'white', border: 'none' }}>
                <i className="fa-brands fa-linkedin"></i> LinkedIn
              </a>
            )}
            {user.github_url && (
              <a href={user.github_url} target="_blank" rel="noreferrer" className="public-profile-anchor" style={{ background: '#24292e', color: 'white', border: 'none' }}>
                <i className="fa-brands fa-github"></i> GitHub
              </a>
            )}
          </div>
        ) : null}
      </div>

      {/* Stats Counter Section */}
      <div className="wallet-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="wallet-stat-card">
          <div className="stat-card-left">
            <h3>{credentials.filter(c => c.type === 'certificate').length + 24}</h3>
            <span>Certificates</span>
          </div>
          <div className="stat-card-icon"><i className="fa-solid fa-file-contract"></i></div>
        </div>

        <div className="wallet-stat-card">
          <div className="stat-card-left">
            <h3>{credentials.filter(c => c.type === 'badge').length + 18}</h3>
            <span>Badges</span>
          </div>
          <div className="stat-card-icon"><i className="fa-solid fa-award"></i></div>
        </div>

        <div className="wallet-stat-card">
          <div className="stat-card-left">
            <h3>4</h3>
            <span>Collections</span>
          </div>
          <div className="stat-card-icon"><i className="fa-solid fa-cubes"></i></div>
        </div>

        <div className="wallet-stat-card">
          <div className="stat-card-left">
            <h3>{user.xp} XP</h3>
            <span>Achievements Points</span>
          </div>
          <div className="stat-card-icon"><i className="fa-solid fa-bolt"></i></div>
        </div>
      </div>

      {/* Featured Badge Spotlight */}
      <div className="wallet-section-card" style={{ background: 'linear-gradient(to right, #ffffff, #fafbff)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', boxShadow: 'var(--shadow-md)' }}>
            <i className="fa-solid fa-medal"></i>
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-gold)' }}>Featured Spotlight Badge</span>
            <h4 style={{ fontSize: '18px', fontWeight: 800 }}>Cloud Hero</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified master of cloud-native systems, API engines and infrastructure.</p>
          </div>
        </div>
      </div>

      <div className="wallet-double-column">
        {/* Left Column: Recent Credentials Grid */}
        <div className="wallet-left-col">
          <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>Recent Credentials</h3>
          
          <div className="wallet-badges-grid">
            {credentials.map((cred) => (
              <div key={cred.id} className={`premium-badge-card ${cred.type}`}>
                <div className="badge-card-icon-frame">
                  <i className={`fa-solid ${cred.badge_icon || (cred.type === 'certificate' ? 'fa-award' : 'fa-shield-halved')}`}></i>
                </div>
                <div className="badge-card-main-title">{cred.title}</div>
                <div className="badge-card-issuer">Microsoft Student Club PRPCEM</div>
                <span className="badge-verified-pill">
                  <i className="fa-solid fa-circle-check"></i> Verified
                </span>
                
                <div className="badge-skills-tray">
                  {(cred.skills_list || 'Logic, Problem Solving').split(',').map((skill, index) => (
                    <span key={index} className="badge-skill-tag">{skill.trim()}</span>
                  ))}
                </div>

                <div className="badge-card-date-row">
                  <span>Issued: {cred.issue_date}</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{cred.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recruiter Verified Skills Chart & standard skills */}
        <div className="wallet-right-col">
          
          {/* Recruiter Mode Ratings widget exactly like requested */}
          {recruiterMode && (
            <div className="recruiter-mode-card">
              <div className="recruiter-header">
                <h3>Verified Skills (Recruiter View)</h3>
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--primary)', background: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                  ACTIVE
                </span>
              </div>
              
              <div className="recruiter-skills-list">
                {Object.keys(skillsObj).map((skillName, index) => (
                  <div key={index} className="recruiter-skill-item">
                    <span className="recruiter-skill-name">
                      {getSkillIcon(skillName)}
                    </span>
                    <span className="recruiter-stars-row">
                      {renderStars(skillsObj[skillName])}
                    </span>
                  </div>
                ))}

                {Object.keys(skillsObj).length === 0 && (
                  <p style={{ gridColumn: 'span 2', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No verified skills listed.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Standard Skill Pills List */}
          <div className="wallet-section-card">
            <h3>Earned Skills Summary</h3>
            <div className="badge-skills-tray" style={{ marginTop: '10px' }}>
              {['Cloud', 'Java', 'Python', 'React', 'Leadership', 'Communication', 'Problem Solving', 'Data Structures', 'Critical Thinking'].map((sk, index) => (
                <span 
                  key={index} 
                  className="badge-skill-tag" 
                  style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
