import React, { useState } from 'react';

export default function ManageCredentials({ credentials, loading, onRevoke, _onShowNotification }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = credentials.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      c.id.toLowerCase().includes(query) ||
      c.recipient_name.toLowerCase().includes(query) ||
      c.recipient_email.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query);

    const matchesType = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="manage-list-card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)' }}>
      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--text-main)' }}>
            <i className="fa-solid fa-file-contract" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            Issued Credentials Record
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0' }}>Search, review and revoke issued Event Certificates or Team Member Badges.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexGrow: 1, maxWidth: '500px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <select 
            className="form-input" 
            style={{ width: '130px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="certificate">Certificates</option>
            <option value="badge">Badges</option>
          </select>

          <div style={{ position: 'relative', flexGrow: 1, maxWidth: '320px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px' }}></i>
            <input
              type="text"
              className="form-input"
              style={{ padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', width: '100%' }}
              placeholder="Search by ID, name, email or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-circle-notch fa-spin"></i> Loading record log rows...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
          No issued records match your query.
        </div>
      ) : (
        <div className="admin-table-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: 700 }}>Credential ID</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: 700 }}>Recipient Details</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: 700 }}>Type</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: 700 }}>Title & Category</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: 700 }}>Issue Date</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cred) => (
                <tr key={cred.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>
                    {cred.id}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cred.recipient_name}</div>
                    {cred.recipient_email && 
                     (!cred.recipient_email.toLowerCase().endsWith('@mscprpcem.tech') || 
                      cred.recipient_email.toLowerCase() === 'student@mscprpcem.tech' ||
                      cred.recipient_email.toLowerCase() === 'admin@mscprpcem.tech') ? (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cred.recipient_email}</div>
                    ) : null}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span 
                      className={`badge-tag ${cred.type}`} 
                      style={{ 
                        margin: 0, 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '10px', 
                        fontWeight: 800, 
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        background: cred.type === 'certificate' ? '#eff6ff' : '#f5f3ff',
                        color: cred.type === 'certificate' ? '#2563eb' : '#7c3aed'
                      }}
                    >
                      {cred.type === 'certificate' ? '🏆 Certificate' : '🛡️ Badge'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cred.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{cred.category || 'General'}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {cred.issue_date}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button 
                      className="revoke-action-btn" 
                      style={{ background: 'transparent', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => onRevoke(cred.id)}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.borderColor = '#dc2626'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                    >
                      <i className="fa-solid fa-circle-minus"></i> Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
