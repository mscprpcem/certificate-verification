import React, { useEffect, useState } from 'react';

export default function PublicProfile({ username, onShowNotification }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.error(err);
      setError('Connection failed to public portfolio server.');
    } finally {
      setLoading(false);
    }
  };

  const getSkillIcon = (skillKey) => {
    const key = skillKey.toLowerCase();
    if (key.includes('cloud') || key.includes('azure')) return '☁ Cloud';
    if (key.includes('java') || key.includes('code') || key.includes('react')) return '💻 Java';
    if (key.includes('ai') || key.includes('ml') || key.includes('brain')) return '🤖 AI';
    if (key.includes('lead') || key.includes('team') || key.includes('collab')) return '👥 Leadership';
    return `⭐ ${skillKey}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star" style={{ color: '#cbd5e1' }}></i>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontWeight: 700, color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#2563eb', marginBottom: '12px', display: 'block' }}></i>
        Loading verified public portfolio...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '500px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #fee2e2', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px' }}>
          <i className="fa-solid fa-user-xmark"></i>
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', color: '#991b1b' }}>Profile Not Found</h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>{error}</p>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Check if the username URL is spelled correctly (e.g. <code>http://localhost:5173/u/amityadav</code>).</p>
      </div>
    );
  }

  const { user, credentials } = profileData;
  const skillsObj = JSON.parse(user.skills || '{}');

  const handleCopyProfile = () => {
    const profileUrl = `${window.location.origin}/u/${encodeURIComponent(username)}`;
    navigator.clipboard.writeText(profileUrl);
    if (onShowNotification) {
      onShowNotification("🎉 Public portfolio URL copied to clipboard!");
    }
  };

  const certsCount = credentials.filter(c => c.type === 'certificate').length;
  const badgesCount = credentials.filter(c => c.type === 'badge').length;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      
      {/* Header Profile Hero Card */}
      <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        
        {/* Verified Badge Header Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px' }}>
          <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i> Verified Chapter Member
        </div>

        {user.profile_photo ? (
          <img 
            src={user.profile_photo} 
            alt={user.name} 
            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb', boxShadow: '0 6px 14px rgba(37,99,235,0.2)' }} 
          />
        ) : (
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', fontSize: '36px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #eff6ff', boxShadow: '0 6px 14px rgba(37,99,235,0.2)' }}>
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
        )}

        <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', margin: '12px 0 4px 0' }}>{user.name}</h2>
        <p style={{ fontSize: '14px', color: '#2563eb', fontWeight: 800, margin: '0 0 8px 0' }}>
          {user.headline || 'Student Developer'} • Microsoft Student Club PRPCEM
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 0 18px 0', lineHeight: '1.5' }}>
          {user.bio || 'Active Microsoft Student Club chapter member holding verified technical digital credentials.'}
        </p>

        {/* Action & Social Handles */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            type="button"
            onClick={handleCopyProfile}
            style={{ padding: '8px 16px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="fa-solid fa-share-nodes"></i> Share Portfolio
          </button>
          
          {user.linkedin_url && (
            <a href={user.linkedin_url} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', borderRadius: '10px', background: '#0a66c2', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-brands fa-linkedin"></i> LinkedIn
            </a>
          )}
          {user.github_url && (
            <a href={user.github_url} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', borderRadius: '10px', background: '#24292e', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-brands fa-github"></i> GitHub
            </a>
          )}
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            <i className="fa-solid fa-file-contract"></i>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>{certsCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Certificates</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            <i className="fa-solid fa-award"></i>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>{badgesCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Badges</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>100%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Verified Authenticity</div>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Credentials Grid & Skills Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Verified Credentials Showcase */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px 0' }}>
            Verified Digital Credentials ({credentials.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {credentials.map((cred) => (
              <div 
                key={cred.id} 
                style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: cred.type === 'certificate' ? '#eff6ff' : '#f5f3ff', color: cred.type === 'certificate' ? '#2563eb' : '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      <i className={`fa-solid ${cred.badge_icon || (cred.type === 'certificate' ? 'fa-award' : 'fa-shield-halved')}`}></i>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{cred.title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Microsoft Student Club PRPCEM</p>
                    </div>
                  </div>

                  <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                    Verified
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '12px 0' }}>
                  {(cred.skills_list || 'Logic, Problem Solving').split(',').map((skill, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: 'var(--text-muted)', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Issued: {cred.issue_date}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{cred.id}</span>
                </div>
              </div>
            ))}

            {credentials.length === 0 && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                No public credentials logged for this student.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verified Skills & Competencies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              Verified Competencies
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(skillsObj).map((skillName, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {getSkillIcon(skillName)}
                  </span>
                  <div style={{ display: 'flex', gap: '3px', fontSize: '11px' }}>
                    {renderStars(skillsObj[skillName])}
                  </div>
                </div>
              ))}

              {Object.keys(skillsObj).length === 0 && (
                ['Cloud Architecture', 'Python & AI', 'Java Programming', 'Leadership'].map((sName, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {getSkillIcon(sName)}
                    </span>
                    <div style={{ display: 'flex', gap: '3px', fontSize: '11px' }}>
                      {renderStars(4)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px 0' }}>
              Skill Badges Summary
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Cloud Infrastructure', 'Java Foundations', 'Python AI', 'React Framework', 'Team Leadership', 'Git & DevOps', 'Problem Solving'].map((sk, index) => (
                <span key={index} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
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
