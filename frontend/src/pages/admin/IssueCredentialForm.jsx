import React, { useState } from 'react';

export default function IssueCredentialForm({ onShowNotification, onRefresh }) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [type, setType] = useState('certificate');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Event');
  const [domain, setDomain] = useState('');
  const [issueDate, setIssueDate] = useState('20 July 2026');
  const [description, setDescription] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('fa-award');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientName || !recipientEmail || !title || !issueDate) {
      onShowNotification("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const payload = {
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      type,
      title,
      category,
      domain: type === 'badge' ? domain : null,
      issue_date: issueDate,
      description,
      badge_icon: badgeIcon
    };

    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        onShowNotification("Credential issued successfully!");
        // Reset form
        setRecipientName('');
        setRecipientEmail('');
        setTitle('');
        setDomain('');
        setDescription('');
        if (onRefresh) onRefresh();
      } else {
        onShowNotification(`Error: ${data.error}`);
      }
    } catch (err) {
      onShowNotification("Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-card" style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'left', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 900, borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px', color: 'var(--text-main)' }}>
        <i className="fa-solid fa-square-plus" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
        Issue New Credential
      </h3>

      <form className="issue-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Recipient Full Name *</label>
            <input
              type="text"
              className="form-input"
              style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
              placeholder="e.g. Amit Kumar Yadav"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Recipient Email Address *</label>
            <input
              type="email"
              className="form-input"
              style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
              placeholder="e.g. student@mscprpcem.tech"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Credential Type *</label>
            <select
              className="form-input"
              style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCategory(e.target.value === 'certificate' ? 'Event' : 'Team');
                setBadgeIcon(e.target.value === 'certificate' ? 'fa-award' : 'fa-shield-halved');
              }}
            >
              <option value="certificate">Certificate (Participation/Skill Badge)</option>
              <option value="badge">Badge (Team Member/Achievement)</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Achievement Title *</label>
            <input
              type="text"
              className="form-input"
              style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
              placeholder="e.g. Cloud Study Jam Champion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Category</label>
            <input
              type="text"
              className="form-input"
              style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
              placeholder="e.g. Event, Team, Workshop, Competition"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {type === 'badge' ? (
            <div className="form-group">
              <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Team Domain / Role</label>
              <input
                type="text"
                className="form-input"
                style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                placeholder="e.g. Web Development Lead, ML Coordinator"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-group">
              <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Issue Date *</label>
              <input
                type="text"
                className="form-input"
                style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: type === 'badge' ? '1fr 1fr' : '1fr', gap: '16px' }}>
          {type === 'badge' && (
            <div className="form-group">
              <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Issue Date *</label>
              <input
                type="text"
                className="form-input"
                style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Badge Design Icon</label>
            <select
              className="form-input"
              style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
              value={badgeIcon}
              onChange={(e) => setBadgeIcon(e.target.value)}
            >
              <option value="fa-award">Award Badge (Default Certificate)</option>
              <option value="fa-shield-halved">Shield Badge (Default Team)</option>
              <option value="fa-cloud">Cloud (Azure/GCP)</option>
              <option value="fa-brain">Brain (AI/ML)</option>
              <option value="fa-code">Code (Web Dev)</option>
              <option value="fa-trophy">Trophy (Competition/Quiz)</option>
              <option value="fa-star">Star (Outstanding Contribution)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Description / Details</label>
          <textarea
            className="form-input"
            style={{ height: '100px', resize: 'vertical', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '12px' }}
            placeholder="Describe the skills demonstrated or tasks accomplished by the student..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          className="auth-submit-btn" 
          style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px', borderRadius: '8px', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer', transition: 'all 0.2s ease' }}
          disabled={submitting}
        >
          {submitting ? (
            <><i className="fa-solid fa-circle-notch fa-spin"></i> Issuing...</>
          ) : (
            <><i className="fa-solid fa-paper-plane"></i> Issue Credential</>
          )}
        </button>
      </form>
    </div>
  );
}
