import React, { useState } from 'react';

export default function Settings({ user, onShowNotification, onProfileUpdate }) {
  const [headline, setHeadline] = useState(user.headline || '');
  const [bio, setBio] = useState(user.bio || '');
  const [linkedin, setLinkedin] = useState(user.linkedin_url || '');
  const [github, setGithub] = useState(user.github_url || '');
  
  // Parse skills state
  const initialSkills = JSON.parse(user.skills || '{}');
  const [cloudRating, setCloudRating] = useState(initialSkills.Cloud || 3);
  const [javaRating, setJavaRating] = useState(initialSkills.Java || 3);
  const [aiRating, setAiRating] = useState(initialSkills.AI || 3);
  const [leadRating, setLeadRating] = useState(initialSkills.Leadership || 3);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
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
        onShowNotification("Profile settings updated successfully!");
        
        // Trigger profile refresh in parent App component
        onProfileUpdate();
      } else {
        const data = await res.json();
        onShowNotification(`Error: ${data.error}`);
      }
    } catch (err) {
      onShowNotification("Failed to update profile settings.");
    }
  };

  return (
    <div className="wallet-wrapper" style={{ maxWidth: '600px' }}>
      <div className="admin-card">
        <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px', fontWeight: 800 }}>
          Edit Profile Wallet Settings
        </h3>

        <form onSubmit={handleSubmit} className="issue-form">
          <div className="form-group">
            <label>Profile Headline / Bio Intro</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cloud Enthusiast / Software Builder"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Biography Summary</label>
            <textarea
              className="form-input"
              style={{ height: '80px', resize: 'vertical' }}
              placeholder="Write a brief overview about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>LinkedIn URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>GitHub URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://github.com/username"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '10px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Skill Ratings (Recruiter Mode Display)
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Cloud (1 - 5 Stars)</label>
                <select className="form-input" value={cloudRating} onChange={(e) => setCloudRating(e.target.value)}>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              <div className="form-group">
                <label>Java (1 - 5 Stars)</label>
                <select className="form-input" value={javaRating} onChange={(e) => setJavaRating(e.target.value)}>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              <div className="form-group">
                <label>AI / ML (1 - 5 Stars)</label>
                <select className="form-input" value={aiRating} onChange={(e) => setAiRating(e.target.value)}>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              <div className="form-group">
                <label>Leadership (1 - 5 Stars)</label>
                <select className="form-input" value={leadRating} onChange={(e) => setLeadRating(e.target.value)}>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" style={{ marginTop: '16px' }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
