import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Auth from './pages/Auth';
import MyCredentials from './pages/MyCredentials';
import BadgeDetail from './pages/BadgeDetail';
import PublicProfile from './pages/PublicProfile';
import Collections from './pages/Collections';
import ActivityFeed from './pages/ActivityFeed';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import BadgeCatalog from './pages/BadgeCatalog';


export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  const [adminSubView, setAdminSubView] = useState('dashboard');
  // Views: 'home', 'auth', 'my-credentials', 'my-badges', 'collections', 'skills', 'activity', 'public-profile', 'settings', 'admin', 'credential-detail'
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [selectedCred, setSelectedCred] = useState(null);

  // Simulated Inbox state (Developer Sandbox)
  const [inboxOpen, setInboxOpen] = useState(false);
  const [simulatedEmails, setSimulatedEmails] = useState([]);
  
  // Public profile search username
  const [profileSearchQuery, setProfileSearchQuery] = useState('amityadav');

  // Metrics counters state
  const [metrics, setMetrics] = useState({
    certificatesIssued: 0,
    badgesIssued: 0,
    studentsCount: 0,
    verifiedToday: 0,
    downloadsToday: 0,
    linkedinShares: 0
  });

  // Recent credentials feed
  const [recentCredentials, setRecentCredentials] = useState([]);

  // Verification Search states
  const [activeVerifyTab, setActiveVerifyTab] = useState('id');
  const [searchId, setSearchId] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchBadgeId, setSearchBadgeId] = useState('');
  const [searchUrl, setSearchUrl] = useState('');
  
  const [nameType, setNameType] = useState('event'); 
  const [searchName, setSearchName] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [searchEvent, setSearchEvent] = useState('');
  const [searchTeamYear, setSearchTeamYear] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [verifyResult, setVerifyResult] = useState(null);

  // QR scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const scannerRef = useRef(null);
  const canvasRef = useRef(null);

  // Lazy authentication modal state
  const [lazyEmail, setLazyEmail] = useState('');
  const [showLazyPrompt, setShowLazyPrompt] = useState(false);

  // Show Toast
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  useEffect(() => {
    checkSession();
    fetchMetrics();
    fetchRecentCredentials();
    fetchSimulatedEmails();

    // Check if query string verification links loaded
    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verifyId');
    if (verifyId) {
      setSearchId(verifyId);
      setActiveVerifyTab('id');
      handleVerify(null, 'id', verifyId);
    }
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          fetchMyWallet();
        }
      }
    } catch (err) {
      console.log("No active session found.");
    }
  };

  const fetchMyWallet = async () => {
    try {
      const res = await fetch('/api/credentials/my');
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/credentials/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRecentCredentials = async () => {
    try {
      const res = await fetch('/api/credentials/recent');
      if (res.ok) {
        const data = await res.json();
        setRecentCredentials(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSimulatedEmails = async () => {
    try {
      const res = await fetch('/api/emails/recent');
      if (res.ok) {
        const data = await res.json();
        setSimulatedEmails(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout');
      setUser(null);
      setCredentials([]);
      setSelectedCred(null);
      setCurrentView('home');
      showNotification("Signed out successfully");
    } catch (err) {
      showNotification("Failed to sign out");
    }
  };

  // Perform Verification
  const handleVerify = async (e, forceTab = null, forceValue = null) => {
    if (e) e.preventDefault();
    setVerifyResult(null);

    const queryTab = forceTab || activeVerifyTab;
    let url = '/api/credentials/verify?';

    if (queryTab === 'id') {
      const val = forceValue || searchId;
      if (!val) return;
      url += `credentialId=${encodeURIComponent(val.trim())}`;
    } else if (queryTab === 'badge') {
      const val = forceValue || searchBadgeId;
      if (!val) return;
      url += `badgeId=${encodeURIComponent(val.trim())}`;
    } else if (queryTab === 'email') {
      const val = forceValue || searchEmail;
      if (!val) return;
      url += `email=${encodeURIComponent(val.trim())}`;
    } else if (queryTab === 'url') {
      const val = forceValue || searchUrl;
      if (!val) return;
      url += `url=${encodeURIComponent(val.trim())}`;
    } else if (queryTab === 'name') {
      if (!searchName) return;
      url += `name=${encodeURIComponent(searchName.trim())}&type=${nameType}`;
      if (nameType === 'event') {
        url += `&year=${encodeURIComponent(searchYear)}&eventName=${encodeURIComponent(searchEvent)}`;
      } else {
        url += `&teamYear=${encodeURIComponent(searchTeamYear)}`;
      }
    }

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setVerifyResult(data);
        fetchMetrics();
        setTimeout(() => {
          document.getElementById('verify-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        setVerifyResult({ success: false, message: data.error || "Query failed." });
      }
    } catch (err) {
      setVerifyResult({ success: false, message: "Server connection failure." });
    }
  };

  const handleNameInput = async (value) => {
    setSearchName(value);
    if (!value) {
      setNameSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/credentials/suggest?query=${encodeURIComponent(value)}&type=${nameType}`);
      if (res.ok) {
        const data = await res.json();
        setNameSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated Quiz Results Publisher (Integrator Panel)
  const triggerQuizPublish = async () => {
    const payload = {
      quizId: "quiz-ds-java-2026",
      quizTitle: "Quiz Master",
      participants: [
        { name: "Amit Kumar Yadav", email: "student@mscprpcem.tech", score: 92 },
        { name: "Sneha Patil", email: "sneha@mscprpcem.tech", score: 75 },
        { name: "Rohan Deshmukh", email: "rohan@mscprpcem.tech", score: 40 }
      ],
      publishDate: "20 July 2026",
      rules: { passingScore: 50, goldScore: 90 }
    };

    try {
      const res = await fetch('/api/integration/publish-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        showNotification("Quiz Platform published results successfully!");
        fetchRecentCredentials();
        fetchMetrics();
        fetchSimulatedEmails();
        // If logged in as student, refresh wallet
        if (user && user.email === 'student@mscprpcem.tech') {
          fetchMyWallet();
        }
      } else {
        showNotification(`Error: ${data.error}`);
      }
    } catch (err) {
      showNotification("Failed to integrate quiz publisher.");
    }
  };

  // View Badge click (First login lazy registration simulation)
  const handleEmailViewBadge = (emailBody) => {
    // Extract ID and recipient email
    const idMatch = emailBody.match(/MSC-[A-Z]+-\d+/i);
    const emailMatch = emailBody.match(/Congratulations,\s+([^\n!]+)/i);
    
    if (idMatch) {
      const credId = idMatch[0];
      setInboxOpen(false);

      // Search for the credential details
      fetch(`/api/credentials/verify?credentialId=${credId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.record) {
            setSelectedCred(data.record);
            
            // If already logged in, redirect to details, else trigger Lazy Authentication
            if (user) {
              setCurrentView('credential-detail');
            } else {
              setLazyEmail(data.record.recipient_email);
              setShowLazyPrompt(true);
            }
          } else {
            showNotification("Failed to locate credential details.");
          }
        });
    }
  };

  // Continue with OTP lazy registration submit
  const handleLazyAuthSubmit = async () => {
    try {
      const res = await fetch('/api/auth/lazy-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lazyEmail })
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setShowLazyPrompt(false);
        showNotification("Digital Wallet linked successfully!");
        
        // Fetch student's wallet
        const walletRes = await fetch('/api/credentials/my');
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setCredentials(walletData);
        }

        // Set view to detail
        setCurrentView('credential-detail');
      } else {
        showNotification(`Auth Error: ${data.error}`);
      }
    } catch (err) {
      showNotification("Lazy authentication failed.");
    }
  };

  // Web camera scanner scripts
  const startCameraScan = () => {
    setCameraActive(true);
    setCameraError(false);

    if (qrLoaded) {
      initScanner();
      return;
    }

    const script = document.createElement('script');
    script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
    script.async = true;
    script.onload = () => {
      setQrLoaded(true);
      initScanner();
    };
    script.onerror = () => {
      setCameraError(true);
    };
    document.body.appendChild(script);
  };

  const initScanner = () => {
    setTimeout(() => {
      try {
        const html5QrcodeScanner = new window.Html5Qrcode("qr-scanner-element");
        scannerRef.current = html5QrcodeScanner;

        html5QrcodeScanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 200, height: 200 } },
          (qrCodeMessage) => {
            html5QrcodeScanner.stop();
            setCameraActive(false);
            setSearchId(qrCodeMessage);
            setActiveVerifyTab('id');
            handleVerify(null, 'id', qrCodeMessage);
            showNotification("QR code scanned!");
          },
          () => {}
        ).catch(() => {
          setCameraError(true);
        });
      } catch (err) {
        setCameraError(true);
      }
    }, 300);
  };

  const stopCameraScan = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
      } catch (e) {}
    }
    setCameraActive(false);
  };

  const triggerMockScan = () => {
    stopCameraScan();
    showNotification("Simulating scanner camera...");
    setTimeout(() => {
      const demoId = "MSC-BDG-00231";
      setSearchId(demoId);
      setActiveVerifyTab('id');
      handleVerify(null, 'id', demoId);
      showNotification("Mock QR Scan successful!");
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showNotification("Decoding certificate metadata...");
    setTimeout(() => {
      const name = file.name.toUpperCase();
      let targetId = "MSC-BDG-00231";
      const match = name.match(/MSC-[A-Z]+-\d+/i);
      if (match) {
        targetId = match[0].toUpperCase();
      }
      setSearchId(targetId);
      setActiveVerifyTab('id');
      handleVerify(null, 'id', targetId);
    }, 1000);
  };

  const handleCopyLink = async (cred) => {
    const verifyUrl = `${window.location.origin}?verifyId=${cred.id}`;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      showNotification("Credential verify link copied!");
      fetch('/api/credentials/increment-share', { method: 'POST' });
    } catch (e) {}
  };

  // LinkedIn Certification Link
  const getLinkedInLink = (cred) => {
    const orgName = encodeURIComponent("Microsoft Student Club PRPCEM");
    const certName = encodeURIComponent(cred.title);
    const certId = encodeURIComponent(cred.id);
    const verifyUrl = encodeURIComponent(`${window.location.origin}?verifyId=${cred.id}`);

    let issueYear = 2026;
    let issueMonth = 7;
    const yearMatch = cred.issue_date.match(/\d{4}/);
    if (yearMatch) issueYear = parseInt(yearMatch[0]);

    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    months.forEach((m, idx) => {
      if (cred.issue_date.toLowerCase().includes(m)) {
        issueMonth = idx + 1;
      }
    });

    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certId=${certId}&certUrl=${verifyUrl}`;
  };

  // HTML5 Canvas Certificate Exporter engine
  const handleCertificateDownload = async (cred) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Borders
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 20;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 24px Outfit, sans-serif';
    ctx.fillText('MICROSOFT STUDENT CLUB PRPCEM', canvas.width / 2, 160);

    ctx.fillStyle = '#2563eb';
    ctx.font = '800 48px Outfit, sans-serif';
    ctx.fillText(cred.type === 'badge' ? 'BADGE OF ACHIEVEMENT' : 'CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 280);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 500 20px Georgia, serif';
    ctx.fillText('This verified achievement is presented to', canvas.width / 2, 360);

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 44px Outfit, sans-serif';
    ctx.fillText(cred.recipient_name, canvas.width / 2, 440);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 18px Manrope, sans-serif';
    ctx.fillText('for successful completion of the weekly quiz / program', canvas.width / 2, 510);

    ctx.fillStyle = '#2563eb';
    ctx.font = '800 36px Outfit, sans-serif';
    ctx.fillText(cred.title, canvas.width / 2, 570);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 14px Manrope, sans-serif';
    ctx.fillText(cred.description || '', canvas.width / 2, 620);

    // Signatures
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 16px Manrope, sans-serif';
    ctx.fillText(`Issued: ${cred.issue_date}`, 120, 760);
    ctx.font = '500 13px Manrope, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Credential ID: ${cred.id}`, 120, 790);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic 700 18px Georgia, serif';
    ctx.fillText('Club President', canvas.width - 120, 760);
    ctx.font = '500 13px Manrope, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Microsoft Student Club Chapter', canvas.width - 120, 790);

    // Stamp
    ctx.textAlign = 'center';
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 760, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 12px Outfit, sans-serif';
    ctx.fillText('VERIFIED', canvas.width / 2, 755);
    ctx.font = '700 9px Outfit, sans-serif';
    ctx.fillText('MSC SECURITY', canvas.width / 2, 772);

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${cred.title.replace(/\s+/g, "_")}_${cred.id}.png`;
    link.href = dataURL;
    link.click();

    fetch('/api/credentials/increment-download', { method: 'POST' });
    showNotification("Downloaded successfully!");
  };

  return (
    <div className="app-container">
      {/* Header bar */}
      <header className="navbar">
        <a href="#" className="nav-brand" onClick={() => { setCurrentView('home'); setVerifyResult(null); }}>
          <img src="/assets/MSC_logo.png" className="nav-logo" alt="Logo" />
          <div className="brand-text">
            <span className="brand-title">Microsoft Student Club</span>
            <span className="brand-sub">
              PRPCEM
              {user && user.role === 'admin' && (
                <span style={{ background: '#2563eb', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <i className="fa-solid fa-user-shield" style={{ fontSize: '8px' }}></i> Admin
                </span>
              )}
            </span>
          </div>
        </a>

        {/* Middle search bar if logged in, otherwise standard public navbar links */}
        {user ? (
          <div className="navbar-search-container">
            <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)', fontSize: '12px' }}></i>
            <input 
              type="text" 
              placeholder="Search for credentials, badges or skills..." 
              className="navbar-search-input" 
              readOnly
            />
          </div>
        ) : (
          <nav className="nav-links">
            <a href="#" className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setVerifyResult(null); }}>Home</a>
            <a href="#" className={`nav-link ${currentView === 'badge-catalog' ? 'active' : ''}`} onClick={() => setCurrentView('badge-catalog')}>Badge Catalog</a>
          </nav>
        )}

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Notification bells exactly matching screenshot */}
              <button className="help-btn" style={{ position: 'relative' }} onClick={() => showNotification("You have 3 new notifications.")}>
                <i className="fa-regular fa-bell"></i>
                <span style={{ position: 'absolute', top: '2px', right: '2px', width: '6px', height: '6px', background: '#2563eb', borderRadius: '50%' }}></span>
              </button>

              <button className="help-btn" onClick={() => showNotification("No new private messages.")}>
                <i className="fa-regular fa-envelope"></i>
              </button>

              {/* User profile dropdown exactly matching screenshot */}
              <div 
                className="navbar-profile-wrapper"
                onClick={() => setCurrentView('settings')}
              >
                <div className="profile-photo-circle" style={{ width: '32px', height: '32px', fontSize: '12px', margin: 0, border: '1px solid #cbd5e1', background: '#eff6ff' }}>
                  {user.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {user.name || 'Amit Kumar Yadav'}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {user.role === 'admin' ? 'Control Panel' : 'View Profile'}
                  </span>
                </div>
              </div>

              <button 
                className="signin-btn" 
                onClick={handleLogout} 
                style={{ background: '#f1f5f9', color: 'var(--text-main)', boxShadow: 'none', padding: '6px 12px', fontSize: '11px' }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          ) : (
            <>
              <button className="help-btn" onClick={() => showNotification("Verify achievements or sign in to open your digital wallet.")}>
                <i className="fa-regular fa-circle-question"></i>
              </button>
              <button className="signin-btn" onClick={() => setCurrentView('auth')}>
                <i className="fa-solid fa-user"></i> Sign In
              </button>
            </>
          )}

          <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="modal-overlay" style={{ zIndex: 999 }} onClick={() => setMobileMenuOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '280px', height: '100vh', margin: '0 0 0 auto', borderRadius: '24px 0 0 24px', animation: 'slideInRight 200ms ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '40px 24px' }}>
              <button className="modal-close-btn" onClick={() => setMobileMenuOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                <img src="/assets/MSC_logo.png" style={{ height: '30px' }} alt="Logo" />
                <h4 style={{ fontWeight: 800 }}>MSC Menu</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#" className="nav-link" onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}>Home</a>
                <a href="#" className="nav-link" onClick={() => { setCurrentView('badge-catalog'); setMobileMenuOpen(false); }}>Badge Catalog</a>

                
                {user && (
                  <>
                    <a href="#" className="nav-link" onClick={() => { setCurrentView('my-credentials'); setMobileMenuOpen(false); }}>My Credentials</a>
                    <a href="#" className="nav-link" onClick={() => { setCurrentView('my-badges'); setMobileMenuOpen(false); }}>My Badges</a>
                    <a href="#" className="nav-link" onClick={() => { setCurrentView('collections'); setMobileMenuOpen(false); }}>Collections</a>
                    <a href="#" className="nav-link" onClick={() => { setCurrentView('activity'); setMobileMenuOpen(false); }}>Activity</a>
                    <a href="#" className="nav-link" onClick={() => { setCurrentView('settings'); setMobileMenuOpen(false); }}>Settings</a>
                  </>
                )}

                {user && user.role === 'admin' && (
                  <a href="#" className="nav-link" onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}>Admin Panel</a>
                )}

                {user ? (
                  <button className="signin-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
                    Sign Out
                  </button>
                ) : (
                  <button className="signin-btn" onClick={() => { setCurrentView('auth'); setMobileMenuOpen(false); }} style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Pages Router */}
      <main className="main-content">
        
        {/* DEV INTEGRATOR SIMULATOR BAR */}
        {currentView === 'home' && (
          <div className="wallet-wrapper" style={{ marginTop: '16px', marginBottom: '-16px' }}>
            <div className="integrator-panel">
              <h3>
                <i className="fa-solid fa-code-fork" style={{ color: '#d97706' }}></i> 
                Quiz Platform Integration Simulator
              </h3>
              <p style={{ fontSize: '12px', color: '#78350f', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                Simulate your Quiz Platform finalizing result score rules and clicking <strong>Publish Results</strong>. 
                This will automatically evaluate student scores, award badges/certificates in the DB, and trigger simulated email notifications.
              </p>
              <button className="badge-btn primary-btn" onClick={triggerQuizPublish} style={{ padding: '8px 18px', fontSize: '11px', display: 'inline-flex' }}>
                <i className="fa-solid fa-cloud-arrow-up"></i> Simulate Publish Quiz Results
              </button>
            </div>
          </div>
        )}



        {/* Authenticated dashboard pages wrap around Left Sidebar layout */}
        {user && ['my-credentials', 'my-badges', 'collections', 'activity', 'settings', 'admin'].includes(currentView) ? (
          <div className="dashboard-layout-wrapper">
            <aside className="dashboard-sidebar">
              <ul className="sidebar-menu-list">
                {currentView === 'admin' ? (
                  <>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'dashboard' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('dashboard')}
                    >
                      <i className="fa-solid fa-house"></i> Dashboard
                    </li>

                    <li className="sidebar-menu-header" style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, padding: '12px 14px 4px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ISSUE & MANAGE</li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'issue' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('issue')}
                    >
                      <i className="fa-solid fa-square-plus"></i> Issue Credential
                    </li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'bulk' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('bulk')}
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i> Bulk Issue
                    </li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'credentials' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('credentials')}
                    >
                      <i className="fa-solid fa-file-contract"></i> Credentials
                    </li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'badges' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('badges')}
                    >
                      <i className="fa-solid fa-award"></i> Badges
                    </li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'collections' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('collections')}
                    >
                      <i className="fa-solid fa-cubes"></i> Collections
                    </li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'templates' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('templates')}
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Templates
                    </li>

                    <li className="sidebar-menu-header" style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, padding: '12px 14px 4px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>USERS & ROLES</li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'users' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('users')}
                    >
                      <i className="fa-solid fa-users"></i> Users
                    </li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'roles' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('roles')}
                    >
                      <i className="fa-solid fa-user-gear"></i> Roles & Perms
                    </li>

                    <li className="sidebar-menu-header" style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, padding: '12px 14px 4px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>VERIFICATION</li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'requests' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('requests')}
                    >
                      <i className="fa-solid fa-circle-check"></i> Requests
                    </li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'logs' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('logs')}
                    >
                      <i className="fa-solid fa-clock-rotate-left"></i> Logs
                    </li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'revoked' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('revoked')}
                    >
                      <i className="fa-solid fa-circle-minus"></i> Revoked Items
                    </li>

                    <li className="sidebar-menu-header" style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, padding: '12px 14px 4px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ANALYTICS</li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'analytics' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('analytics')}
                    >
                      <i className="fa-solid fa-chart-line"></i> Analytics
                    </li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'reports' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('reports')}
                    >
                      <i className="fa-solid fa-chart-pie"></i> Reports
                    </li>

                    <li className="sidebar-menu-header" style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, padding: '12px 14px 4px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SETTINGS</li>
                    <li 
                      className={`sidebar-menu-item ${adminSubView === 'general-settings' ? 'active' : ''}`} 
                      onClick={() => setAdminSubView('general-settings')}
                    >
                      <i className="fa-solid fa-sliders"></i> General
                    </li>

                    <li 
                      style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '6px', borderRadius: '0' }}
                      className="sidebar-menu-item" 
                      onClick={() => { setCurrentView('my-credentials'); fetchMyWallet(); }}
                    >
                      <i className="fa-solid fa-circle-chevron-left"></i> Student Panel
                    </li>
                  </>
                ) : (
                  <>
                    <li 
                      className={`sidebar-menu-item ${currentView === 'my-credentials' ? 'active' : ''}`} 
                      onClick={() => { setCurrentView('my-credentials'); fetchMyWallet(); }}
                    >
                      <i className="fa-solid fa-house"></i> Dashboard
                    </li>
                    <li 
                      className={`sidebar-menu-item ${currentView === 'my-badges' ? 'active' : ''}`} 
                      onClick={() => { setCurrentView('my-badges'); fetchMyWallet(); }}
                    >
                      <i className="fa-solid fa-file-contract"></i> My Credentials
                    </li>
                    <li 
                      className={`sidebar-menu-item ${currentView === 'collections' ? 'active' : ''}`} 
                      onClick={() => setCurrentView('collections')}
                    >
                      <i className="fa-solid fa-cubes"></i> Collections
                    </li>
                    <li 
                      className={`sidebar-menu-item ${currentView === 'activity' ? 'active' : ''}`} 
                      onClick={() => setCurrentView('activity')}
                    >
                      <i className="fa-solid fa-clock-rotate-left"></i> Activity
                    </li>
                    <li 
                      className={`sidebar-menu-item ${currentView === 'settings' ? 'active' : ''}`} 
                      onClick={() => setCurrentView('settings')}
                    >
                      <i className="fa-solid fa-sliders"></i> Account Settings
                    </li>
                    {user.role === 'admin' && (
                      <li 
                        className={`sidebar-menu-item ${currentView === 'admin' ? 'active' : ''}`} 
                        onClick={() => setCurrentView('admin')}
                        style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '6px', borderRadius: '0' }}
                      >
                        <i className="fa-solid fa-user-gear"></i> Admin Panel
                      </li>
                    )}
                  </>
                )}
              </ul>
              
              {currentView !== 'admin' && (
                <>
                  <div className="sidebar-profile-promo-card">
                    <h5>Your Public Profile</h5>
                    <p>Showcase your achievements with a public profile.</p>
                    <button className="public-profile-anchor" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setCurrentView('public-profile')}>
                      View Public Profile
                    </button>
                  </div>

                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer', paddingLeft: '10px', marginTop: '6px' }} 
                    onClick={() => showNotification("Support module activated. Opening ticket...")}
                  >
                    <i className="fa-solid fa-headset"></i> Need Help? Contact Support
                  </div>
                </>
              )}
            </aside>

            <div className="dashboard-main-view">
              {currentView === 'my-credentials' && (
                <MyCredentials
                  user={user}
                  credentials={credentials}
                  onSelectCredential={(c) => { setSelectedCred(c); setCurrentView('credential-detail'); }}
                  onShare={handleCopyLink}
                  onDownload={handleCertificateDownload}
                  onNavigateTo={(view) => setCurrentView(view)}
                  getLinkedInLink={getLinkedInLink}
                />
              )}

              {currentView === 'my-badges' && (
                <div className="wallet-wrapper" style={{ padding: 0 }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>My Earned Badges & Credentials</h3>
                  {credentials.length === 0 ? (
                    <div className="empty-dashboard">
                      <div className="empty-icon-box"><i className="fa-solid fa-award"></i></div>
                      <h3>No Badges Earned Yet</h3>
                    </div>
                  ) : (
                    <div className="wallet-badges-grid">
                      {credentials.map((cred) => (
                        <div key={cred.id} className={`premium-badge-card ${cred.type}`}>
                          <div className="badge-card-icon-frame">
                            <i className={`fa-solid ${cred.badge_icon || (cred.type === 'certificate' ? 'fa-award' : 'fa-shield-halved')}`}></i>
                          </div>
                          <div className="badge-card-main-title">{cred.title}</div>
                          <div className="badge-card-issuer">Microsoft Student Club PRPCEM</div>
                          <span className="badge-verified-pill">
                            <i className="fa-solid fa-circle-check"></i> Verified
                          </span>
                          
                          <div className="badge-skills-tray">
                            {(cred.skills_list || 'Logic, Problem Solving').split(',').map((skill, index) => (
                              <span key={index} className="badge-skill-tag">{skill.trim()}</span>
                            ))}
                          </div>

                          <div className="badge-card-date-row">
                            <span>Issued: {cred.issue_date}</span>
                            <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{cred.id}</span>
                          </div>

                          <div className="badge-card-actions-row">
                            <button className="badge-btn primary-btn" onClick={() => { setSelectedCred(cred); setCurrentView('credential-detail'); }}>
                              View
                            </button>
                            <button className="badge-btn" onClick={() => handleCertificateDownload(cred)}>
                              Download
                            </button>
                            <button className="badge-btn" onClick={() => handleCopyLink(cred)}>
                              Share
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentView === 'collections' && <Collections />}

              {currentView === 'activity' && <ActivityFeed />}

              {currentView === 'settings' && (
                <Settings 
                  user={user} 
                  onShowNotification={showNotification} 
                  onProfileUpdate={checkSession}
                />
              )}

              {currentView === 'admin' && user.role === 'admin' && (
                <AdminPanel 
                  user={user} 
                  onShowNotification={showNotification} 
                  adminSubView={adminSubView}
                  onNavigateToSubView={(view) => setAdminSubView(view)}
                />
              )}
            </div>
          </div>
        ) : (
          /* Render public/standalone views */
          <>
            {currentView === 'auth' && (
              <Auth
                onLoginSuccess={(usr) => { setUser(usr); fetchMyWallet(); }}
                onViewChange={(view) => setCurrentView(view)}
              />
            )}

            {currentView === 'credential-detail' && selectedCred && (
              <BadgeDetail
                credential={selectedCred}
                onBack={() => {
                  setSelectedCred(null);
                  setCurrentView(user ? 'my-credentials' : 'home');
                }}
                onShare={handleCopyLink}
                onDownload={handleCertificateDownload}
                getLinkedInLink={getLinkedInLink}
              />
            )}

            {currentView === 'badge-catalog' && <BadgeCatalog />}

            {currentView === 'public-profile' && (
              <div className="wallet-wrapper">
                <div style={{ display: 'flex', gap: '10px', maxWidth: '400px', margin: '0 auto 20px' }}>
                  <input
                    type="text"
                    className="verify-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Search username (e.g. amityadav)"
                    value={profileSearchQuery}
                    onChange={(e) => setProfileSearchQuery(e.target.value)}
                  />
                </div>
                <PublicProfile username={profileSearchQuery} onShowNotification={showNotification} />
              </div>
            )}
          </>
        )}

        {currentView === 'home' && (
          <>
            {/* Hero Grid layout */}
            <section className="hero-section">
              <div className="hero-left">
                <h1>Verify. Share. Celebrate.<br /><span className="blue-text">Achievements.</span></h1>
                <p>The official platform to verify Microsoft Student Club PRPCEM certificates, badges, and achievements.</p>
                <div className="features-tags">
                  <div className="tag-item"><i className="fa-solid fa-circle-check"></i> 100% Authentic</div>
                  <div className="tag-item"><i className="fa-solid fa-lock"></i> Tamper Proof</div>
                  <div className="tag-item"><i className="fa-solid fa-bolt"></i> Instant Verification</div>
                  <div className="tag-item"><i className="fa-solid fa-globe"></i> Globally Verifiable</div>
                </div>
              </div>
              
              <div className="hero-right">
                <div className="cert-mockup">
                  <div className="cert-mock-header">
                    <img src="/assets/MSC_logo.png" className="cert-mock-logo" alt="Logo" />
                    <span className="cert-mock-badge">Verified</span>
                  </div>
                  <div className="cert-mock-body">
                    <h3>Certificate of Achievement</h3>
                    <h2>Amit Kumar Yadav</h2>
                    <p>Successfully completed the club program event Copilot Dev Days with excellence.</p>
                  </div>
                  <div className="cert-mock-footer">
                    <div className="cert-mock-sign">MSC President</div>
                    <div className="cert-mock-verify-seal">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>Authentic</span>
                    </div>
                  </div>
                </div>
                <div className="shield-overlay">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
              </div>
            </section>

            {/* Interactive Tab verification card */}
            <section className="verify-container">
              <div className="verify-card">
                <div className="verify-card-header">
                  <h2>Verify a Credential</h2>
                  <p>Choose any option to verify</p>
                </div>

                <div className="verify-tabs">
                  <button className={`tab-btn ${activeVerifyTab === 'id' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('id'); setVerifyResult(null); stopCameraScan(); }}>
                    <i className="fa-solid fa-hashtag"></i> Credential ID
                  </button>
                  <button className={`tab-btn ${activeVerifyTab === 'email' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('email'); setVerifyResult(null); stopCameraScan(); }}>
                    <i className="fa-solid fa-envelope"></i> Email
                  </button>
                  <button className={`tab-btn ${activeVerifyTab === 'name' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('name'); setVerifyResult(null); stopCameraScan(); }}>
                    <i className="fa-solid fa-user"></i> Name
                  </button>
                  <button className={`tab-btn ${activeVerifyTab === 'badge' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('badge'); setVerifyResult(null); stopCameraScan(); }}>
                    <i className="fa-solid fa-award"></i> Badge ID
                  </button>
                  <button className={`tab-btn ${activeVerifyTab === 'qr' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('qr'); setVerifyResult(null); startCameraScan(); }}>
                    <i className="fa-solid fa-qrcode"></i> QR Code
                  </button>
                  <button className={`tab-btn ${activeVerifyTab === 'upload' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('upload'); setVerifyResult(null); stopCameraScan(); }}>
                    <i className="fa-solid fa-upload"></i> Upload
                  </button>
                  <button className={`tab-btn ${activeVerifyTab === 'url' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('url'); setVerifyResult(null); stopCameraScan(); }}>
                    <i className="fa-solid fa-link"></i> Verification URL
                  </button>
                </div>

                {/* Verification fields */}
                <div className="verify-input-group">
                  {activeVerifyTab === 'id' && (
                    <form onSubmit={(e) => handleVerify(e, 'id')} className="search-container-row">
                      <div className="input-with-icon">
                        <i className="fa-solid fa-hashtag"></i>
                        <input
                          type="text"
                          className="verify-input"
                          placeholder="Enter Credential ID (e.g. MSC-BDG-00231)"
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="verify-btn">Verify</button>
                    </form>
                  )}

                  {activeVerifyTab === 'badge' && (
                    <form onSubmit={(e) => handleVerify(e, 'badge')} className="search-container-row">
                      <div className="input-with-icon">
                        <i className="fa-solid fa-award"></i>
                        <input
                          type="text"
                          className="verify-input"
                          placeholder="Enter Badge ID (e.g. MSC-BDG-00231)"
                          value={searchBadgeId}
                          onChange={(e) => setSearchBadgeId(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="verify-btn">Verify</button>
                    </form>
                  )}

                  {activeVerifyTab === 'email' && (
                    <form onSubmit={(e) => handleVerify(e, 'email')} className="search-container-row">
                      <div className="input-with-icon">
                        <i className="fa-solid fa-envelope"></i>
                        <input
                          type="email"
                          className="verify-input"
                          placeholder="Enter Student's Email Address"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="verify-btn">Search</button>
                    </form>
                  )}

                  {activeVerifyTab === 'url' && (
                    <form onSubmit={(e) => handleVerify(e, 'url')} className="search-container-row">
                      <div className="input-with-icon">
                        <i className="fa-solid fa-link"></i>
                        <input
                          type="text"
                          className="verify-input"
                          placeholder="Paste Verification Link"
                          value={searchUrl}
                          onChange={(e) => setSearchUrl(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="verify-btn">Verify</button>
                    </form>
                  )}

                  {activeVerifyTab === 'name' && (
                    <div>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                        <select
                          className="verify-input"
                          style={{ paddingLeft: '16px', margin: 0, width: '220px' }}
                          value={nameType}
                          onChange={(e) => {
                            setNameType(e.target.value);
                            setNameSuggestions([]);
                            setSearchName('');
                          }}
                        >
                          <option value="event">Event Verification</option>
                          <option value="team">Team Member Verification</option>
                        </select>

                        {nameType === 'event' ? (
                          <>
                            <select className="verify-input" style={{ paddingLeft: '16px', margin: 0 }} value={searchYear} onChange={(e) => setSearchYear(e.target.value)}>
                              <option value="">Select Year</option>
                              <option value="2026">2026</option>
                              <option value="2025">2025</option>
                            </select>
                            <select className="verify-input" style={{ paddingLeft: '16px', margin: 0 }} value={searchEvent} onChange={(e) => setSearchEvent(e.target.value)}>
                              <option value="">Select Event</option>
                              <option value="Copilot Dev Days">Copilot Dev Days</option>
                              <option value="GitLit — The Diwali Code Fest">GitLit — The Diwali Code Fest</option>
                              <option value=".NET Conf 2025 Amravati">.NET Conf 2025 Amravati</option>
                            </select>
                          </>
                        ) : (
                          <select className="verify-input" style={{ paddingLeft: '16px', margin: 0 }} value={searchTeamYear} onChange={(e) => setSearchTeamYear(e.target.value)}>
                            <option value="">Select Team Year</option>
                            <option value="2025-2026">2025-2026</option>
                            <option value="2024-2025">2024-2025</option>
                          </select>
                        )}
                      </div>

                      <form onSubmit={(e) => handleVerify(e, 'name')} className="search-container-row" style={{ position: 'relative' }}>
                        <div className="input-with-icon">
                          <i className="fa-solid fa-user"></i>
                          <input
                            type="text"
                            className="verify-input"
                            placeholder="Search your name..."
                            value={searchName}
                            onChange={(e) => handleNameInput(e.target.value)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onFocus={() => setShowSuggestions(true)}
                          />
                        </div>
                        <button type="submit" className="verify-btn">Verify</button>
                      </form>

                      {showSuggestions && nameSuggestions.length > 0 && (
                        <div className="suggestions-box">
                          {nameSuggestions.map((name, index) => (
                            <div key={index} className="suggestion-item" onMouseDown={() => { setSearchName(name); setNameSuggestions([]); }}>
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeVerifyTab === 'qr' && (
                    <div className="qr-scan-view">
                      <div className="scanner-video-box">
                        <div className="scanner-laser"></div>
                        <div id="qr-scanner-element" style={{ width: '100%', height: '100%', zIndex: 5 }}></div>
                        {cameraActive && !cameraError && (
                          <div className="scanner-overlay-box">
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>ALIGN QR CODE HERE</span>
                          </div>
                        )}
                        {(!cameraActive || cameraError) && (
                          <div style={{ textAlign: 'center', zIndex: 10 }}>
                            <i className="fa-solid fa-camera" style={{ fontSize: '28px', color: '#64748b', marginBottom: '8px' }}></i>
                            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Camera scanning unavailable</p>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button className="scan-camera-btn" onClick={triggerMockScan}>Run Test Scan (Mock)</button>
                        {cameraActive && <button className="scan-camera-btn" style={{ background: '#ef4444' }} onClick={stopCameraScan}>Stop</button>}
                      </div>
                    </div>
                  )}

                  {activeVerifyTab === 'upload' && (
                    <div className="file-upload-zone" onClick={() => document.getElementById('cert-uploader').click()}>
                      <div className="upload-icon-box"><i className="fa-solid fa-file-arrow-up"></i></div>
                      <h4>Upload Certificate File</h4>
                      <p>Drop file here or click to upload</p>
                      <input type="file" id="cert-uploader" className="hidden-file-input" accept="image/*" onChange={handleFileUpload} />
                    </div>
                  )}
                </div>

                {activeVerifyTab !== 'qr' && activeVerifyTab !== 'upload' && (
                  <div className="qr-tip">
                    <i className="fa-solid fa-qrcode" style={{ marginRight: '6px' }}></i> Don't have an ID? <span className="qr-link" onClick={() => setActiveVerifyTab('qr')}>Scan QR code</span> on your certificate
                  </div>
                )}

                {/* Results Anchor */}
                <div id="verify-results-anchor"></div>
                {verifyResult && (
                  <div className="result-container">
                    {verifyResult.success ? (
                      verifyResult.records ? (
                        <div>
                          <div className="success-result-card" style={{ marginBottom: '12px' }}>
                            <div className="success-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                            <div className="result-details">
                              <div className="result-status-title">Records Found</div>
                              <div className="result-message-text">Multiple achievements issued to: {searchEmail}</div>
                            </div>
                          </div>
                          <div className="multiple-records-container">
                            {verifyResult.records.map((rec) => (
                              <div key={rec.id} className="mini-cred-item" onClick={() => { setSelectedCred(rec); setCurrentView('credential-detail'); }}>
                                <div className="mini-cred-info">
                                  <i className={`fa-solid ${rec.badge_icon || 'fa-award'} mini-icon`}></i>
                                  <div className="mini-details">
                                    <h4>{rec.title}</h4>
                                    <span>Issued: {rec.issue_date} • ID: {rec.id}</span>
                                  </div>
                                </div>
                                <div className="mini-action">View <i className="fa-solid fa-arrow-right"></i></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="success-result-card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedCred(verifyResult.record); setCurrentView('credential-detail'); }}>
                          <div className="success-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                          <div className="result-details">
                            <div className="result-status-title">Authentic Achievement Verified</div>
                            <div className="result-message-text">✓ {verifyResult.record.recipient_name} is verified for {verifyResult.record.title}.</div>
                            <div className="result-info-grid">
                              <div className="result-info-item"><span className="info-label">Student</span><span className="info-val">{verifyResult.record.recipient_name}</span></div>
                              <div className="result-info-item"><span className="info-label">Credential ID</span><span className="info-val" style={{ fontFamily: 'monospace' }}>{verifyResult.record.id}</span></div>
                              <div className="result-info-item"><span className="info-label">Type</span><span className="info-val" style={{ textTransform: 'capitalize' }}>{verifyResult.record.type}</span></div>
                              <div className="result-info-item"><span className="info-label">Issue Date</span><span className="info-val">{verifyResult.record.issue_date}</span></div>
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '11px', color: '#166534', borderTop: '1px solid rgba(22,163,74,0.1)', paddingTop: '8px' }}>
                              Click card to open award presentation view.
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="error-result-card">
                        <div className="error-icon-box"><i className="fa-solid fa-circle-exclamation"></i></div>
                        <div>
                          <div className="error-status-title">Verification Refused</div>
                          <div className="error-message-text">❌ Record not found. Please contact admin.</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Metrics banner */}
            <section className="metrics-strip">
              <div className="metric-card">
                <div className="metric-icon-box"><i className="fa-solid fa-certificate"></i></div>
                <div className="metric-number">{metrics.certificatesIssued.toLocaleString()}+</div>
                <div className="metric-label">Certificates Issued</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon-box"><i className="fa-solid fa-shield-halved"></i></div>
                <div className="metric-number">{metrics.badgesIssued.toLocaleString()}+</div>
                <div className="metric-label">Badges Issued</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon-box"><i className="fa-solid fa-user-graduate"></i></div>
                <div className="metric-number">{metrics.studentsCount.toLocaleString()}+</div>
                <div className="metric-label">Students</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                <div className="metric-number">{metrics.verifiedToday}+</div>
                <div className="metric-label">Verified Today</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon-box"><i className="fa-solid fa-circle-arrow-down"></i></div>
                <div className="metric-number">{metrics.downloadsToday}+</div>
                <div className="metric-label">Downloads Today</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon-box"><i className="fa-brands fa-linkedin-in"></i></div>
                <div className="metric-number">{metrics.linkedinShares}+</div>
                <div className="metric-label">LinkedIn Shares</div>
              </div>
            </section>

            {/* Recent Credentials grid */}
            <section className="recent-section">
              <div className="section-header">
                <h2>Recently Issued Credentials</h2>
              </div>
              <div className="recent-grid">
                {recentCredentials.map((c) => (
                  <div key={c.id} className="recent-card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedCred(c); setCurrentView('credential-detail'); }}>
                    <span className={`badge-tag ${c.type}`}>{c.type}</span>
                    <div className="recent-title">{c.title}</div>
                    <div className="recent-recipient">{c.recipient_name}</div>
                    <div className="recent-footer">
                      <i className={`fa-solid ${c.badge_icon || 'fa-award'}`}></i>
                      <span>{c.issue_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col" style={{ gridColumn: 'span 2' }}>
            <img src="/assets/MSC_logo.png" className="footer-brand-logo" alt="Logo" />
            <h3 style={{ margin: '4px 0 10px', textTransform: 'none', fontSize: '16px' }}>Microsoft Student Club PRPCEM</h3>
            <p className="footer-desc">Empowering students to learn, build, and grow together through student-led events and technical workshops.</p>
            <p className="footer-copyright">© 2026 Microsoft Student Club PRPCEM. All rights reserved.</p>
          </div>
          
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#" onClick={() => { setCurrentView('home'); setVerifyResult(null); }}>Verify Credential</a></li>
              <li><a href="#" onClick={() => { setCurrentView('home'); setActiveVerifyTab('name'); }}>Explore Credentials</a></li>
              <li><a href="#" onClick={() => { if(user) { setCurrentView('my-credentials'); } else { setCurrentView('auth'); } }}>Public Profiles</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3>Resources</h3>
            <ul className="footer-links">
              <li><a href="https://www.mscprpcem.tech" target="_blank" rel="noreferrer">Events</a></li>
              <li><a href="https://www.mscprpcem.tech" target="_blank" rel="noreferrer">Courses</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><a href="https://www.mscprpcem.tech" target="_blank" rel="noreferrer">Contact Us</a></li>
              <li><a href="https://www.mscprpcem.tech" target="_blank" rel="noreferrer">FAQ</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Dynamic Toast alerts */}
      {notification && (
        <div className="alert-banner">
          <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>
          <span>{notification}</span>
        </div>
      )}

      {/* FIRST LOGIN / LAZY AUTHENTICATION PROMPT */}
      {showLazyPrompt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <button className="modal-close-btn" onClick={() => setShowLazyPrompt(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '38px', color: 'var(--primary)', marginBottom: '14px' }}>
                <i className="fa-solid fa-wallet"></i>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Welcome!</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                We found credentials issued to <strong style={{ color: 'var(--text-main)' }}>{lazyEmail}</strong>. Link them instantly to your digital wallet:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="signin-btn" onClick={handleLazyAuthSubmit} style={{ justifyContent: 'center', width: '100%', background: '#4285f4' }}>
                  <i className="fa-brands fa-google"></i> Continue with Google
                </button>
                <button className="signin-btn" onClick={handleLazyAuthSubmit} style={{ justifyContent: 'center', width: '100%', background: '#2f2f2f' }}>
                  <i className="fa-brands fa-microsoft"></i> Continue with Microsoft
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                  <div style={{ flexGrow: 1, height: '1px', background: '#cbd5e1' }}></div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', padding: '0 10px', fontWeight: 700 }}>OR</span>
                  <div style={{ flexGrow: 1, height: '1px', background: '#cbd5e1' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="verify-input"
                    style={{ paddingLeft: '16px', margin: 0 }}
                    value={lazyEmail}
                    disabled
                  />
                  <button className="verify-btn" style={{ padding: '0 16px' }} onClick={handleLazyAuthSubmit}>
                    Email OTP
                  </button>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Clicking any button instantly verifies ownership, creates a lazy profile, and merges all records.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEVELOPER SIMULATED EMAIL INBOX (Sandbox drawer widget) */}
      <button 
        className="inbox-toggle-btn"
        title="Simulated Mailbox"
        onClick={() => { setInboxOpen(!inboxOpen); fetchSimulatedEmails(); }}
      >
        <i className="fa-solid fa-envelope"></i>
        {simulatedEmails.length > 0 && (
          <span className="inbox-badge-count">{simulatedEmails.length}</span>
        )}
      </button>

      {inboxOpen && (
        <div className="inbox-drawer">
          <div className="inbox-header">
            <h3><i className="fa-solid fa-envelope-open-text"></i> Simulated Student Mailbox</h3>
            <button 
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}
              onClick={() => setInboxOpen(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="inbox-body">
            {simulatedEmails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <i className="fa-solid fa-inbox" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
                No emails received. Trigger a quiz publish to receive credentials emails.
              </div>
            ) : (
              simulatedEmails.map((email) => (
                <div key={email.id} className="email-item">
                  <div className="email-item-header">
                    <span>TO: {email.recipient_email}</span>
                    <span>{new Date(email.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="email-item-subject">{email.subject}</div>
                  <div className="email-body-preview">{email.body}</div>
                  <button 
                    className="email-link-btn"
                    onClick={() => handleEmailViewBadge(email.body)}
                  >
                    Click: [ View Badge ] Link
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Offscreen Canvas Certificate Exporter frame */}
      <canvas ref={canvasRef} width="1600" height="1100" className="canvas-offscreen"></canvas>
    </div>
  );
}
