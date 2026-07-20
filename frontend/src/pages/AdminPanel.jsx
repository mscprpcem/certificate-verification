import React, { useEffect, useState } from 'react';
import AdminDashboard from './admin/AdminDashboard';
import IssueCredentialForm from './admin/IssueCredentialForm';
import BulkIssueForm from './admin/BulkIssueForm';
import ManageCredentials from './admin/ManageCredentials';
import AdminPlaceholder from './admin/AdminPlaceholder';

export default function AdminPanel({ user, onShowNotification, adminSubView, onNavigateToSubView }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredentials();
  }, []);

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
      onShowNotification("Connection failure.");
    }
  };

  // Switch display based on selected sidebar view
  return (
    <div className="admin-container" style={{ padding: '24px 0', minHeight: '100vh', background: '#f8fafc' }}>
      
      {adminSubView === 'dashboard' && (
        <AdminDashboard 
          credentials={credentials} 
          onNavigateToSubView={onNavigateToSubView} 
          onShowNotification={onShowNotification} 
        />
      )}

      {adminSubView === 'issue' && (
        <IssueCredentialForm 
          onShowNotification={onShowNotification} 
          onRefresh={fetchCredentials} 
        />
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

      {/* Placeholders for secondary sidebar selections */}
      {adminSubView === 'collections' && (
        <AdminPlaceholder title="Collections" icon="fa-cubes" description="Setup structured badge collections and student earning pathways." />
      )}

      {adminSubView === 'templates' && (
        <AdminPlaceholder title="Badge & Cert Templates" icon="fa-pen-to-square" description="Configure visual designs, logos, and custom canvas fields." />
      )}

      {adminSubView === 'users' && (
        <AdminPlaceholder title="User Directories" icon="fa-users" description="Review active student profiles, points tiers, and credential mappings." />
      )}

      {adminSubView === 'roles' && (
        <AdminPlaceholder title="Roles & Permissions" icon="fa-user-gear" description="Configure advisor roles, issuer access, and verify keys." />
      )}

      {adminSubView === 'requests' && (
        <AdminPlaceholder title="Verification Requests" icon="fa-circle-check" description="Review manually submitted credential claims and QR verification logs." />
      )}

      {adminSubView === 'logs' && (
        <AdminPlaceholder title="Verification Activity Logs" icon="fa-clock-rotate-left" description="Check logs of verifiers querying student achievements." />
      )}

      {adminSubView === 'revoked' && (
        <AdminPlaceholder title="Revoked Records" icon="fa-circle-minus" description="Inspect deleted certificates and log revoke history logs." />
      )}

      {adminSubView === 'analytics' && (
        <AdminPlaceholder title="Advanced Analytics" icon="fa-chart-line" description="Audit graphs, downloads count, and Linkedin sharing metrics." />
      )}

      {adminSubView === 'reports' && (
        <AdminPlaceholder title="Custom Reports" icon="fa-chart-pie" description="Export lists and CSVs of verified student records." />
      )}

      {adminSubView === 'general-settings' && (
        <AdminPlaceholder title="General Settings" icon="fa-sliders" description="Configure Microsoft Student Club chapter attributes and details." />
      )}
    </div>
  );
}
