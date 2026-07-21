import React, { useState } from 'react';

export default function BulkIssueForm({ onShowNotification, onRefresh }) {
  const [csvContent, setCsvContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBulkIssue = async (e) => {
    e.preventDefault();
    if (!csvContent.trim()) {
      onShowNotification("Please enter or paste recipient CSV data first.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/bulk-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      });

      const data = await res.json();
      if (res.ok) {
        onShowNotification(`Successfully issued ${data.issuedCount} credentials in bulk!`);
        setCsvContent('');
        if (onRefresh) onRefresh();
      } else {
        onShowNotification(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateCSVLoad = () => {
    // Generate simple sample CSV lines
    const sample = 
`name,email,type,title,category,issue_date,badge_icon,description
Aman Verma,aman.verma@mscprpcem.tech,certificate,React Native Workshop,Workshop,20 July 2026,fa-code,Completed mobile dev track.
Karan Johar,karan.johar@mscprpcem.tech,badge,Technical Core Member,Team,20 July 2026,fa-shield-halved,Appointed to Technical domain.`;
    setCsvContent(sample);
    onShowNotification("Loaded template CSV into workspace!");
  };

  return (
    <div className="admin-card" style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'left', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 900, borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', color: 'var(--text-main)' }}>
        <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#10b981', marginRight: '8px' }}></i>
        Bulk Issue Credentials
      </h3>

      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
        Paste raw CSV entries directly below, or load the pre-formatted simulation template. The Credentials engine will automatically parse rows, generate unique certificate UUID keys, and send email notifications to all recipients.
      </p>

      <form onSubmit={handleBulkIssue}>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontWeight: 800, color: 'var(--text-muted)' }}>CSV Entries (Comma Separated) *</label>
            <button 
              type="button" 
              className="public-profile-anchor" 
              style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }} 
              onClick={handleSimulateCSVLoad}
            >
              <i className="fa-solid fa-magic-wand-sparkles"></i> Load Sample Template
            </button>
          </div>
          
          <textarea
            className="form-input"
            style={{ height: '200px', fontFamily: 'Courier New, monospace', fontSize: '12px', resize: 'vertical', lineHeight: '1.6', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            placeholder="name,email,type,title,category,issue_date,badge_icon,description&#10;Amit Kumar,amit@mscprpcem.tech,certificate,Vite React Crash Course,Workshop,20 July 2026,fa-code,Passed final build checks."
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="auth-submit-btn" 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#10b981', padding: '14px', borderRadius: '8px', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer', transition: 'all 0.2s ease' }}
          disabled={submitting}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; }}
        >
          {submitting ? (
            <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing batch rows...</>
          ) : (
            <><i className="fa-solid fa-upload"></i> Publish Batch Credentials</>
          )}
        </button>
      </form>
    </div>
  );
}
