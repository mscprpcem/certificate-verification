import React, { useEffect, useState } from 'react';
import AdminDashboard from './admin/AdminDashboard';
import IssueCredentialForm from './admin/IssueCredentialForm';
import BulkIssueForm from './admin/BulkIssueForm';
import ManageCredentials from './admin/ManageCredentials';

export default function AdminPanel({ _user, onShowNotification, adminSubView, onNavigateToSubView }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced States for newly implemented features
  const [users, setUsers] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [verificationLogs, setVerificationLogs] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  // States for Badge/Cert Templates, pathways/collections, revocation & chapter settings
  const [badgeTemplates, setBadgeTemplates] = useState([]);
  const [collections, setCollections] = useState([]);
  const [revokedCredentials, setRevokedCredentials] = useState([]);
  const [prefilledTemplate, setPrefilledTemplate] = useState(null);
  const [chapterSettings, setChapterSettings] = useState(() => {
    const saved = localStorage.getItem('msc_chapter_settings');
    return saved ? JSON.parse(saved) : {
      chapterName: "Microsoft Student Club PRPCEM",
      advisorName: "Prof. S. R. Patil",
      customDomain: "mscprpcem.tech",
      chapterId: "MSC-PRPCEM-4112"
    };
  });
  
  // Local Filter States
  const [usersSearch, setUsersSearch] = useState('');
  const [requestsSearch, setRequestsSearch] = useState('');

  useEffect(() => {
    fetchCredentials();
    fetchTemplates();
    fetchCollections();
  }, []);

  // Fetch contextual data based on current subview
  useEffect(() => {
    if (adminSubView === 'users' || adminSubView === 'roles') {
      fetchUsers();
    } else if (adminSubView === 'requests') {
      fetchVerificationRequests();
    } else if (adminSubView === 'templates') {
      fetchTemplates();
    } else if (adminSubView === 'collections') {
      fetchTemplates();
      fetchCollections();
    } else if (adminSubView === 'revoked') {
      fetchRevokedCredentials();
    } else if (adminSubView === 'analytics') {
      fetchUsers();
      fetchVerificationLogs();
    } else if (adminSubView === 'dashboard') {
      fetchUsers();
      fetchVerificationLogs();
    }
  }, [adminSubView]);


  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/admin/credentials');
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error("Failed to load admin credentials:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setSubLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchVerificationRequests = async () => {
    setSubLoading(true);
    try {
      const res = await fetch('/api/admin/verification-requests');
      if (res.ok) {
        const data = await res.json();
        setVerificationRequests(data);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchVerificationLogs = async () => {
    try {
      const res = await fetch('/api/admin/verification-logs');
      if (res.ok) {
        const data = await res.json();
        setVerificationLogs(data);
      }
    } catch (err) {
      console.error("Failed to load verification logs:", err);
    }
  };



  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/templates');
      if (res.ok) {
        const data = await res.json();
        setBadgeTemplates(data);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/admin/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err) {
      console.error("Failed to load collections:", err);
    }
  };

  const fetchRevokedCredentials = async () => {
    try {
      const res = await fetch('/api/admin/revoked');
      if (res.ok) {
        const data = await res.json();
        setRevokedCredentials(data);
      }
    } catch (err) {
      console.error("Failed to load revoked credentials:", err);
    }
  };


  const handleRevoke = async (id) => {
    if (!window.confirm(`Are you sure you want to revoke and delete credential ${id}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/credentials/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        onShowNotification(`Credential ${id} revoked.`);
        fetchCredentials();
      } else {
        const data = await res.json();
        onShowNotification(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Connection failure.");
    }
  };

  // Change user role permissions (Roles & Perms view)
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        onShowNotification(`User role successfully updated to '${newRole}'.`);
        fetchUsers();
      } else {
        const data = await res.json();
        onShowNotification(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Failed to update user role.");
    }
  };

  // Review a student manual submission claim (Requests view)
  const handleReviewRequest = async (requestId, status) => {
    const feedback = window.prompt(`Enter review notes/feedback for the student (optional):`);
    if (feedback === null) return; // cancel review

    try {
      const res = await fetch(`/api/admin/verification-requests/${requestId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: feedback })
      });
      if (res.ok) {
        onShowNotification(`Manual request successfully ${status}.`);
        fetchVerificationRequests();
        fetchCredentials(); // Reload credentials list in case a new record was auto-issued!
      } else {
        const data = await res.json();
        onShowNotification(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Failed to finalize review.");
    }
  };

  // Helpers to filter lists locally
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(usersSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(usersSearch.toLowerCase())
  );

  const filteredRequests = verificationRequests.filter(r => 
    r.student_name.toLowerCase().includes(requestsSearch.toLowerCase()) || 
    r.student_email.toLowerCase().includes(requestsSearch.toLowerCase()) ||
    r.title.toLowerCase().includes(requestsSearch.toLowerCase())
  );

  return (
    <div className="admin-container" style={{ padding: '24px 0', minHeight: '100vh', background: '#f8fafc' }} id="admin-panel-wrapper">
      
      {adminSubView === 'dashboard' && (
        <AdminDashboard 
          credentials={credentials} 
          users={users}
          verificationLogs={verificationLogs}
          onNavigateToSubView={onNavigateToSubView} 
          onShowNotification={onShowNotification} 
        />
      )}

      {adminSubView === 'issue' && (
        <div style={{ maxWidth: '750px', margin: '0 auto 16px', padding: '0 24px' }}>
          {prefilledTemplate && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', color: '#15803d', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#16a34a' }}></i>
                Issuing from Template: <strong style={{ textDecoration: 'underline' }}>{prefilledTemplate.title}</strong> ({prefilledTemplate.type === 'badge' ? 'Badge' : 'Certificate'})
              </span>
              <button 
                onClick={() => setPrefilledTemplate(null)} 
                style={{ background: 'white', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 800, color: '#dc2626', transition: 'all 0.15s ease' }}
              >
                Clear Prefill
              </button>
            </div>
          )}
          <IssueCredentialForm 
            onShowNotification={onShowNotification} 
            onRefresh={fetchCredentials} 
            prefill={prefilledTemplate}
          />
        </div>
      )}


      {adminSubView === 'bulk' && (
        <BulkIssueForm 
          onShowNotification={onShowNotification} 
          onRefresh={fetchCredentials} 
        />
      )}

      {adminSubView === 'credentials' && (
        <ManageCredentials 
          credentials={credentials} 
          loading={loading} 
          onRevoke={handleRevoke} 
          onShowNotification={onShowNotification} 
        />
      )}

      {adminSubView === 'badges' && (
        <ManageCredentials 
          credentials={credentials.filter(c => c.type === 'badge')} 
          loading={loading} 
          onRevoke={handleRevoke} 
          onShowNotification={onShowNotification} 
        />
      )}

      {/* 1. Real Users Directory View */}
      {adminSubView === 'users' && (
        <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', margin: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-users" style={{ color: 'var(--primary)' }}></i> Users Directory
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Review active student accounts, points categories, XP standings, and linked digital credentials.
              </p>
            </div>
            
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search name or email..." 
                value={usersSearch}
                onChange={e => setUsersSearch(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '220px' }}
              />
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '11px', fontSize: '11px', color: '#94a3b8' }}></i>
            </div>
          </div>

          {subLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Querying active user directory...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)', fontWeight: 800 }}>
                    <th style={{ padding: '12px 8px' }}>User Details</th>
                    <th style={{ padding: '12px 8px' }}>System Role</th>
                    <th style={{ padding: '12px 8px' }}>XP & Standing Level</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Certs / Badges</th>
                    <th style={{ padding: '12px 8px' }}>Joined At</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800 }}>
                            {user.profile_photo ? (
                              <img src={user.profile_photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : null}
                            <span>{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{user.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 800, 
                          textTransform: 'uppercase', 
                          padding: '3px 8px', 
                          borderRadius: '12px',
                          background: user.role === 'admin' ? '#fee2e2' : '#f1f5f9',
                          color: user.role === 'admin' ? '#ef4444' : '#475569'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{user.xp.toLocaleString()} XP</span>
                          <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {user.level}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                            📄 {user.certificates_count || 0}
                          </span>
                          <span style={{ background: '#faf5ff', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                            🛡️ {user.badges_count || 0}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '11px' }}>
                        {new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {user.role !== 'admin' && (
                            <a 
                              href={`/?verifyEmail=${user.email}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="list-view-btn" 
                              style={{ textDecoration: 'none', padding: '5px 8px', fontSize: '11px', borderRadius: '4px', fontWeight: 700 }}
                            >
                              <i className="fa-solid fa-eye"></i> Profile
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No students found matching search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. Real Roles & Permissions View */}
      {adminSubView === 'roles' && (
        <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', margin: '0 24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-user-gear" style={{ color: 'var(--primary)' }}></i> Roles & Permissions Control
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Grant advisor access, adjust certificate signing permissions, and change staff/officer authorization levels.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
            {/* Legend / Access matrix card */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 800, margin: '0 0 12px 0' }}>Access Levels Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '11.5px' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span> Admin role
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '3px', paddingLeft: '14px' }}>
                    Full platform authority. Can issue and revoke credentials, process manual verification claims, manage students, modify templates, and export custom audits.
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span> Student role
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '3px', paddingLeft: '14px' }}>
                    Standard club member wallet. Can showcase credentials on LinkedIn/GitHub, download verified PDFs, update public bio profiles, and track XP standings.
                  </div>
                </div>
              </div>
            </div>

            {/* Live Role Modification List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 800, margin: 0 }}>Authorize Active Accounts</h3>
                <input 
                  type="text" 
                  placeholder="Filter users..." 
                  value={usersSearch}
                  onChange={e => setUsersSearch(e.target.value)}
                  style={{ fontSize: '11.5px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '150px' }}
                />
              </div>

              {subLoading ? (
                <div style={{ textAlign: 'center', padding: '30px' }}><i className="fa-solid fa-spinner fa-spin"></i></div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#ffffff' }}>
                  {filteredUsers.map(user => (
                    <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 800, fontSize: '12.5px' }}>{user.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Role:</span>
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          style={{ fontSize: '11.5px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>No accounts found.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Real Verification Requests / Student Claims View */}
      {adminSubView === 'requests' && (
        <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', margin: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)' }}></i> Verification Claims processing
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Review, verify, and approve manually submitted student credential claims. Approved claims automatically generate and issue digital credentials.
              </p>
            </div>
            
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Filter claims..." 
                value={requestsSearch}
                onChange={e => setRequestsSearch(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '220px' }}
              />
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '11px', fontSize: '11px', color: '#94a3b8' }}></i>
            </div>
          </div>

          {subLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Querying manual claims list...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)', fontWeight: 800 }}>
                    <th style={{ padding: '12px 8px' }}>Student Claimant</th>
                    <th style={{ padding: '12px 8px' }}>Requested Item / Category</th>
                    <th style={{ padding: '12px 8px' }}>Evidence / Link</th>
                    <th style={{ padding: '12px 8px' }}>Submission Date</th>
                    <th style={{ padding: '12px 8px' }}>Decision Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{req.student_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{req.student_email}</div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px' }}>
                            {req.credential_type === 'certificate' ? '📄' : '🛡️'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{req.title}</div>
                            <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 700 }}>
                              {req.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {req.evidence_url ? (
                          <a 
                            href={req.evidence_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <i className="fa-solid fa-up-right-from-square"></i> Evidence Link
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>No evidence submitted</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '11px' }}>
                        {new Date(req.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            textTransform: 'uppercase', 
                            padding: '3px 8px', 
                            borderRadius: '12px',
                            background: req.status === 'approved' ? '#d1fae5' : req.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: req.status === 'approved' ? '#065f46' : req.status === 'rejected' ? '#991b1b' : '#92400e'
                          }}>
                            {req.status}
                          </span>
                          {req.reviewer_notes && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.reviewer_notes}>
                              "{req.reviewer_notes}"
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        {req.status === 'pending' ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button 
                              onClick={() => handleReviewRequest(req.id, 'approved')} 
                              style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '6px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-circle-check"></i> Approve
                            </button>
                            <button 
                              onClick={() => handleReviewRequest(req.id, 'rejected')} 
                              style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '6px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-circle-xmark"></i> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No claims found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}



      {/* 5. Badge & Cert Templates Workspace */}
      {adminSubView === 'templates' && (
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--primary)' }}></i> Credential Templates Design Lab
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', margin: 0 }}>Design standardized badges and certificates to make issuance rapid and consistent.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', alignItems: 'start' }}>
            {/* Create Template Form Card */}
            <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <i className="fa-solid fa-plus" style={{ marginRight: '6px', color: 'var(--primary)' }}></i> Design New Template
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const title = form.templateTitle.value;
                const type = form.templateType.value;
                const category = form.templateCategory.value;
                const description = form.templateDescription.value;
                const icon = form.templateIcon.value;
                const skills = form.templateSkills.value;

                if (!title || !category) {
                  onShowNotification("Please fill in a title and category.");
                  return;
                }

                try {
                  const res = await fetch('/api/admin/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, type, category, description, badge_icon: icon, skills_list: skills })
                  });
                  if (res.ok) {
                    onShowNotification("New design template created successfully.");
                    form.reset();
                    fetchTemplates();
                  } else {
                    onShowNotification("Failed to save template.");
                  }
                } catch (err) {
                  console.error(err);
                  onShowNotification("Network error occurred.");
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Template Title *</label>
                  <input name="templateTitle" required className="form-input" placeholder="e.g. Azure Cloud Specialist" style={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Type</label>
                    <select name="templateType" className="form-input" style={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                      <option value="badge">Badge</option>
                      <option value="certificate">Certificate</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Category</label>
                    <input name="templateCategory" required className="form-input" placeholder="e.g. Cloud, AI, Web Dev" style={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Design Icon Class</label>
                    <select name="templateIcon" className="form-input" style={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                      <option value="fa-award">Award Badge (Default Cert)</option>
                      <option value="fa-shield-halved">Shield (Default Team)</option>
                      <option value="fa-cloud">Cloud (Azure/Cloud)</option>
                      <option value="fa-brain">Brain (AI/ML)</option>
                      <option value="fa-code">Code (Software/Web)</option>
                      <option value="fa-trophy">Trophy (Contest)</option>
                      <option value="fa-star">Star (Outstanding)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fa-solid fa-circle-info"></i> Styled visually
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Key Skills (Comma-separated)</label>
                  <input name="templateSkills" className="form-input" placeholder="e.g. React, CSS, Node.js" style={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Design Description</label>
                  <textarea name="templateDescription" className="form-input" placeholder="Briefly specify standard skills certified by this credential..." style={{ height: '70px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', padding: '8px' }} />
                </div>

                <button type="submit" className="auth-submit-btn" style={{ fontSize: '12.5px', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                  <i className="fa-solid fa-floppy-disk"></i> Save Design Template
                </button>
              </form>
            </div>

            {/* Designs Directory List */}
            <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <i className="fa-solid fa-list-check" style={{ marginRight: '6px', color: 'var(--primary)' }}></i> Saved Design Templates ({badgeTemplates.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {badgeTemplates.map((temp) => (
                  <div key={temp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: temp.type === 'badge' ? '#f5f3ff' : '#eff6ff', color: temp.type === 'badge' ? '#7c3aed' : '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        <i className={`fa-solid ${temp.badge_icon || 'fa-award'}`}></i>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: 'var(--text-main)' }}>{temp.title}</h4>
                          <span style={{ fontSize: '9px', background: temp.type === 'badge' ? '#ddd6fe' : '#bfdbfe', color: temp.type === 'badge' ? '#5b21b6' : '#1e3a8a', padding: '1px 5px', borderRadius: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
                            {temp.type}
                          </span>
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={temp.description}>
                          {temp.description || "No description provided."}
                        </p>
                        <p style={{ margin: '1px 0 0', fontSize: '10px', color: 'var(--primary)', fontWeight: 700 }}>
                          Skills: {temp.skills_list || "None mapped"}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          setPrefilledTemplate(temp);
                          onNavigateToSubView('issue');
                          onShowNotification(`Pre-filled issue form for: ${temp.title}`);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 800, color: '#047857' }}
                      >
                        <i className="fa-solid fa-arrow-right-to-bracket"></i> Issue
                      </button>
                      <button 
                        onClick={async () => {
                          if (!window.confirm(`Delete design template "${temp.title}"?`)) return;
                          try {
                            const res = await fetch(`/api/admin/templates/${temp.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              onShowNotification("Template design deleted.");
                              fetchTemplates();
                            }
                          } catch (err) { console.error(err); }
                        }}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 8px', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', fontSize: '11px' }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                
                {badgeTemplates.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No template designs saved yet. Create your first credential design!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Pathways & Collections Workspace */}
      {adminSubView === 'collections' && (
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-cubes" style={{ color: 'var(--primary)' }}></i> Learning Pathways & Collections
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', margin: 0 }}>Establish structured micro-credential paths. Bundle multiple templates into standard certificate maps.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', alignItems: 'start' }}>
            {/* Create Collection Card */}
            <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <i className="fa-solid fa-circle-plus" style={{ marginRight: '6px', color: 'var(--primary)' }}></i> Establish Earning Track
              </h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const name = form.colName.value;
                const desc = form.colDesc.value;
                
                // Read checked checkboxes
                const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
                const badgeIds = Array.from(checkboxes).map(cb => cb.value).join(',');

                if (!name) {
                  onShowNotification("Collection name is required.");
                  return;
                }

                try {
                  const res = await fetch('/api/admin/collections', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description: desc, badge_ids: badgeIds })
                  });
                  if (res.ok) {
                    onShowNotification("Pathway collection established successfully!");
                    form.reset();
                    fetchCollections();
                  } else {
                    onShowNotification("Failed to establish collection pathway.");
                  }
                } catch (err) {
                  console.error(err);
                  onShowNotification("Connection failure.");
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Collection Track Name *</label>
                  <input name="colName" required className="form-input" placeholder="e.g. Advanced AI Practitioner" style={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Track Description</label>
                  <textarea name="colDesc" className="form-input" placeholder="Describe the competencies gained by mapping these credentials..." style={{ height: '70px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', padding: '8px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Include Templates Checklist</label>
                  <div style={{ maxHeight: '130px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc' }}>
                    {badgeTemplates.map(temp => (
                      <label key={temp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}>
                        <input type="checkbox" value={temp.id} style={{ accentColor: 'var(--primary)' }} />
                        <span>{temp.title} ({temp.type})</span>
                      </label>
                    ))}
                    {badgeTemplates.length === 0 && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>No templates created to bundle yet.</div>
                    )}
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" style={{ fontSize: '12.5px', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                  <i className="fa-solid fa-diagram-project"></i> Establish Pathway
                </button>
              </form>
            </div>

            {/* Pathways List Card */}
            <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <i className="fa-solid fa-folder-tree" style={{ marginRight: '6px', color: 'var(--primary)' }}></i> Active Earning Tracks ({collections.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {collections.map(col => {
                  const badgeIdArr = col.badge_ids ? col.badge_ids.split(',').map(id => parseInt(id)) : [];
                  const mappedBadges = badgeIdArr.map(id => badgeTemplates.find(bt => bt.id === id)).filter(Boolean);

                  return (
                    <div key={col.id} style={{ borderLeft: '4px solid #3b82f6', background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', borderRadius: '0 12px 12px 0', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: 'var(--text-main)' }}>{col.name}</h4>
                        <p style={{ margin: '4px 0 8px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{col.description || "No description assigned."}</p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {mappedBadges.map(b => (
                            <span key={b.id} style={{ fontSize: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                              <i className={`fa-solid ${b.badge_icon || 'fa-award'}`} style={{ fontSize: '8px' }}></i> {b.title}
                            </span>
                          ))}
                          {mappedBadges.length === 0 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty track pathway.</span>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={async () => {
                          if (!window.confirm(`Delete pathway "${col.name}"?`)) return;
                          try {
                            const res = await fetch(`/api/admin/collections/${col.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              onShowNotification("Pathway deleted.");
                              fetchCollections();
                            }
                          } catch (err) { console.error(err); }
                        }}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', fontSize: '11px' }}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  );
                })}

                {collections.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No learning pathways configured yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Revoked Records Archive */}
      {adminSubView === 'revoked' && (
        <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', margin: '0 24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-circle-minus" style={{ color: '#dc2626' }}></i> Revoked Credentials Ledger
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', margin: 0 }}>
              Immutable audit ledger of student credentials and badges that have been deleted or revoked by administrators.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)', fontWeight: 800 }}>
                  <th style={{ padding: '10px 6px' }}>Original ID</th>
                  <th style={{ padding: '10px 6px' }}>Recipient Name</th>
                  <th style={{ padding: '10px 6px' }}>Email Address</th>
                  <th style={{ padding: '10px 6px' }}>Credential Title</th>
                  <th style={{ padding: '10px 6px' }}>Category</th>
                  <th style={{ padding: '10px 6px' }}>Revocation Status</th>
                  <th style={{ padding: '10px 6px', textAlign: 'right' }}>Revoked At</th>
                </tr>
              </thead>
              <tbody>
                {revokedCredentials.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 6px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-muted)' }}>{rec.credential_id}</td>
                    <td style={{ padding: '10px 6px', fontWeight: 800, color: 'var(--text-main)' }}>{rec.recipient_name}</td>
                    <td style={{ padding: '10px 6px', color: 'var(--text-muted)' }}>{rec.recipient_email}</td>
                    <td style={{ padding: '10px 6px', color: 'var(--text-main)', fontWeight: 700 }}>{rec.title}</td>
                    <td style={{ padding: '10px 6px' }}>
                      <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{rec.category}</span>
                    </td>
                    <td style={{ padding: '10px 6px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ width: '5px', height: '5px', background: '#dc2626', borderRadius: '50%' }}></span> REVOKED & REMOVED
                      </span>
                    </td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {new Date(rec.revoked_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {revokedCredentials.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No revoked credentials in this ledger.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Advanced Analytics Workspace */}
      {adminSubView === 'analytics' && (
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-chart-line" style={{ color: 'var(--primary)' }}></i> Advanced Analytics & Business Intelligence
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', margin: 0 }}>Deep-dive analysis of platform activities, scans success logs, and credential distribution.</p>
          </div>

          {/* Core Analytics Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: 'white', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Issues Logs</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>{credentials.length}</div>
              <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                <i className="fa-solid fa-arrow-trend-up"></i> +14% since last month
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Verified Users</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>{users.length}</div>
              <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                <i className="fa-solid fa-users"></i> 100% database integrated
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Successful Checks</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                {(() => {
                  const successScans = verificationLogs.filter(l => l.status === 'success').length;
                  return `${successScans} / ${verificationLogs.length}`;
                })()}
              </div>
              <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700, marginTop: '4px' }}>
                <i className="fa-solid fa-qrcode"></i> Scan authenticity rate: {((verificationLogs.filter(l => l.status === 'success').length / (verificationLogs.length || 1)) * 100).toFixed(0)}%
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mean XP standing</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                {users.length ? Math.round(users.reduce((acc, curr) => acc + (curr.xp || 0), 0) / users.length) : 0} XP
              </div>
              <div style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 700, marginTop: '4px' }}>
                <i className="fa-solid fa-gem"></i> Average level: {users.length ? (users.reduce((acc, curr) => acc + (curr.level || 0), 0) / users.length).toFixed(1) : 1}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '24px' }}>
            {/* Category distribution horizontal list chart */}
            <div style={{ background: 'white', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 16px 0' }}>Credentials Issued by Category</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(() => {
                  const categories = {};
                  credentials.forEach(c => {
                    const cat = c.category || 'General';
                    categories[cat] = (categories[cat] || 0) + 1;
                  });
                  const total = credentials.length || 1;
                  const sorted = Object.entries(categories).sort((a,b) => b[1] - a[1]);
                  
                  return sorted.map(([cat, count], index) => {
                    const percentage = Math.round((count / total) * 100);
                    const colorArr = ['#3b82f6', '#10b981', '#7c3aed', '#f59e0b', '#ec4899'];
                    const barColor = colorArr[index % colorArr.length];

                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 800, marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-main)' }}>{cat}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{count} ({percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: barColor, borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  });
                })()}
                {credentials.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '11px' }}>No category metrics to display.</div>
                )}
              </div>
            </div>

            {/* High XP student standouts leaderboard */}
            <div style={{ background: 'white', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 16px 0' }}>Chapter Academic Leaderboard</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users
                  .slice()
                  .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                  .slice(0, 5)
                  .map((u, index) => {
                    const medalColors = ['#eab308', '#94a3b8', '#b45309', '#3b82f6', '#10b981'];
                    return (
                      <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: index < 3 ? medalColors[index] : '#e2e8f0', color: index < 3 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>
                            {index + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-main)' }}>{u.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 900, color: 'var(--primary)' }}>{u.xp || 0} XP</div>
                          <div style={{ fontSize: '9px', background: '#eff6ff', color: '#1e40af', padding: '1px 5px', borderRadius: '6px', fontWeight: 800, display: 'inline-block' }}>Lvl {u.level || 1}</div>
                        </div>
                      </div>
                    );
                  })}
                {users.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No student records logged.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Custom Reports Workspace */}
      {adminSubView === 'reports' && (
        <div className="admin-card" style={{ padding: '32px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', margin: '0 24px', textAlign: 'left' }}>
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-chart-pie" style={{ color: 'var(--primary)' }}></i> Custom Reports & Data Exporter
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', margin: 0 }}>
              Audit and compile structured CSV reports of issued credentials, verifier activity logs, and active chapter student rosters.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {/* Report 1: Credentials */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginBottom: '12px' }}>
                  <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900 }}>Issued Credentials Registry</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 16px 0', lineHeight: '1.4' }}>
                  Full snapshot of all issued certificates and badges. Includes recipient details, serial numbers, date, and mapped skills.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (credentials.length === 0) {
                    onShowNotification("No credentials in database to export.");
                    return;
                  }
                  // Generate CSV
                  const headers = ["Credential ID", "Recipient Name", "Recipient Email", "Type", "Title", "Category", "Issue Date", "Skills", "Description"];
                  const rows = credentials.map(c => [
                    c.id,
                    `"${c.recipient_name.replace(/"/g, '""')}"`,
                    c.recipient_email,
                    c.type,
                    `"${c.title.replace(/"/g, '""')}"`,
                    c.category,
                    c.issue_date,
                    `"${(c.skills_list || '').replace(/"/g, '""')}"`,
                    `"${(c.description || '').replace(/"/g, '""')}"`
                  ]);
                  const csvContent = "data:text/csv;charset=utf-8," 
                    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `msc_credentials_registry_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  onShowNotification("Credentials Registry CSV downloaded successfully!");
                }}
                className="auth-submit-btn" 
                style={{ fontSize: '11.5px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}
              >
                <i className="fa-solid fa-download"></i> Export Credentials CSV
              </button>
            </div>

            {/* Report 2: Student Standings */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginBottom: '12px' }}>
                  <i className="fa-solid fa-users"></i>
                </div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900 }}>Chapter Student Roster</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 16px 0', lineHeight: '1.4' }}>
                  Detailed roster of active students on the platform, including current levels, total XP, profile biographies, and social links.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (users.length === 0) {
                    onShowNotification("No student rosters to export.");
                    return;
                  }
                  const headers = ["User ID", "Name", "Email Address", "Role", "Biography", "XP", "Level", "LinkedIn URL", "Github URL"];
                  const rows = users.map(u => [
                    u.id,
                    `"${u.name.replace(/"/g, '""')}"`,
                    u.email,
                    u.role,
                    `"${(u.bio || '').replace(/"/g, '""')}"`,
                    u.xp || 0,
                    u.level || 1,
                    u.linkedin_url || '',
                    u.github_url || ''
                  ]);
                  const csvContent = "data:text/csv;charset=utf-8," 
                    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `msc_chapter_student_roster_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  onShowNotification("Student Roster CSV downloaded successfully!");
                }}
                className="auth-submit-btn" 
                style={{ fontSize: '11.5px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}
              >
                <i className="fa-solid fa-download"></i> Export Student Roster CSV
              </button>
            </div>

            {/* Report 3: Verification Logs */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginBottom: '12px' }}>
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900 }}>Scan & Authenticity Audits</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 16px 0', lineHeight: '1.4' }}>
                  Comprehensive audit trail of credential verifications. Records verifier IP, user-agent details, scanned ID, and pass/fail state.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (verificationLogs.length === 0) {
                    onShowNotification("No verification logs to export.");
                    return;
                  }
                  const headers = ["Audit ID", "Scanned Credential ID", "Verifier IP Address", "Browser User Agent", "Scan Status", "Timestamp"];
                  const rows = verificationLogs.map(l => [
                    l.id,
                    l.credential_id || 'n/a',
                    l.verifier_ip,
                    `"${(l.verifier_user_agent || '').replace(/"/g, '""')}"`,
                    l.status,
                    l.verified_at
                  ]);
                  const csvContent = "data:text/csv;charset=utf-8," 
                    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `msc_verification_checks_audit_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  onShowNotification("Verification Audits CSV downloaded successfully!");
                }}
                className="auth-submit-btn" 
                style={{ fontSize: '11.5px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}
              >
                <i className="fa-solid fa-download"></i> Export Scan Audits CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. General Chapter Configuration Settings */}
      {adminSubView === 'general-settings' && (
        <div style={{ maxWidth: '650px', margin: '0 auto', padding: '0 24px' }}>
          <div className="admin-card" style={{ padding: '32px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px', color: 'var(--text-main)' }}>
              <i className="fa-solid fa-sliders" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              Chapter Configuration Settings
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const name = form.cName.value;
              const advisor = form.cAdvisor.value;
              const domain = form.cDomain.value;
              const cid = form.cId.value;

              const updated = {
                chapterName: name,
                advisorName: advisor,
                customDomain: domain,
                chapterId: cid
              };

              setChapterSettings(updated);
              localStorage.setItem('msc_chapter_settings', JSON.stringify(updated));
              onShowNotification("Microsoft Student Club chapter settings successfully saved!");
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '12px' }}>Microsoft Student Club Chapter Name</label>
                <input name="cName" defaultValue={chapterSettings.chapterName} className="form-input" style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '12px' }}>Signing Faculty Advisor</label>
                <input name="cAdvisor" defaultValue={chapterSettings.advisorName} className="form-input" style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '12px' }}>Club Custom Domain Name</label>
                  <input name="cDomain" defaultValue={chapterSettings.customDomain} className="form-input" style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                
                <div className="form-group">
                  <label style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '12px' }}>Chapter Identifier</label>
                  <input name="cId" defaultValue={chapterSettings.chapterId} className="form-input" style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <i className="fa-solid fa-circle-nodes" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                These attributes are automatically compiled into generated credential templates, signing keys, and public profile verify-links on behalf of the chapter.
              </div>

              <button type="submit" className="auth-submit-btn" style={{ padding: '12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-cloud-arrow-up"></i> Commit & Save Configuration
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
