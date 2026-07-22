import React, { useState } from 'react';

export default function Auth({ onLoginSuccess, onViewChange }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fillCredentials = (type) => {
    setActiveTab('login');
    setErrorMessage('');
    setSuccessMessage('');
    if (type === 'admin') {
      setEmail('admin@mscprpcem.tech');
      setPassword('admin123');
    } else {
      setEmail('student@mscprpcem.tech');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = activeTab === 'login' ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check credentials.');
      } else {
        setSuccessMessage(data.message || 'Login successful! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(data.user);
          if (data.user.role === 'admin') {
            onViewChange('admin');
          } else {
            onViewChange('my-credentials');
          }
        }, 600);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '32px 16px' }}>
      <div className="auth-card" style={{ maxWidth: '440px', width: '100%', borderRadius: '24px', padding: '32px', background: '#ffffff', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)', textAlign: 'left' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)' }}>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            {activeTab === 'login' ? 'Welcome Back' : 'Join MSC PRPCEM'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {activeTab === 'login' 
              ? 'Sign in to access your digital wallet and credentials' 
              : 'Create your digital profile to receive verified badges'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'login' ? 'white' : 'transparent',
              color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            <i className="fa-solid fa-right-to-bracket" style={{ marginRight: '6px' }}></i> Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'register' ? 'white' : 'transparent',
              color: activeTab === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i> Register
          </button>
        </div>

        {/* Quick Demo Pre-fill Buttons */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => fillCredentials('student')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '6px'
            }}
          >
            <span>🎓 Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('admin')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #fed7aa',
              background: '#fff7ed',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#c2410c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '6px'
            }}
          >
            <span>🔐 Admin Login</span>
          </button>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b', fontSize: '12.5px' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '16px', color: '#ef4444' }}></i>
            <div style={{ fontWeight: 600 }}>{errorMessage}</div>
          </div>
        )}

        {/* Success Feedback */}
        {successMessage && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: '12.5px' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '16px', color: '#10b981' }}></i>
            <div style={{ fontWeight: 600 }}>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-regular fa-user" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}></i>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px', borderRadius: '10px' }}
                  placeholder="e.g. Amit Kumar Yadav"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fa-regular fa-envelope" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}></i>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px', borderRadius: '10px' }}
                placeholder="student@mscprpcem.tech"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}></i>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px', borderRadius: '10px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 800,
              fontSize: '14px',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '8px',
              boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.35)',
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
              </>
            ) : (
              <>
                {activeTab === 'login' ? 'Sign In to Account' : 'Complete Registration'}
                <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-lock" style={{ color: '#10b981' }}></i>
          <span>256-Bit Encrypted Secure Chapter Auth</span>
        </div>

      </div>
    </div>
  );
}
