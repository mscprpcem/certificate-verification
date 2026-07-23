import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { apiFetch } from './config/api';
import Auth from './pages/Auth';
import MyCredentials from './pages/MyCredentials';
import BadgeDetail from './pages/BadgeDetail';
import PublicProfile from './pages/PublicProfile';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import StudentDashboard from './pages/StudentDashboard';
import BadgeCatalog from './pages/BadgeCatalog';
import ActivityFeed from './pages/ActivityFeed';
import NotFound from './pages/NotFound';
const EVENTS_BY_YEAR = {
  '2026': [
    'Copilot Dev Days',
    'Microsoft Azure Cloud Specialist Workshop',
    'AI & LLM Integration Bootcamp'
  ],
  '2025': [
    'GitLit — The Diwali Code Fest',
    '.NET Conf 2025 Amravati'
  ],
  '2024': [
    'Azure Community Day',
    'GitHub Campus Workshop'
  ]
};

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  const [adminSubView, setAdminSubView] = useState('dashboard');
  const [authTab, setAuthTab] = useState('login');
  // Views: 'home', 'auth', 'dashboard', 'my-credentials', 'profile', 'settings', 'admin', 'credential-detail', 'catalog', 'activity', '404'
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [platformMetrics, setPlatformMetrics] = useState({
    certificatesIssued: 24,
    badgesIssued: 18,
    studentsCount: 12,
    verifiedToday: 0,
    downloadsToday: 0,
    linkedinShares: 0
  });
  const [recentVerified, setRecentVerified] = useState([]);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [selectedCred, setSelectedCred] = useState(null);

  // Public profile search username
  const [profileSearchQuery, setProfileSearchQuery] = useState('amityadav');

  // Verification Search states
  const [activeVerifyTab, setActiveVerifyTab] = useState('id');
  const [searchId, setSearchId] = useState('');
  const searchEmail = '';
  const searchBadgeId = '';
  const searchUrl = '';
  
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
  const [lazyEmail, _setLazyEmail] = useState('');
  const [showLazyPrompt, setShowLazyPrompt] = useState(false);

  // FAQ accordion open states
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  // Show Toast
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const [dbEventsByYear, setDbEventsByYear] = useState(EVENTS_BY_YEAR);

  const fetchPlatformData = async () => {
    try {
      const res = await apiFetch('/api/credentials/metrics');
      if (res.ok) {
        const data = await res.json();
        setPlatformMetrics(data);
      }
    } catch (err) {
      console.error("Failed to load platform metrics:", err);
    }

    try {
      const res = await apiFetch('/api/credentials/recent');
      if (res.ok) {
        const data = await res.json();
        setRecentVerified(data);
      }
    } catch (err) {
      console.error("Failed to load recent credentials:", err);
    }

    try {
      const res = await apiFetch('/api/credentials/events');
      if (res.ok) {
        const data = await res.json();
        if (data && data.eventsByYear && Object.keys(data.eventsByYear).length > 0) {
          setDbEventsByYear(prev => ({
            ...prev,
            ...data.eventsByYear
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load database events:", err);
    }
  };

  const navigateTo = (view, customPath = null) => {
    let targetView = view;
    let path = customPath;

    if (view === 'register' || view === 'auth' || view === 'login') {
      targetView = 'auth';
      if (!path) path = '/login';
    }

    setCurrentView(targetView);

    if (!path) {
      switch (targetView) {
        case 'home':
          path = '/';
          break;
        case 'auth':
          path = authTab === 'register' ? '/register' : '/login';
          break;
        case 'catalog':
          path = '/catalog';
          break;
        case 'dashboard':
          path = '/dashboard';
          break;
        case 'my-credentials':
          path = '/my-credentials';
          break;
        case 'activity':
          path = '/activity';
          break;
        case 'profile':
          path = '/profile';
          break;
        case 'settings':
          path = '/settings';
          break;
        case 'admin':
          path = '/admin';
          break;
        case 'public-profile':
          path = `/u/${encodeURIComponent(profileSearchQuery.trim() || 'amityadav')}`;
          break;
        case 'credential-detail':
          path = '/credential-detail';
          break;
        default:
          path = '/';
      }
    }
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const resolveRouteFromPath = (path) => {
    const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';

    if (cleanPath === '/' || cleanPath === '/index.html' || cleanPath === '') {
      setCurrentView('home');
    } else if (cleanPath === '/login' || cleanPath === '/auth') {
      setAuthTab('login');
      setCurrentView('auth');
    } else if (cleanPath === '/register' || cleanPath === '/signup') {
      setAuthTab('register');
      setCurrentView('auth');
    } else if (cleanPath === '/catalog' || cleanPath === '/badges') {
      setCurrentView('catalog');
    } else if (cleanPath === '/dashboard' || cleanPath === '/portal') {
      setCurrentView('dashboard');
    } else if (cleanPath === '/my-credentials' || cleanPath === '/credentials') {
      setCurrentView('my-credentials');
    } else if (cleanPath === '/activity' || cleanPath === '/timeline') {
      setCurrentView('activity');
    } else if (cleanPath === '/profile') {
      setCurrentView('profile');
    } else if (cleanPath === '/settings') {
      setCurrentView('settings');
    } else if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
      setCurrentView('admin');
      const sub = cleanPath.replace(/^\/admin\/?/, '').trim();
      if (sub) {
        setAdminSubView(sub);
      } else {
        setAdminSubView('dashboard');
      }
    } else if (cleanPath.startsWith('/u/')) {
      const uPath = window.location.pathname.replace(/^\/u\//i, '').trim();
      if (uPath) {
        setProfileSearchQuery(uPath);
        setCurrentView('public-profile');
      } else {
        setCurrentView('404');
      }
    } else if (cleanPath === '/credential-detail') {
      setCurrentView('credential-detail');
    } else {
      setCurrentView('404');
    }
  };

  useEffect(() => {
    checkSession();
    fetchPlatformData();

    resolveRouteFromPath(window.location.pathname);

    const handlePopState = () => {
      resolveRouteFromPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verifyId');
    if (verifyId) {
      setSearchId(verifyId);
      setActiveVerifyTab('id');
      // eslint-disable-next-line no-use-before-define
      handleVerify(null, 'id', verifyId);
    }

    const usernameParam = params.get('username');
    if (usernameParam) {
      setProfileSearchQuery(usernameParam);
      setCurrentView('public-profile');
      window.history.pushState({}, '', `/u/${usernameParam}`);
    }

    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSession = async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          fetchMyWallet();
        }
      }
    } catch (err) {
      console.log("No active session found.", err);
    }
  };

  const fetchMyWallet = async () => {
    try {
      const res = await apiFetch('/api/credentials/my');
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    }
  };

  const triggerLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await apiFetch('/api/auth/logout');
      setUser(null);
      setCredentials([]);
      setSelectedCred(null);
      navigateTo('home', '/');
      showNotification("Signed out successfully");
    } catch (err) {
      console.error("Sign out error:", err);
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
      if (!searchName || !searchName.trim()) {
        setVerifyResult({
          success: false,
          message: "Details not found. Please enter Student Full Name."
        });
        setTimeout(() => {
          document.getElementById('verify-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      if (nameType === 'event') {
        if (!searchEvent || !searchYear) {
          setVerifyResult({
            success: false,
            message: "Details not found. Please select Event Name and Year properly."
          });
          setTimeout(() => {
            document.getElementById('verify-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
          return;
        }
        url += `name=${encodeURIComponent(searchName.trim())}&type=${nameType}&year=${encodeURIComponent(searchYear)}&eventName=${encodeURIComponent(searchEvent)}`;
      } else {
        if (!searchTeamYear) {
          setVerifyResult({
            success: false,
            message: "Details not found. Please select Team Year properly."
          });
          setTimeout(() => {
            document.getElementById('verify-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
          return;
        }
        url += `name=${encodeURIComponent(searchName.trim())}&type=${nameType}&teamYear=${encodeURIComponent(searchTeamYear)}`;
      }
    }

    try {
      const res = await apiFetch(url);
      const data = await res.json();

      if (res.ok) {
        setVerifyResult(data);
        setTimeout(() => {
          document.getElementById('verify-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        setVerifyResult({ success: false, message: data.error || "Query failed." });
      }
    } catch (err) {
      console.error("Verification error:", err);
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
      const res = await apiFetch(`/api/credentials/suggest?query=${encodeURIComponent(value)}&type=${nameType}`);
      if (res.ok) {
        const data = await res.json();
        setNameSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Continue with OTP lazy registration submit
  const handleLazyAuthSubmit = async () => {
    try {
      const res = await apiFetch('/api/auth/lazy-login', {
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
        const walletRes = await apiFetch('/api/credentials/my');
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
      console.error("Lazy auth submission failed:", err);
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
        console.error("Camera init failed:", err);
        setCameraError(true);
      }
    }, 300);
  };

  const stopCameraScan = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showNotification("Processing certificate image...");

    // Helper for fallback name matching
    const fallbackNameMatching = (f) => {
      const name = f.name.toUpperCase();
      const match = name.match(/MSC-[A-Z]+-\d+/i);
      if (match) {
        const targetId = match[0].toUpperCase();
        setSearchId(targetId);
        setActiveVerifyTab('id');
        handleVerify(null, 'id', targetId);
        showNotification(`Credential ID detected in filename: ${targetId}`);
      } else {
        showNotification("Could not read QR code or ID from filename. Please upload a valid certificate image.");
      }
    };

    try {
      if (!window.Html5Qrcode) {
        console.warn("Html5Qrcode not loaded globally, falling back to filename parse.");
        fallbackNameMatching(file);
        return;
      }

      // Initialize the offscreen Html5Qrcode reader
      const html5QrCode = new window.Html5Qrcode("hidden-qr-reader");
      
      try {
        const decodedText = await html5QrCode.scanFile(file, false);
        console.log("Decoded Text from uploaded image QR:", decodedText);
        
        let targetId = null;
        try {
          const urlObj = new URL(decodedText);
          targetId = urlObj.searchParams.get("verifyId");
        } catch {
          // Check if it's the raw ID
          const match = decodedText.match(/MSC-[A-Z]+-\d+/i);
          if (match) {
            targetId = match[0].toUpperCase();
          }
        }

        if (targetId) {
          setSearchId(targetId);
          setActiveVerifyTab('id');
          handleVerify(null, 'id', targetId);
          showNotification(`Authenticated QR Code detected! ID: ${targetId}`);
        } else {
          fallbackNameMatching(file);
        }
      } catch (scanErr) {
        console.log("QR decode failed or QR not found, trying filename:", scanErr);
        fallbackNameMatching(file);
      } finally {
        try {
          await html5QrCode.clear();
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("File upload decoding error:", err);
      fallbackNameMatching(file);
    }
  };

  const handleCopyLink = async (cred) => {
    const verifyUrl = `${window.location.origin}?verifyId=${cred.id}`;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      showNotification("Credential verify link copied!");
      apiFetch('/api/credentials/increment-share', { method: 'POST' });
    } catch (err) {
      console.error("Copy link failed:", err);
    }
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

    const isNetConf = (cred.title || '').toLowerCase().includes('.net') || 
                      (cred.category || '').toLowerCase().includes('.net');

    if (isNetConf) {
      // Set canvas dimensions to match SVG aspect ratio (842.25 x 595.5 -> 1685 x 1191 @2x)
      canvas.width = 1685;
      canvas.height = 1191;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Load and Draw .NET Conf 2025 SVG Template background
      const svgPath = '/assets/.NET%20Conf%202025.svg';
      const templateImg = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = svgPath;
      });

      if (templateImg) {
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Erase / White-out previous sample name in template
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(canvas.width / 2 - 340, 545, 680, 85);

      // 3. Draw Student's Name cleanly over name area
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 48px Outfit, sans-serif';
      ctx.fillText(cred.recipient_name, canvas.width / 2, 595);

      // Accent line under student name
      ctx.strokeStyle = '#512bd4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 200, 615);
      ctx.lineTo(canvas.width / 2 + 200, 615);
      ctx.stroke();

      // 4. Draw Official Verification Protocol Bar & QR Code at Bottom Center
      const verifyUrl = `${window.location.origin}?verifyId=${cred.id}`;

      // Bottom Card Frame
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 12;
      ctx.fillRect(canvas.width / 2 - 320, 1040, 640, 95);
      ctx.shadowColor = 'transparent';

      ctx.strokeStyle = '#512bd4';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width / 2 - 320, 1040, 640, 95);

      // Left Info inside Verification Bar
      ctx.textAlign = 'left';
      ctx.fillStyle = '#512bd4';
      ctx.font = '800 13px Outfit, sans-serif';
      ctx.fillText('OFFICIAL VERIFICATION PROTOCOL', canvas.width / 2 - 300, 1068);

      ctx.fillStyle = '#1e293b';
      ctx.font = '700 12px Outfit, sans-serif';
      ctx.fillText(`Verification Portal: ${verifyUrl}`, canvas.width / 2 - 300, 1092);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px Manrope, sans-serif';
      ctx.fillText(`Credential ID: ${cred.id}`, canvas.width / 2 - 300, 1115);

      // QR Code on right side of Verification Bar
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
      try {
        const qrImg = await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = qrCodeUrl;
        });

        if (qrImg) {
          ctx.drawImage(qrImg, canvas.width / 2 + 225, 1050, 75, 75);
        }
      } catch (qrErr) {
        console.warn('Could not render QR code on canvas:', qrErr);
      }
    } else {
      // Standard Certificate Exporter for non-.NET events
      canvas.width = 1600;
      canvas.height = 1100;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 20;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

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
      ctx.fillText('for successful completion of the program', canvas.width / 2, 510);

      ctx.fillStyle = '#2563eb';
      ctx.font = '800 36px Outfit, sans-serif';
      ctx.fillText(cred.title, canvas.width / 2, 570);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 14px Manrope, sans-serif';
      ctx.fillText(cred.description || '', canvas.width / 2, 620);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 16px Manrope, sans-serif';
      ctx.fillText(`Issued: ${cred.issue_date}`, 120, 730);
      ctx.font = '500 13px Manrope, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Credential ID: ${cred.id}`, 120, 760);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'italic 700 18px Georgia, serif';
      ctx.fillText('Club President', canvas.width - 120, 730);
      ctx.font = '500 13px Manrope, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Microsoft Student Club Chapter', canvas.width - 120, 760);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 730, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 12px Outfit, sans-serif';
      ctx.fillText('VERIFIED', canvas.width / 2, 725);
      ctx.font = '700 9px Outfit, sans-serif';
      ctx.fillText('MSC SECURITY', canvas.width / 2, 742);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 810);
      ctx.lineTo(canvas.width - 100, 810);
      ctx.stroke();

      const verifyUrl = `${window.location.origin}?verifyId=${cred.id}`;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#2563eb';
      ctx.font = '800 12px Outfit, sans-serif';
      ctx.fillText('OFFICIAL VERIFICATION PROTOCOL', 120, 850);
      ctx.font = '500 14px Manrope, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('This achievement is cryptographically logged and registered in the Microsoft Student Club PRPCEM Registry.', 120, 880);
      ctx.fillText('Scan the QR code or visit the verification portal below to check full-scope authenticity metadata.', 120, 905);
      ctx.fillStyle = '#1e3a8a';
      ctx.font = '700 14px Outfit, sans-serif';
      ctx.fillText(`Verification Portal: ${verifyUrl}`, 120, 940);

      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
      try {
        const qrImg = await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = qrCodeUrl;
        });

        if (qrImg) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(canvas.width - 240, 830, 120, 120);
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(canvas.width - 240, 830, 120, 120);
          ctx.drawImage(qrImg, canvas.width - 235, 835, 110, 110);
        }
      } catch (qrErr) {
        console.warn('Could not render QR code on certificate canvas:', qrErr);
      }
    }

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${cred.title.replace(/\s+/g, '_')}_${cred.id}.png`;
    link.href = dataURL;
    link.click();

    apiFetch('/api/credentials/increment-download', { method: 'POST' });
    showNotification('Downloaded certificate successfully!');
  };

  const faqs = [
    {
      q: "How do I verify a Microsoft Student Club credential?",
      a: "Enter the unique Credential ID or search by the student's full name in the verification form on our homepage. The system will instantly pull up the authentic achievement record from our secure registry."
    },
    {
      q: "How can I add my earned certificates and badges to LinkedIn?",
      a: "Simply log in to your Student Portal, go to 'My Credentials', click the 'Share' button, and choose 'Add to LinkedIn'. This auto-fills the verification link, credential ID, and MSC PRPCEM organization details directly on your profile."
    },
    {
      q: "Can anyone find my student profile?",
      a: "Only if you toggle 'Public Profile Visibility' to active in your Account Settings. If disabled, your profile remains secure and hidden from public search engines, and your credentials can only be verified by someone holding your direct Credential ID."
    },
    {
      q: "How are certificates and badges automatically issued?",
      a: "Whenever you complete a Microsoft Student Club workshop, participate in our weekly quizzes, or contribute as a mentor, the Club Administration publishes the official event results. Our system automatically processes your score rules, issues your certified badges, and sends an automatic email notification directly to your mailbox."
    }
  ];

  return (
    <div className="app-container">
      {/* Header bar */}
      <header className="navbar">
        <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); navigateTo('home'); setVerifyResult(null); }}>
          <img src="/assets/MSC_logo.png" className="nav-logo" alt="Logo" />
          <div className="brand-text">
            <span className="brand-title">Microsoft Student Club</span>
            <span className="brand-sub">
              PRPCEM
              {user && user.role === 'admin' && (
                <span style={{ background: '#2563eb', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '6px' }}>
                  <i className="fa-solid fa-user-shield" style={{ fontSize: '8px' }}></i> Admin
                </span>
              )}
            </span>
          </div>
        </a>

        {/* Navigation links */}
        <nav className="nav-links">
          <a href="/" className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home'); setVerifyResult(null); }}>Home</a>
          <a href="/catalog" className={`nav-link ${currentView === 'catalog' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('catalog'); setVerifyResult(null); }}>Badge Directory</a>
          {user && (
            <>
              <a href="/dashboard" className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('dashboard'); fetchMyWallet(); }}>Portal</a>
              <a href="/my-credentials" className={`nav-link ${currentView === 'my-credentials' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('my-credentials'); fetchMyWallet(); }}>My Credentials</a>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* User profile dropdown */}
              <div 
                className="navbar-profile-wrapper"
                onClick={() => navigateTo('settings')}
                style={{ cursor: 'pointer' }}
              >
                <div className="profile-photo-circle" style={{ width: '28px', height: '28px', fontSize: '11px', margin: 0, border: '1px solid #cbd5e1', background: '#eff6ff', color: '#2563eb', fontWeight: 800 }}>
                  {user.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div className="profile-name-details" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.15' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {user.name || 'Student'}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {user.role === 'admin' ? 'Control Panel' : 'Settings'}
                  </span>
                </div>
              </div>

              <button 
                className="signin-btn" 
                onClick={triggerLogout}
                title="Sign Out" 
                style={{ background: '#f1f5f9', color: 'var(--text-muted)', boxShadow: 'none', padding: '5px 10px', fontSize: '12px', borderRadius: '8px' }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          ) : (
            <>
              <button className="help-btn" onClick={() => showNotification("Verify achievements or sign in to open your digital wallet.")}>
                <i className="fa-regular fa-circle-question"></i>
              </button>
              <button className="signin-btn" onClick={() => navigateTo('auth', '/login')}>
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
                <a href="/" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('home'); setMobileMenuOpen(false); }}>Home</a>
                <a href="/catalog" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('catalog'); setMobileMenuOpen(false); }}>Badge Directory</a>
                
                {user && (
                  <>
                    <a href="/dashboard" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('dashboard'); setMobileMenuOpen(false); }}>Portal Dashboard</a>
                    <a href="/my-credentials" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('my-credentials'); setMobileMenuOpen(false); }}>My Credentials</a>
                    <a href="/profile" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('profile'); setMobileMenuOpen(false); }}>My Public Profile</a>
                    <a href="/settings" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('settings'); setMobileMenuOpen(false); }}>Settings</a>
                  </>
                )}

                {user && user.role === 'admin' && (
                  <a href="/admin" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('admin'); setMobileMenuOpen(false); }}>Admin Panel</a>
                )}

                {user ? (
                  <button className="signin-btn" onClick={() => { triggerLogout(); setMobileMenuOpen(false); }} style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
                    Sign Out
                  </button>
                ) : (
                  <button className="signin-btn" onClick={() => { navigateTo('auth', '/login'); setMobileMenuOpen(false); }} style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
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
        
        {/* Authenticated dashboard pages wrap around Left Sidebar layout */}
        {user && ['dashboard', 'my-credentials', 'profile', 'settings', 'admin', 'activity'].includes(currentView) ? (
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
                      onClick={() => { navigateTo('dashboard'); fetchMyWallet(); }}
                    >
                      <i className="fa-solid fa-circle-chevron-left"></i> Student Panel
                    </li>
                  </>
                ) : (
                  <>
                    <li 
                      className={`sidebar-menu-item ${currentView === 'dashboard' ? 'active' : ''}`} 
                      onClick={() => { navigateTo('dashboard'); fetchMyWallet(); }}
                    >
                      <i className="fa-solid fa-house"></i> Dashboard
                    </li>
                    <li 
                      className={`sidebar-menu-item ${currentView === 'my-credentials' ? 'active' : ''}`} 
                      onClick={() => { navigateTo('my-credentials'); fetchMyWallet(); }}
                    >
                      <i className="fa-solid fa-file-contract"></i> My Credentials
                    </li>
                    <li 
                      className={`sidebar-menu-item ${currentView === 'activity' ? 'active' : ''}`} 
                      onClick={() => navigateTo('activity')}
                    >
                      <i className="fa-solid fa-clock-rotate-left"></i> Activity Timeline
                    </li>
                    {user.role !== 'admin' && (
                      <li 
                        className={`sidebar-menu-item ${currentView === 'profile' ? 'active' : ''}`} 
                        onClick={() => navigateTo('profile')}
                      >
                        <i className="fa-solid fa-user-check"></i> Public Profile
                      </li>
                    )}
                    <li 
                      className={`sidebar-menu-item ${currentView === 'settings' ? 'active' : ''}`} 
                      onClick={() => navigateTo('settings')}
                    >
                      <i className="fa-solid fa-sliders"></i> Account Settings
                    </li>
                    {user.role === 'admin' && (
                      <li 
                        className={`sidebar-menu-item ${currentView === 'admin' ? 'active' : ''}`} 
                        onClick={() => navigateTo('admin')}
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
                  {user.role !== 'admin' && (
                    <div className="sidebar-profile-promo-card">
                      <h5>Showcase Profile</h5>
                      <p>Share your credentials and portfolio with a public page.</p>
                      <button className="public-profile-anchor" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigateTo('profile')}>
                        View Public Profile
                      </button>
                    </div>
                  )}

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
              {currentView === 'dashboard' && (
                <StudentDashboard
                  user={user}
                  credentials={credentials}
                  onSelectCredential={(c) => { setSelectedCred(c); navigateTo('credential-detail'); }}
                  onDownload={handleCertificateDownload}
                  onShare={handleCopyLink}
                  onNavigateTo={(view) => navigateTo(view)}
                />
              )}

              {currentView === 'my-credentials' && (
                <MyCredentials
                  user={user}
                  credentials={credentials}
                  onSelectCredential={(c) => { setSelectedCred(c); navigateTo('credential-detail'); }}
                  onShare={handleCopyLink}
                  onDownload={handleCertificateDownload}
                  onNavigateTo={(view) => navigateTo(view)}
                  getLinkedInLink={getLinkedInLink}
                />
              )}

              {currentView === 'profile' && (
                <PublicProfile 
                  username={user.email.split('@')[0]} 
                  onShowNotification={showNotification} 
                />
              )}

              {currentView === 'activity' && (
                <ActivityFeed />
              )}

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
                  onNavigateToSubView={(subView) => {
                    setAdminSubView(subView);
                    const targetPath = subView === 'dashboard' ? '/admin' : `/admin/${subView}`;
                    if (window.location.pathname !== targetPath) {
                      window.history.pushState({}, '', targetPath);
                    }
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          /* Render public/standalone views */
          <>
            {currentView === 'auth' && (
              <Auth
                onLoginSuccess={(usr) => { 
                  setUser(usr); 
                  fetchMyWallet(); 
                  if (usr && usr.role === 'admin') {
                    navigateTo('admin', '/admin');
                  } else {
                    navigateTo('dashboard', '/dashboard');
                  }
                }}
                onViewChange={(view) => navigateTo(view)}
              />
            )}

            {currentView === 'credential-detail' && selectedCred && (
              <BadgeDetail
                credential={selectedCred}
                onBack={() => {
                  setSelectedCred(null);
                  navigateTo(user ? 'my-credentials' : 'home');
                }}
                onShare={handleCopyLink}
                onDownload={handleCertificateDownload}
                getLinkedInLink={getLinkedInLink}
              />
            )}

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
                  <button 
                    className="verify-btn" 
                    style={{ whiteSpace: 'nowrap' }} 
                    onClick={() => {
                      if (profileSearchQuery.trim()) {
                        navigateTo('public-profile', `/u/${encodeURIComponent(profileSearchQuery.trim())}`);
                      }
                    }}
                  >
                    Search
                  </button>
                </div>
                <PublicProfile username={profileSearchQuery} onShowNotification={showNotification} />
              </div>
            )}

            {currentView === 'catalog' && (
              <BadgeCatalog />
            )}

            {currentView === '404' && (
              <NotFound onNavigate={(view) => navigateTo(view)} />
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

            {/* Dynamic Platform Metrics Strip */}
            <section className="metrics-strip">
              <div className="metric-card">
                <div className="metric-icon-box">
                  <i className="fa-solid fa-certificate"></i>
                </div>
                <div className="metric-number">{platformMetrics.certificatesIssued || 24}</div>
                <div className="metric-label">Certificates Issued</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <i className="fa-solid fa-award"></i>
                </div>
                <div className="metric-number">{platformMetrics.badgesIssued || 18}</div>
                <div className="metric-label">Badges Awarded</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div className="metric-number">{platformMetrics.studentsCount || 12}</div>
                <div className="metric-label">Students Registered</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div className="metric-number">{platformMetrics.verifiedToday || 0}</div>
                <div className="metric-label">Verified Today</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <i className="fa-solid fa-download"></i>
                </div>
                <div className="metric-number">{platformMetrics.downloadsToday || 0}</div>
                <div className="metric-label">Downloads Today</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <i className="fa-brands fa-linkedin-in"></i>
                </div>
                <div className="metric-number">{platformMetrics.linkedinShares || 0}</div>
                <div className="metric-label">LinkedIn Shares</div>
              </div>
            </section>

            {/* Interactive Tab verification card */}
            <section className="verify-container">
              <div className="verify-card">
                <div className="verify-card-header">
                  <h2>Verify a Credential</h2>
                  <p>Choose an option below to instantly verify student achievements</p>
                </div>

                <div className="verify-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                  <button className={`tab-btn ${activeVerifyTab === 'id' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('id'); setVerifyResult(null); stopCameraScan(); }}>
                    <i className="fa-solid fa-hashtag"></i> Credential ID
                  </button>
                  <button className={`tab-btn ${activeVerifyTab === 'name' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('name'); setVerifyResult(null); stopCameraScan(); }}>
                    <i className="fa-solid fa-user"></i> Student Name
                  </button>
                  <button className={`tab-btn ${activeVerifyTab === 'qr' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('qr'); setVerifyResult(null); startCameraScan(); }}>
                    <i className="fa-solid fa-qrcode"></i> QR Scan
                  </button>
                  <button className={`tab-btn ${activeVerifyTab === 'upload' ? 'active' : ''}`} onClick={() => { setActiveVerifyTab('upload'); setVerifyResult(null); stopCameraScan(); }}>
                    <i className="fa-solid fa-upload"></i> Upload PNG
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
                      <button type="submit" className="verify-btn">Verify Credential</button>
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
                          <option value="event">Event Completion</option>
                          <option value="team">Club Team Member</option>
                        </select>

                        {nameType === 'event' ? (
                          <>
                            <select 
                              className="verify-input" 
                              style={{ paddingLeft: '16px', margin: 0 }} 
                              value={searchYear} 
                              onChange={(e) => {
                                const yr = e.target.value;
                                setSearchYear(yr);
                                setSearchEvent('');
                                setVerifyResult(null);
                              }}
                            >
                              <option value="">Select Year</option>
                              <option value="2026">2026</option>
                              <option value="2025">2025</option>
                              <option value="2024">2024</option>
                            </select>
                            <select 
                              className="verify-input" 
                              style={{ paddingLeft: '16px', margin: 0 }} 
                              value={searchEvent} 
                              onChange={(e) => {
                                setSearchEvent(e.target.value);
                                setVerifyResult(null);
                              }}
                            >
                              <option value="">Select Event</option>
                              {((searchYear && (dbEventsByYear?.[searchYear] || EVENTS_BY_YEAR?.[searchYear])) 
                                ? (dbEventsByYear[searchYear] || EVENTS_BY_YEAR[searchYear])
                                : [
                                    'Copilot Dev Days',
                                    'GitLit — The Diwali Code Fest',
                                    '.NET Conf 2025 Amravati',
                                    'Microsoft Azure Cloud Specialist Workshop',
                                    'AI & LLM Integration Bootcamp'
                                  ]
                              ).map((evt) => (
                                <option key={evt} value={evt}>{evt}</option>
                              ))}
                            </select>
                          </>
                        ) : (
                          <select 
                            className="verify-input" 
                            style={{ paddingLeft: '16px', margin: 0 }} 
                            value={searchTeamYear} 
                            onChange={(e) => {
                              setSearchTeamYear(e.target.value);
                              setVerifyResult(null);
                            }}
                          >
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
                            placeholder="Enter Student's Full Name..."
                            value={searchName}
                            onChange={(e) => handleNameInput(e.target.value)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onFocus={() => setShowSuggestions(true)}
                          />
                        </div>
                        <button type="submit" className="verify-btn">Verify Credential</button>
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
                  <div className="result-container" style={{ marginTop: '30px' }}>
                    {verifyResult.success ? (
                      verifyResult.records ? (
                        <div>
                          <div className="success-result-card" style={{ marginBottom: '12px' }}>
                            <div className="success-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                            <div className="result-details">
                              <div className="result-status-title">Records Found</div>
                              <div className="result-message-text">Multiple achievements issued to student name.</div>
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
                        /* Comprehensive Verified Credential Display matching exact requested layout */
                        <div 
                          className="admin-card" 
                          style={{ 
                            background: 'white', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '16px', 
                            padding: '30px', 
                            textAlign: 'left',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                          }}
                        >
                          {/* Success Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ecfdf5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #10b981' }}>
                            <i className="fa-solid fa-circle-check" style={{ fontSize: '18px', color: '#10b981' }}></i>
                            <div>
                              <strong style={{ fontSize: '14px', display: 'block' }}>Authentic Record Verified</strong>
                              <span style={{ fontSize: '12px', opacity: 0.9 }}>This credential matches the official Microsoft Student Club PRPCEM secure registry.</span>
                            </div>
                          </div>

                          {/* Grid with preview and details */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                            
                             {/* Left Panel: Credential Preview Card Frame */}
                             {(verifyResult.record.title || '').toLowerCase().includes('.net') ? (
                               <div 
                                 className="cert-mockup" 
                                 style={{ 
                                   padding: '0', 
                                   overflow: 'hidden', 
                                   position: 'relative', 
                                   borderRadius: '12px', 
                                   boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                                 }}
                               >
                                 <img 
                                   src="/assets/.NET%20Conf%202025.svg" 
                                   alt=".NET Conf 2025 Certificate Template" 
                                   style={{ width: '100%', height: 'auto', display: 'block' }}
                                 />

                                 {/* Cover previous sample name in template */}
                                 <div 
                                   style={{
                                     position: 'absolute',
                                     top: '49.5%',
                                     left: '50%',
                                     transform: 'translate(-50%, -50%)',
                                     width: '60%',
                                     height: '13%',
                                     background: '#ffffff',
                                     zIndex: 1
                                   }}
                                 />

                                 {/* Overlaid Recipient Name */}
                                 <div 
                                   style={{
                                     position: 'absolute',
                                     top: '49.5%',
                                     left: '50%',
                                     transform: 'translate(-50%, -50%)',
                                     width: '80%',
                                     textAlign: 'center',
                                     fontWeight: 800,
                                     fontSize: 'clamp(14px, 2.5vw, 22px)',
                                     color: '#0f172a',
                                     fontFamily: 'Outfit, sans-serif',
                                     zIndex: 2
                                   }}
                                 >
                                   {verifyResult.record.recipient_name}
                                 </div>

                                 {/* Bottom Verification Protocol Bar */}
                                 <div
                                   style={{
                                     position: 'absolute',
                                     bottom: '2.5%',
                                     left: '50%',
                                     transform: 'translateX(-50%)',
                                     width: '92%',
                                     background: '#ffffff',
                                     border: '1px solid #512bd4',
                                     borderRadius: '8px',
                                     padding: '6px 12px',
                                     display: 'flex',
                                     alignItems: 'center',
                                     justify: 'space-between',
                                     boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                     zIndex: 2
                                   }}
                                 >
                                   <div style={{ textAlign: 'left' }}>
                                     <div style={{ fontSize: '9px', fontWeight: 800, color: '#512bd4', letterSpacing: '0.5px' }}>OFFICIAL VERIFICATION PROTOCOL</div>
                                     <div style={{ fontSize: '9px', fontWeight: 600, color: '#1e293b' }}>
                                       {window.location.origin}?verifyId={verifyResult.record.id}
                                     </div>
                                   </div>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                     <img
                                       src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '?verifyId=' + verifyResult.record.id)}`}
                                       alt="QR Code"
                                       style={{ width: '38px', height: '38px', borderRadius: '4px' }}
                                     />
                                   </div>
                                 </div>
                               </div>
                             ) : (
                               <div 
                                 className="cert-mockup" 
                                 style={{ 
                                   height: 'auto', 
                                   margin: 0, 
                                   background: '#fafbfc', 
                                   border: '3px double #e2e8f0', 
                                   padding: '24px 16px',
                                   display: 'flex',
                                   flexDirection: 'column',
                                   justify: 'space-between',
                                   gap: '16px',
                                   position: 'relative'
                                 }}
                               >
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <img src="/assets/MSC_logo.png" style={{ height: '24px' }} alt="MSC Logo" />
                                   <span style={{ fontSize: '9px', fontWeight: 800, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                     {verifyResult.record.type}
                                   </span>
                                 </div>

                                 <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                   <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', margin: '0 0 6px 0' }}>Verified Achievement</h4>
                                   <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>{verifyResult.record.recipient_name}</h3>
                                   <p style={{ fontSize: '12px', color: '#475569', margin: '0 auto 12px', maxWidth: '240px', lineHeight: 1.4 }}>
                                     Successfully completed the certified club program
                                   </p>
                                   <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2563eb', margin: 0 }}>{verifyResult.record.title}</h3>
                                 </div>

                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '10px', color: '#64748b' }}>
                                   <span>ID: <strong style={{ fontFamily: 'monospace' }}>{verifyResult.record.id}</strong></span>
                                   <span>MSC Security</span>
                                 </div>
                               </div>
                             )}

                            {/* Right Panel: Requested Fields, QR Code, Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              
                              {/* Metadata table */}
                              <div className="detail-meta-table" style={{ margin: 0, maxWidth: '100%' }}>
                                <div className="detail-meta-row">
                                  <span className="label">Student Name</span>
                                  <span className="val" style={{ fontWeight: 800, color: '#0f172a' }}>{verifyResult.record.recipient_name}</span>
                                </div>
                                <div className="detail-meta-row">
                                  <span className="label">Credential Title</span>
                                  <span className="val" style={{ fontWeight: 800, color: '#2563eb' }}>{verifyResult.record.title}</span>
                                </div>
                                <div className="detail-meta-row">
                                  <span className="label">Credential Type</span>
                                  <span className="val" style={{ textTransform: 'capitalize' }}>{verifyResult.record.type}</span>
                                </div>
                                <div className="detail-meta-row">
                                  <span className="label">Credential ID</span>
                                  <span className="val" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{verifyResult.record.id}</span>
                                </div>
                                <div className="detail-meta-row">
                                  <span className="label">Issue Date</span>
                                  <span className="val">{verifyResult.record.issue_date}</span>
                                </div>
                                <div className="detail-meta-row">
                                  <span className="label">Issued By</span>
                                  <span className="val">Microsoft Student Club PRPCEM</span>
                                </div>
                                <div className="detail-meta-row">
                                  <span className="label">Verification Status</span>
                                  <span className="val" style={{ color: '#10b981', fontWeight: 800 }}>
                                    <i className="fa-solid fa-circle-check"></i> Active / Authentic
                                  </span>
                                </div>
                              </div>

                              {/* Vector QR Code Section & Action Row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                
                                {/* Real Dynamic QR Code */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                  <div style={{ padding: '6px', background: 'white', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img 
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}?verifyId=${verifyResult.record.id}`)}`}
                                      alt="Verification QR Code"
                                      style={{ width: '72px', height: '72px', display: 'block' }}
                                    />
                                  </div>
                                </div>

                                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <button 
                                    className="badge-btn primary-btn" 
                                    style={{ width: '100%', padding: '10px 0', fontSize: '12px' }}
                                    onClick={() => handleCertificateDownload(verifyResult.record)}
                                  >
                                    <i className="fa-solid fa-download"></i> Download Official Certificate
                                  </button>
                                  <button 
                                    className="badge-btn" 
                                    style={{ width: '100%', padding: '10px 0', fontSize: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', color: 'var(--text-main)' }}
                                    onClick={() => handleCopyLink(verifyResult.record)}
                                  >
                                    <i className="fa-solid fa-share-nodes"></i> Share Verification Link
                                  </button>
                                </div>

                              </div>

                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="error-result-card">
                        <div className="error-icon-box"><i className="fa-solid fa-circle-exclamation"></i></div>
                        <div>
                          <div className="error-status-title">Details Not Found</div>
                          <div className="error-message-text">
                            {verifyResult.message || "❌ Record not found in our secure registry. Ensure Name, Event Name, and Year are entered properly."}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* How It Works Section */}
            <section className="wallet-wrapper" style={{ margin: '40px auto 10px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>How It Works</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>The seamless flow from learning to verified industrial credentials</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                
                {/* Step 1 */}
                <div className="admin-card" style={{ background: 'white', padding: '24px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', margin: '0 auto 16px', fontWeight: 800 }}>1</div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Issue Achievement</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>Microsoft Student Club PRPCEM administrators record achievement details and award verified criteria.</p>
                </div>

                {/* Step 2 */}
                <div className="admin-card" style={{ background: 'white', padding: '24px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#faf5ff', color: '#7c3aed', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', margin: '0 auto 16px', fontWeight: 800 }}>2</div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Email Notification</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>Our engine immediately dispatches a simulated security email containing direct viewing and download links.</p>
                </div>

                {/* Step 3 */}
                <div className="admin-card" style={{ background: 'white', padding: '24px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', margin: '0 auto 16px', fontWeight: 800 }}>3</div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Instant Verification</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>Employers or peer reviewers enter the unique Credential ID or name to pull the active live verification record.</p>
                </div>

                {/* Step 4 */}
                <div className="admin-card" style={{ background: 'white', padding: '24px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff7ed', color: '#ea580c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', margin: '0 auto 16px', fontWeight: 800 }}>4</div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Social Showcase</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>Students add their authentic credentials to their LinkedIn profile or copy a direct, shareable public link.</p>
                </div>

              </div>
            </section>

            {/* Live Verification Timeline Feed */}
            {recentVerified.length > 0 && (
              <section className="recent-section">
                <div className="section-header">
                  <h2>Recently Verified Achievements</h2>
                  <span style={{ fontSize: '12px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '12px', fontWeight: 800 }}>
                    <i className="fa-solid fa-circle-dot fa-fade" style={{ color: '#10b981', marginRight: '6px' }}></i> LIVE REGISTRY FEED
                  </span>
                </div>
                <div className="recent-grid">
                  {recentVerified.slice(0, 5).map((cred) => (
                    <div 
                      key={cred.id} 
                      className="recent-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSearchId(cred.id);
                        setActiveVerifyTab('id');
                        // Scroll up to verification card
                        document.querySelector('.verify-container')?.scrollIntoView({ behavior: 'smooth' });
                        handleVerify(null, 'id', cred.id);
                        showNotification(`Verifying ${cred.recipient_name}'s credential...`);
                      }}
                    >
                      <span className={`badge-tag ${cred.type}`}>
                        {cred.type}
                      </span>
                      <h4 className="recent-title">{cred.title}</h4>
                      <p className="recent-recipient">to {cred.recipient_name}</p>
                      <div className="recent-footer">
                        <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>
                        <span>ID: {cred.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ Section */}
            <section className="wallet-wrapper" style={{ margin: '50px auto 20px', maxWidth: '720px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>Frequently Asked Questions</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Everything you need to know about our credential architecture</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqs.map((faq, index) => {
                  const isOpen = faqOpenIndex === index;
                  return (
                    <div 
                      key={index} 
                      className="admin-card" 
                      style={{ 
                        background: 'white', 
                        padding: '16px 24px', 
                        cursor: 'pointer', 
                        textAlign: 'left',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px'
                      }}
                      onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {faq.q}
                        </h4>
                        <i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'}`} style={{ fontSize: '12px', color: 'var(--text-muted)' }}></i>
                      </div>
                      
                      {isOpen && (
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.5, borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
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
              <li><a href="/" onClick={(e) => { e.preventDefault(); navigateTo('home'); setVerifyResult(null); }}>Verify Credential</a></li>
              <li><a href="/" onClick={(e) => { e.preventDefault(); navigateTo('home'); setActiveVerifyTab('name'); }}>Explore Credentials</a></li>
              <li><a href={user ? "/dashboard" : "/login"} onClick={(e) => { e.preventDefault(); navigateTo(user ? 'dashboard' : 'auth', user ? '/dashboard' : '/login'); }}>Public Profiles</a></li>
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon-wrapper">
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </div>
            <h3 className="logout-modal-title">Confirm Sign Out</h3>
            <p className="logout-modal-text">
              Are you sure you want to log out? You will need to sign in again to access your digital credentials wallet and student dashboard.
            </p>
            <div className="logout-modal-actions">
              <button 
                className="logout-modal-btn cancel" 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button 
                className="logout-modal-btn confirm" 
                onClick={confirmLogout}
              >
                <i className="fa-solid fa-right-from-bracket"></i> Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden QR Reader for uploaded certificate scanning */}
      <div id="hidden-qr-reader" style={{ display: 'none' }}></div>
      {/* Offscreen Canvas Certificate Exporter frame */}
      <canvas ref={canvasRef} width="1600" height="1100" className="canvas-offscreen"></canvas>
    </div>
  );
}
