import React from 'react';

export default function NotFound({ onNavigate }) {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-badge">
          <span className="not-found-code">404</span>
          <i className="fa-solid fa-compass-drafting not-found-icon"></i>
        </div>

        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-description">
          Oops! The page or credential link you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        <div className="not-found-actions">
          <button 
            className="not-found-btn primary"
            onClick={() => onNavigate('home')}
          >
            <i className="fa-solid fa-house"></i> Go to Homepage
          </button>
          
          <button 
            className="not-found-btn secondary"
            onClick={() => onNavigate('catalog')}
          >
            <i className="fa-solid fa-award"></i> Explore Badge Directory
          </button>

          <button 
            className="not-found-btn outline"
            onClick={() => onNavigate('auth')}
          >
            <i className="fa-solid fa-user"></i> Student Sign In
          </button>
        </div>

        <div className="not-found-footer-info">
          <p>
            Looking to verify a student certificate or badge? <br />
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              className="not-found-link"
            >
              Use the Official MSC PRPCEM Verification Tool
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
