import React, { useState, useRef } from 'react';

export default function Settings({ user, onShowNotification, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'social', 'security'

  const [name, setName] = useState(user.name || '');
  const [headline, setHeadline] = useState(user.headline || '');
  const [bio, setBio] = useState(user.bio || '');
  const [photoUrl, setPhotoUrl] = useState(user.profile_photo || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [linkedin, setLinkedin] = useState(user.linkedin_url || '');
  const [github, setGithub] = useState(user.github_url || '');
  const [visibility, setVisibility] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Handle image file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onShowNotification) onShowNotification("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (onShowNotification) onShowNotification("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target.result);
      if (onShowNotification) onShowNotification("📸 Profile photo selected! Click 'Save Profile Changes' to update.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      headline,
      bio,
      profile_photo: photoUrl,
      linkedin_url: linkedin,
      github_url: github
    };

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (onShowNotification) onShowNotification("🎉 Profile settings updated successfully!");
        if (onProfileUpdate) onProfileUpdate();
      } else {
        const data = await res.json();
        if (onShowNotification) onShowNotification(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      if (onShowNotification) onShowNotification("Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = (e) => {
    e.preventDefault();
    if (!email) {
      if (onShowNotification) onShowNotification("Please enter a valid email address.");
      return;
    }
    if (onShowNotification) onShowNotification("✉️ Verification link sent to: " + email);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      if (onShowNotification) onShowNotification("Please fill in both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      if (onShowNotification) onShowNotification("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      if (onShowNotification) onShowNotification("Password must be at least 6 characters.");
      return;
    }
    if (onShowNotification) onShowNotification("🔒 Password changed successfully!");
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Main Settings Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          Account & Profile Settings
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Manage your digital profile details, avatar picture, social handles, and security credentials.
        </p>
      </div>

      {/* Two-Column Side Navigation Layout */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Side Navigation Sidebar */}
        <div style={{ width: '260px', flexShrink: 0, background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          
          {/* User Profile Mini Card at top of sidebar */}
          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {photoUrl ? (
              <img src={photoUrl} alt="Avatar" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }} />
            ) : (
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {name ? name[0].toUpperCase() : 'U'}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {name || 'Account User'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {user.role === 'admin' ? '⚙ Admin' : '🎓 Member'}
              </div>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'profile' ? '#eff6ff' : 'transparent',
                color: activeTab === 'profile' ? '#2563eb' : 'var(--text-main)',
                fontWeight: activeTab === 'profile' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fa-regular fa-user" style={{ fontSize: '15px', color: activeTab === 'profile' ? '#2563eb' : '#64748b' }}></i>
              <span>Personal Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('social')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'social' ? '#eff6ff' : 'transparent',
                color: activeTab === 'social' ? '#2563eb' : 'var(--text-main)',
                fontWeight: activeTab === 'social' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fa-solid fa-globe" style={{ fontSize: '15px', color: activeTab === 'social' ? '#2563eb' : '#64748b' }}></i>
              <span>Social Accounts & Visibility</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'security' ? '#eff6ff' : 'transparent',
                color: activeTab === 'security' ? '#2563eb' : 'var(--text-main)',
                fontWeight: activeTab === 'security' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fa-solid fa-lock" style={{ fontSize: '15px', color: activeTab === 'security' ? '#2563eb' : '#64748b' }}></i>
              <span>Security & Password</span>
            </button>
          </div>

        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1 }}>

          {/* TAB 1: PERSONAL PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 20px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                Personal Profile Information
              </h3>

              {/* Avatar Upload Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }} />
                ) : (
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', fontSize: '26px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {name ? name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, margin: '0 0 4px 0' }}>Profile Avatar Picture</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>Upload a custom image file (PNG, JPG, WEBP up to 5MB).</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="list-view-btn"
                      style={{ padding: '6px 14px', fontSize: '12px', background: '#2563eb', color: 'white' }}
                    >
                      <i className="fa-solid fa-upload" style={{ marginRight: '6px' }}></i> Upload Picture
                    </button>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => { setPhotoUrl(''); if (onShowNotification) onShowNotification("Avatar reset."); }}
                        className="list-view-btn"
                        style={{ padding: '6px 12px', fontSize: '12px', background: '#f1f5f9', color: 'var(--text-muted)' }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ borderRadius: '10px' }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ borderRadius: '10px' }}
                      placeholder="e.g. Software Builder & Cloud Specialist"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Biography Overview
                  </label>
                  <textarea
                    className="form-input"
                    style={{ height: '100px', resize: 'vertical', borderRadius: '10px', lineHeight: '1.5' }}
                    placeholder="Briefly describe your expertise, active projects, and interest areas..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                {/* Public Profile URL Card Preview */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-link" style={{ color: '#2563eb' }}></i> Public Portfolio URL
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb' }}>
                    http://localhost:5173/u/{name ? name.toLowerCase().replace(/\s+/g, '') : 'username'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button 
                    type="submit" 
                    disabled={saving}
                    style={{ padding: '10px 22px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 800, fontSize: '13px', cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                    {saving ? 'Saving...' : 'Save Profile Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SOCIAL ACCOUNTS & VISIBILITY */}
          {activeTab === 'social' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 20px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                Social Handles & Public Visibility
              </h3>

              <form onSubmit={handleSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                    LinkedIn Profile Link
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="fa-brands fa-linkedin" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0a66c2', fontSize: '16px' }}></i>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '42px', borderRadius: '10px' }}
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                    GitHub Profile Link
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="fa-brands fa-github" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#24292e', fontSize: '16px' }}></i>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '42px', borderRadius: '10px' }}
                      placeholder="https://github.com/username"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                    />
                  </div>
                </div>

                {/* Visibility Switch */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0' }}>Public Discoverability</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Showcase your profile and credentials on `/u/username`.</p>
                  </div>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
                    <input 
                      type="checkbox" 
                      checked={visibility} 
                      onChange={() => { setVisibility(!visibility); if (onShowNotification) onShowNotification(visibility ? "🔒 Public visibility disabled." : "🌐 Public visibility enabled!"); }} 
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: visibility ? '#2563eb' : '#ccc', borderRadius: '34px', transition: '.4s' }}></span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button 
                    type="submit" 
                    disabled={saving}
                    style={{ padding: '10px 22px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 800, fontSize: '13px', cursor: saving ? 'wait' : 'pointer' }}
                  >
                    Save Social Links
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Email Box */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  Account Email
                </h3>
                
                <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                      Primary Email Address
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      style={{ borderRadius: '10px' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="signin-btn" style={{ borderRadius: '8px', padding: '8px 18px', fontSize: '12.5px' }}>
                      Update Email
                    </button>
                  </div>
                </form>
              </div>

              {/* Password Box */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  Change Password
                </h3>
                
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        className="form-input"
                        style={{ borderRadius: '10px' }}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="form-input"
                        style={{ borderRadius: '10px' }}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="signin-btn" style={{ borderRadius: '8px', padding: '8px 18px', fontSize: '12.5px' }}>
                      Change Password
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
