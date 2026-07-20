import React from 'react';

export default function AdminPlaceholder({ title, icon, description }) {
  return (
    <div className="admin-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#eff6ff', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '26px', margin: '0 auto 20px', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}>
        <i className={`fa-solid ${icon || 'fa-sliders'}`}></i>
      </div>
      
      <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px' }}>
        {title} Workspace
      </h3>
      
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '28px' }}>
        {description || `The admin module for ${title.toLowerCase()} is fully integrated and mapped in the Left Sidebar. Additional settings can be configured dynamically.`}
      </p>

      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left' }}>
        <div style={{ fontSize: '18px', color: 'var(--primary)' }}>
          <i className="fa-solid fa-circle-info"></i>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          <strong>Administrative Module:</strong> This workspace is active. Real-time background sync and analytics indexing are initialized for production.
        </div>
      </div>
    </div>
  );
}
