import React, { useEffect, useState } from 'react';
import { apiFetch } from '../config/api';
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

  // Badge Catalog Management State
  const [catalogBadges, setCatalogBadges] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [editingCatalogBadge, setEditingCatalogBadge] = useState(null);
  const [showAddCatalogModal, setShowAddCatalogModal] = useState(false);

  // Admin Management State
  const [adminsList, setAdminsList] = useState([]);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [lastCreatedAdmin, setLastCreatedAdmin] = useState(null);

  useEffect(() => {
    fetchCredentials();
    fetchTemplates();
    fetchCollections();
    fetchCatalogBadges();
  }, []);

  // Fetch contextual data based on current subview
  useEffect(() => {
    if (adminSubView === 'users' || adminSubView === 'roles') {
      fetchUsers();
    } else if (adminSubView === 'requests') {
      fetchVerificationRequests();
    } else if (adminSubView === 'badges' || adminSubView === 'badge-catalog') {
      fetchCatalogBadges();
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
    } else if (adminSubView === 'admin-mgmt') {
      fetchAdmins();
    }
  }, [adminSubView]);

  const fetchAdmins = async () => {
    try {
      const res = await apiFetch('/api/admin/admins');
      if (res.ok) {
        const data = await res.json();
        setAdminsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      onShowNotification('All fields are required to create an admin.');
      return;
    }
    setCreateAdminLoading(true);
    try {
      const res = await apiFetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        onShowNotification('✓ Admin account created successfully!');
        setLastCreatedAdmin({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword
        });
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        fetchAdmins();
      } else {
        onShowNotification(`Error: ${data.error || 'Failed to create admin'}`);
      }
    } catch (err) {
      console.error(err);
      onShowNotification('Error: Failed to connect to server');
    } finally {
      setCreateAdminLoading(false);
    }
  };


  const fetchCredentials = async () => {
    try {
      const res = await apiFetch('/api/admin/credentials');
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setSubLoading(true);
    try {
      const res = await apiFetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchVerificationRequests = async () => {
    setSubLoading(true);
    try {
      const res = await apiFetch('/api/admin/verification-requests');
      if (res.ok) {
        const data = await res.json();
        setVerificationRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchVerificationLogs = async () => {
    try {
      const res = await apiFetch('/api/admin/verification-logs');
      if (res.ok) {
        const data = await res.json();
        setVerificationLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };



  const fetchTemplates = async () => {
    try {
      const res = await apiFetch('/api/admin/templates');
      if (res.ok) {
        const data = await res.json();
        setBadgeTemplates(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await apiFetch('/api/admin/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRevokedCredentials = async () => {
    try {
      const res = await apiFetch('/api/admin/revoked');
      if (res.ok) {
        const data = await res.json();
        setRevokedCredentials(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCatalogBadges = async () => {
    setCatalogLoading(true);
    try {
      const res = await apiFetch('/api/admin/badge-catalog');
      if (res.ok) {
        const data = await res.json();
        setCatalogBadges(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleToggleCatalogVisibility = async (id, title, currentHidden) => {
    try {
      const res = await apiFetch(`/api/admin/badge-catalog/${id}/toggle-visibility`, {
        method: 'PATCH'
      });
      if (res.ok) {
        onShowNotification(`Badge "${title}" is now ${currentHidden ? 'VISIBLE' : 'HIDDEN'} in directory.`);
        fetchCatalogBadges();
      } else {
        onShowNotification("Failed to update visibility.");
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Network error occurred.");
    }
  };

  const handleDeleteCatalogBadge = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from the Badge Directory?`)) return;
    try {
      const res = await apiFetch(`/api/admin/badge-catalog/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onShowNotification(`Deleted badge "${title}".`);
        fetchCatalogBadges();
      } else {
        onShowNotification("Failed to delete badge.");
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Network error occurred.");
    }
  };

  const handleSaveCatalogBadge = async (e) => {
    e.preventDefault();
    const form = e.target;
    const badgeData = {
      title: form.badgeTitle.value,
      organization: form.badgeOrganization.value || "Microsoft Student Club PRPCEM",
      release_date: form.badgeReleaseDate.value || "Jul 2026",
      category: form.badgeCategory.value,
      level: form.badgeLevel.value,
      icon: form.badgeIcon.value || "fa-trophy",
      earners_count: Number(form.badgeEarnersCount.value) || 0,
      description: form.badgeDescription.value,
      criteria: form.badgeCriteria.value,
      skills_list: form.badgeSkills.value,
      is_hidden: form.badgeIsHidden.checked ? 1 : 0
    };

    try {
      let res;
      if (editingCatalogBadge) {
        res = await apiFetch(`/api/admin/badge-catalog/${editingCatalogBadge.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(badgeData)
        });
      } else {
        res = await apiFetch('/api/admin/badge-catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(badgeData)
        });
      }

      if (res.ok) {
        onShowNotification(editingCatalogBadge ? "Badge updated successfully." : "New catalog badge created.");
        setEditingCatalogBadge(null);
        setShowAddCatalogModal(false);
        fetchCatalogBadges();
      } else {
        onShowNotification("Failed to save catalog badge.");
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Network error occurred.");
    }
  };


  const handleRevoke = async (id) => {
    if (!window.confirm(`Are you sure you want to revoke and delete credential ${id}?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/credentials/${id}`, {
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
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
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
      const res = await apiFetch(`/api/admin/verification-requests/${requestId}/review`, {
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
      
      {/* Top Quick Sub-Navigation Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingLeft: '4px' }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-house' },
          { id: 'issue', label: 'Issue Credential', icon: 'fa-square-plus' },
          { id: 'bulk', label: 'Bulk Upload', icon: 'fa-cloud-arrow-up' },
          { id: 'credentials', label: 'Credentials', icon: 'fa-file-contract' },
          { id: 'badges', label: 'Badge Catalog', icon: 'fa-award' },
          { id: 'users', label: 'Users Directory', icon: 'fa-users' },
          { id: 'admin-mgmt', label: 'Admin Accounts', icon: 'fa-user-shield' },
          { id: 'requests', label: 'Requests', icon: 'fa-circle-check' },
          { id: 'templates', label: 'Templates', icon: 'fa-pen-to-square' },
          { id: 'reports', label: 'Reports', icon: 'fa-chart-pie' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onNavigateToSubView(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: adminSubView === tab.id ? '#2563eb' : '#e2e8f0',
              background: adminSubView === tab.id ? '#2563eb' : '#ffffff',
              color: adminSubView === tab.id ? '#ffffff' : 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: adminSubView === tab.id ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '11px' }}></i>
            {tab.label}
          </button>
        ))}
      </div>

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

      {/* 4b. Badge Directory Catalog Admin Management */}
      {(adminSubView === 'badges' || adminSubView === 'badge-catalog') && (
        <div className="admin-card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', margin: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-award" style={{ color: 'var(--primary)' }}></i> Badge Directory Catalog Manager
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Control all badges displayed in the public Badge Directory. Edit details, toggle visibility (hide/show from users), or add new badges.
              </p>
            </div>

            <button 
              onClick={() => { setEditingCatalogBadge(null); setShowAddCatalogModal(true); }}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-plus"></i> Add New Badge
            </button>
          </div>

          {catalogLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '8px' }}>Loading catalog items...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)', fontWeight: 800 }}>
                    <th style={{ padding: '12px 8px' }}>Badge Title</th>
                    <th style={{ padding: '12px 8px' }}>Organization</th>
                    <th style={{ padding: '12px 8px' }}>Release Date</th>
                    <th style={{ padding: '12px 8px' }}>Category & Level</th>
                    <th style={{ padding: '12px 8px' }}>Earners</th>
                    <th style={{ padding: '12px 8px' }}>Visibility State</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogBadges.map((badge) => {
                    const isHidden = badge.is_hidden === 1;
                    return (
                      <tr key={badge.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: isHidden ? 0.75 : 1 }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div 
                              style={{ 
                                background: badge.gradient || "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", 
                                color: 'white', 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '8px', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                fontSize: '14px' 
                              }}
                            >
                              <i className={`fa-solid ${badge.icon || badge.badge_icon || 'fa-award'}`}></i>
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{badge.title}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{badge.badge_code || badge.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {badge.organization || "Microsoft Student Club PRPCEM"}
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                          {badge.release_date || badge.issue_date || 'Jul 2026'}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ fontSize: '10px', background: '#f1f5f9', color: 'var(--text-main)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                            {badge.category} ({badge.level || 'Intermediate'})
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: 800, color: '#2563eb' }}>
                          {badge.earners_count !== undefined ? badge.earners_count : badge.earnersCount || 0}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span 
                            style={{ 
                              fontSize: '10px', 
                              fontWeight: 800, 
                              textTransform: 'uppercase', 
                              padding: '3px 8px', 
                              borderRadius: '12px',
                              background: isHidden ? '#fee2e2' : '#d1fae5',
                              color: isHidden ? '#991b1b' : '#065f46'
                            }}
                          >
                            {isHidden ? '🚫 Hidden from Users' : '✅ Public / Visible'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button 
                              onClick={() => handleToggleCatalogVisibility(badge.id, badge.title, isHidden)}
                              style={{ 
                                padding: '4px 10px', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                borderRadius: '6px', 
                                background: isHidden ? '#ecfdf5' : '#fff7ed', 
                                color: isHidden ? '#047857' : '#c2410c', 
                                border: isHidden ? '1px solid #a7f3d0' : '1px solid #ffedd5',
                                cursor: 'pointer' 
                              }}
                              title={isHidden ? "Make badge visible to users" : "Hide badge from public directory"}
                            >
                              <i className={`fa-solid ${isHidden ? 'fa-eye' : 'fa-eye-slash'}`}></i> {isHidden ? 'Show' : 'Hide'}
                            </button>

                            <button 
                              onClick={() => { setEditingCatalogBadge(badge); setShowAddCatalogModal(true); }}
                              style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-pen"></i> Edit
                            </button>

                            <button 
                              onClick={() => handleDeleteCatalogBadge(badge.id, badge.title)}
                              style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {catalogBadges.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No catalog badges defined. Click "Add New Badge" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT CATALOG BADGE MODAL */}
      {(showAddCatalogModal || editingCatalogBadge) && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => { setShowAddCatalogModal(false); setEditingCatalogBadge(null); }}>
          <div className="modal-content" style={{ maxWidth: '560px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setShowAddCatalogModal(false); setEditingCatalogBadge(null); }}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px', color: 'var(--text-main)' }}>
              {editingCatalogBadge ? `Edit Badge: ${editingCatalogBadge.title}` : 'Add New Badge to Directory'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Configure badge details for the official Microsoft Student Club directory catalog.
            </p>

            <form onSubmit={handleSaveCatalogBadge} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Badge Name (Title) *</label>
                  <input 
                    type="text" 
                    name="badgeTitle" 
                    defaultValue={editingCatalogBadge ? editingCatalogBadge.title : ''} 
                    required 
                    className="verify-input" 
                    style={{ paddingLeft: '12px', fontSize: '12px' }} 
                    placeholder="e.g. Azure Specialist"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Issue Organization</label>
                  <input 
                    type="text" 
                    name="badgeOrganization" 
                    defaultValue={editingCatalogBadge ? (editingCatalogBadge.organization || 'Microsoft Student Club PRPCEM') : 'Microsoft Student Club PRPCEM'} 
                    className="verify-input" 
                    style={{ paddingLeft: '12px', fontSize: '12px' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Release Date</label>
                  <input 
                    type="text" 
                    name="badgeReleaseDate" 
                    defaultValue={editingCatalogBadge ? (editingCatalogBadge.release_date || editingCatalogBadge.issue_date || 'Jul 2026') : 'Jul 2026'} 
                    className="verify-input" 
                    style={{ paddingLeft: '12px', fontSize: '12px' }} 
                    placeholder="e.g. Jul 2026"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Category *</label>
                  <select 
                    name="badgeCategory" 
                    defaultValue={editingCatalogBadge ? editingCatalogBadge.category : 'Programming & Logic'} 
                    className="verify-input" 
                    style={{ paddingLeft: '10px', fontSize: '12px' }}
                  >
                    <option value="Programming & Logic">Programming & Logic</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Leadership & Management">Leadership & Management</option>
                    <option value="Community & Mentorship">Community & Mentorship</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Difficulty Level</label>
                  <select 
                    name="badgeLevel" 
                    defaultValue={editingCatalogBadge ? (editingCatalogBadge.level || 'Intermediate') : 'Intermediate'} 
                    className="verify-input" 
                    style={{ paddingLeft: '10px', fontSize: '12px' }}
                  >
                    <option value="Foundational">Foundational</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Officer">Officer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Badge Icon (FontAwesome)</label>
                  <input 
                    type="text" 
                    name="badgeIcon" 
                    defaultValue={editingCatalogBadge ? (editingCatalogBadge.icon || editingCatalogBadge.badge_icon || 'fa-trophy') : 'fa-trophy'} 
                    className="verify-input" 
                    style={{ paddingLeft: '12px', fontSize: '12px' }} 
                    placeholder="fa-trophy, fa-cloud, fa-brain"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Earners Count Till Now</label>
                  <input 
                    type="number" 
                    name="badgeEarnersCount" 
                    defaultValue={editingCatalogBadge ? (editingCatalogBadge.earners_count !== undefined ? editingCatalogBadge.earners_count : editingCatalogBadge.earnersCount || 0) : 0} 
                    className="verify-input" 
                    style={{ paddingLeft: '12px', fontSize: '12px' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Description (Shown in Detail Modal)</label>
                <textarea 
                  name="badgeDescription" 
                  defaultValue={editingCatalogBadge ? editingCatalogBadge.description : ''} 
                  rows="2" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'inherit' }}
                  placeholder="Describe badge objectives..."
                ></textarea>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Eligibility & Earning Criteria (Shown in Detail Modal)</label>
                <textarea 
                  name="badgeCriteria" 
                  defaultValue={editingCatalogBadge ? editingCatalogBadge.criteria : ''} 
                  rows="2" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'inherit' }}
                  placeholder="Steps or score rules required to earn this badge..."
                ></textarea>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Evaluated Skills (Comma separated)</label>
                <input 
                  type="text" 
                  name="badgeSkills" 
                  defaultValue={editingCatalogBadge ? (typeof editingCatalogBadge.skills_list === 'string' ? editingCatalogBadge.skills_list : (editingCatalogBadge.skills || []).join(', ')) : ''} 
                  className="verify-input" 
                  style={{ paddingLeft: '12px', fontSize: '12px' }} 
                  placeholder="e.g. Data Structures, Algorithms, Python"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input 
                  type="checkbox" 
                  id="badgeIsHidden" 
                  name="badgeIsHidden" 
                  defaultChecked={editingCatalogBadge ? editingCatalogBadge.is_hidden === 1 : false}
                />
                <label htmlFor="badgeIsHidden" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                  Hide this badge from the public Badge Directory (Admin view only)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => { setShowAddCatalogModal(false); setEditingCatalogBadge(null); }}
                  style={{ flexGrow: 1, padding: '10px 0', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ flexGrow: 1, padding: '10px 0', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                >
                  {editingCatalogBadge ? 'Save Changes' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
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
                  const res = await apiFetch('/api/admin/templates', {
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
                            const res = await apiFetch(`/api/admin/templates/${temp.id}`, { method: 'DELETE' });
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
                  const res = await apiFetch('/api/admin/collections', {
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
                            const res = await apiFetch(`/api/admin/collections/${col.id}`, { method: 'DELETE' });
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
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Registered Students</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                {users.length} Active Members
              </div>
              <div style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 700, marginTop: '4px' }}>
                <i className="fa-solid fa-user-check"></i> Chapter Roster Active
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'left' }}>
            {/* Category distribution horizontal list chart */}
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
                  Detailed roster of active students on the platform, including profile biographies and social links.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (users.length === 0) {
                    onShowNotification("No student rosters to export.");
                    return;
                  }
                  const headers = ["User ID", "Name", "Email Address", "Role", "Biography", "LinkedIn URL", "Github URL"];
                  const rows = users.map(u => [
                    u.id,
                    `"${u.name.replace(/"/g, '""')}"`,
                    u.email,
                    u.role,
                    `"${(u.bio || '').replace(/"/g, '""')}"`,
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

      {/* Admin Account Management View */}
      {adminSubView === 'admin-mgmt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-user-shield" style={{ color: '#2563eb' }}></i> Admin Account Management
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Create new administrator credentials and manage chapter admins. Only existing admins can create new admin accounts.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Create Admin Form */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-user-plus" style={{ color: '#10b981' }}></i> Create New Admin Account
              </h3>

              {lastCreatedAdmin && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                    <i className="fa-solid fa-circle-check"></i> Admin Account Created!
                  </div>
                  <p style={{ fontSize: '12px', color: '#047857', margin: '0 0 10px 0' }}>
                    Share these credentials with the new admin so they can log in:
                  </p>
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #6ee7b7', color: '#1e293b' }}>
                    <div><strong>Name:</strong> {lastCreatedAdmin.name}</div>
                    <div><strong>Email:</strong> {lastCreatedAdmin.email}</div>
                    <div><strong>Password:</strong> {lastCreatedAdmin.password}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLastCreatedAdmin(null)}
                    style={{ marginTop: '10px', background: 'none', border: 'none', color: '#059669', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Dismiss Credentials Banner
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. rahul@mscprpcem.tech"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Set initial password (min 6 chars)"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    The new admin can change their password after logging in.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={createAdminLoading}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: createAdminLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                    opacity: createAdminLoading ? 0.7 : 1
                  }}
                >
                  {createAdminLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Creating Admin...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-shield"></i> Create Admin Account
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Admin Users Directory List */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-users-gear" style={{ color: '#2563eb' }}></i> Existing Chapter Administrators ({adminsList.length})
              </h3>

              {adminsList.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading administrators...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                  {adminsList.map((adm) => (
                    <div
                      key={adm.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                          {adm.name ? adm.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-main)' }}>
                            {adm.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {adm.email}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: '#dbeafe', color: '#1e40af' }}>
                        <i className="fa-solid fa-shield-halved" style={{ marginRight: '4px' }}></i> Admin
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
