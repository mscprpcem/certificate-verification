import React, { useState } from 'react';

export default function Settings({ user, onShowNotification, onProfileUpdate }) {
  const [name, setName] = useState(user.name || '');
  const [headline, setHeadline] = useState(user.headline || '');
  const [bio, setBio] = useState(user.bio || '');
  const [_photoUrl, _setPhotoUrl] = useState('');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [linkedin, _setLinkedin] = useState(user.linkedin_url || '');
  const [github, _setGithub] = useState(user.github_url || '');
  const [visibility, setVisibility] = useState(true); // Toggle for public visibility

  // Parse skills state
  const initialSkills = JSON.parse(user.skills || '{}');
  const [cloudRating, _setCloudRating] = useState(initialSkills.Cloud || 3);
  const [javaRating, _setJavaRating] = useState(initialSkills.Java || 3);
  const [aiRating, _setAiRating] = useState(initialSkills.AI || 3);
  const [leadRating, _setLeadRating] = useState(initialSkills.Leadership || 3);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      headline,
      bio,
      linkedin_url: linkedin,
      github_url: github,
      skills: {
        Cloud: parseInt(cloudRating),
        Java: parseInt(javaRating),
        AI: parseInt(aiRating),
        Leadership: parseInt(leadRating)
      }
    };

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onShowNotification("🎉 Profile settings updated successfully!");
        onProfileUpdate();
      } else {
        const data = await res.json();
        onShowNotification(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Failed to update profile settings.");
    }
  };

  const handleUpdateEmail = (e) => {
    e.preventDefault();
    if (!email) {
      onShowNotification("Please enter a valid email address.");
      return;
    }
    onShowNotification("✉️ Simulated verification email sent to: " + email);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      onShowNotification("Please fill in both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      onShowNotification("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      onShowNotification("Password must be at least 6 characters.");
      return;
    }
    onShowNotification("🔒 Password changed successfully!");
    setPassword('');
    setConfirmPassword('');
  };

  const handlePhotoUploadMock = () => {
    onShowNotification("📸 Profile photo uploaded and updated!");
  };

  return (
    <div className="wallet-wrapper" style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Profile Info Card */}
      <div className="admin-card" style={{ background: 'white' }}>
        <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', textAlign: 'left' }}>
          <i className="fa-regular fa-user" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
          Profile Information
        </h3>

        {/* Profile Photo Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f8fafc' }}>
          <div className="profile-photo-circle" style={{ width: '70px', height: '70px', fontSize: '24px', margin: 0 }}>
            {name ? name[0].toUpperCase() : 'A'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 4px 0' }}>Profile Photo</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handlePhotoUploadMock} className="list-view-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
                Change Photo
              </button>
              <button onClick={() => onShowNotification("Profile photo reset to default.")} className="list-view-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#f1f5f9', color: 'var(--text-muted)' }}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitProfile} className="issue-form" style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Professional Headline</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cloud Enthusiast / Software Builder"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Biography</label>
            <textarea
              className="form-input"
              style={{ height: '90px', resize: 'vertical' }}
              placeholder="Write a brief overview about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Visibility Toggle Switch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', margin: '20px 0' }}>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Public Profile Visibility</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Allow others to discover your profile and credentials via name search.</p>
            </div>
            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
              <input 
                type="checkbox" 
                checked={visibility} 
                onChange={() => { setVisibility(!visibility); onShowNotification(visibility ? "🔒 Public visibility disabled." : "🌐 Public visibility enabled!"); }} 
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: visibility ? 'var(--primary)' : '#ccc', borderRadius: '34px', transition: '.4s' }}></span>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn">
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* Account Email and Password Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Email Settings Card */}
        <div className="admin-card" style={{ background: 'white' }}>
          <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', textAlign: 'left' }}>
            <i className="fa-regular fa-envelope" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
            Email Address
          </h3>
          
          <form onSubmit={handleUpdateEmail} className="issue-form" style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label>Current Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="signin-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Update and Verify Email
            </button>
          </form>
        </div>

        {/* Password Settings Card */}
        <div className="admin-card" style={{ background: 'white' }}>
          <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', textAlign: 'left' }}>
            <i className="fa-solid fa-lock" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
            Change Password
          </h3>
          
          <form onSubmit={handleUpdatePassword} className="issue-form" style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="signin-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Update Password
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
