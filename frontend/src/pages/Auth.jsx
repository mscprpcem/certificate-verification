import React, { useState } from 'react';

export default function Auth({ onLoginSuccess, onViewChange }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

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
        setErrorMessage(data.error || 'Something went wrong.');
      } else {
        setSuccessMessage(data.message || 'Success!');
        setTimeout(() => {
          onLoginSuccess(data.user);
          if (data.user.role === 'admin') {
            onViewChange('admin');
          } else {
            onViewChange('my-credentials');
          }
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to connect to server.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome to MSC</h2>
          <p>{activeTab === 'login' ? 'Sign in to access your certificates & badges' : 'Create an account to track your achievements'}</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="result-container" style={{ margin: '0 0 16px 0' }}>
            <div className="error-result-card" style={{ padding: '12px 16px' }}>
              <div className="error-icon-box" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
              </div>
              <div>
                <div className="error-status-title">Error</div>
                <div className="error-message-text" style={{ fontSize: '13px' }}>{errorMessage}</div>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="result-container" style={{ margin: '0 0 16px 0' }}>
            <div className="success-result-card" style={{ padding: '12px 16px', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
              <div className="success-icon-box" style={{ width: '32px', height: '32px', fontSize: '14px', background: '#d1fae5', color: '#059669' }}>
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <div className="result-status-title" style={{ color: '#047857' }}>Success</div>
                <div className="result-message-text" style={{ fontSize: '13px', color: '#065f46' }}>{successMessage}</div>
              </div>
            </div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. student@mscprpcem.tech"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="demo-hints">
          <h4>💡 Testing Credentials</h4>
          <p><strong>Student:</strong> student@mscprpcem.tech / password123</p>
          <p><strong>Admin:</strong> admin@mscprpcem.tech / admin123</p>
        </div>
      </div>
    </div>
  );
}
