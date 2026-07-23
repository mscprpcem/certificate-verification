import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../config/api';

export default function BadgeCatalog() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [activeModalBadge, setActiveModalBadge] = useState(null);

  // Default fallback badges if backend fetch fails or table is initializing
  const fallbackBadges = [
    {
      id: 1,
      badge_code: "MSC-BDG-QM",
      title: "Quiz Master Badge",
      organization: "Microsoft Student Club PRPCEM",
      release_date: "Jul 2026",
      category: "Programming & Logic",
      level: "Intermediate",
      icon: "fa-trophy",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      bg_light: "#ecfdf5",
      accent_color: "#059669",
      description: "Mastery of data structures, core algorithms, and rapid technical problem-solving challenges.",
      criteria: "Score 90% or higher in any weekly programming quiz hosted by MSC PRPCEM.",
      skills_list: "Data Structures, Algorithms, Python/C++, Competitive Coding",
      earners_count: 48,
      issuance_frequency: "Weekly"
    },
    {
      id: 2,
      badge_code: "MSC-BDG-AZ",
      title: "Microsoft Azure Specialist",
      organization: "Microsoft Student Club PRPCEM",
      release_date: "Jul 2026",
      category: "Cloud Infrastructure",
      level: "Advanced",
      icon: "fa-cloud",
      gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      bg_light: "#eff6ff",
      accent_color: "#2563eb",
      description: "Hands-on expertise in Microsoft Azure cloud resource deployment, virtual networks, and cloud architecture.",
      criteria: "Complete all hands-on deployment labs in the Azure Cloud Workshop and pass the practical exam.",
      skills_list: "Azure Portal, Virtual Machines, Cloud Security, App Services",
      earners_count: 34,
      issuance_frequency: "Per Event"
    },
    {
      id: 3,
      badge_code: "MSC-BDG-AI",
      title: "AI Workshop Specialist",
      organization: "Microsoft Student Club PRPCEM",
      release_date: "Jul 2026",
      category: "Artificial Intelligence",
      level: "Advanced",
      icon: "fa-brain",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      bg_light: "#f5f3ff",
      accent_color: "#7c3aed",
      description: "Practical implementation of machine learning models, OpenAI APIs, and generative AI workflow integration.",
      criteria: "Attend the hands-on AI Workshop, build an interactive prototype, and submit a verified working project.",
      skills_list: "Generative AI, LLM APIs, Python AI, Prompt Engineering",
      earners_count: 29,
      issuance_frequency: "Per Event"
    },
    {
      id: 4,
      badge_code: "MSC-BDG-CE",
      title: "Cloud Explorer Badge",
      organization: "Microsoft Student Club PRPCEM",
      release_date: "Jun 2026",
      category: "Cloud Infrastructure",
      level: "Foundational",
      icon: "fa-cloud-meatball",
      gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
      bg_light: "#f0f9ff",
      accent_color: "#0284c7",
      description: "Fundamental concepts of cloud computing, storage accounts, serverless functions, and basic Azure operations.",
      criteria: "Complete the introductory cloud orientation and lab submission module.",
      skills_list: "Cloud Basics, Blob Storage, Azure CLI, Git Basics",
      earners_count: 62,
      issuance_frequency: "Monthly"
    },
    {
      id: 5,
      badge_code: "MSC-BDG-CTL",
      title: "MSC Core Team Lead",
      organization: "Microsoft Student Club PRPCEM",
      release_date: "May 2026",
      category: "Leadership & Management",
      level: "Officer",
      icon: "fa-shield-halved",
      gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      bg_light: "#fffbeb",
      accent_color: "#d97706",
      description: "Leadership, event management, and chapter operational governance of Microsoft Student Club PRPCEM.",
      criteria: "Appointed as an official executive officer or core lead for a full academic tenure.",
      skills_list: "Leadership, Project Planning, Team Governance, Public Relations",
      earners_count: 12,
      issuance_frequency: "Annual"
    },
    {
      id: 6,
      badge_code: "MSC-BDG-VA",
      title: "Volunteer Advocate",
      organization: "Microsoft Student Club PRPCEM",
      release_date: "Apr 2026",
      category: "Community & Mentorship",
      level: "Foundational",
      icon: "fa-handshake-angle",
      gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      bg_light: "#fdf2f8",
      accent_color: "#db2777",
      description: "Operational support, logistics coordination, and student onboarding during official MSC workshops and hackathons.",
      criteria: "Serve actively as a volunteer organizer in at least 3 official chapter events.",
      skills_list: "Event Operations, Peer Support, Logistics, Community Building",
      earners_count: 45,
      issuance_frequency: "Semester"
    },
    {
      id: 7,
      badge_code: "MSC-BDG-CS",
      title: "Community Speaker",
      organization: "Microsoft Student Club PRPCEM",
      release_date: "Mar 2026",
      category: "Community & Mentorship",
      level: "Intermediate",
      icon: "fa-microphone",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
      bg_light: "#ecfeff",
      accent_color: "#0891b2",
      description: "Delivery of technical presentations, tech talks, or peer tutoring sessions at student chapter meetups.",
      criteria: "Lead a tech talk, workshop session, or seminar at an official MSC PRPCEM event.",
      skills_list: "Public Speaking, Technical Teaching, Presentation, Mentorship",
      earners_count: 19,
      issuance_frequency: "Per Event"
    },
    {
      id: 8,
      badge_code: "MSC-BDG-DV",
      title: "DevOps & Version Control Champion",
      organization: "Microsoft Student Club PRPCEM",
      release_date: "Feb 2026",
      category: "Programming & Logic",
      level: "Intermediate",
      icon: "fa-code-branch",
      gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
      bg_light: "#eef2ff",
      accent_color: "#4f46e5",
      description: "Mastery of Git workflows, GitHub Actions CI/CD automation, pull requests, and collaborative repository management.",
      criteria: "Complete the GitHub DevOps bootcamp and configure a working CI/CD workflow pipeline.",
      skills_list: "Git & GitHub, CI/CD Pipelines, Code Review, DevOps",
      earners_count: 31,
      issuance_frequency: "Per Event"
    }
  ];

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await apiFetch('/api/credentials/badge-catalog');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBadges(data);
        } else {
          setBadges(fallbackBadges);
        }
      } else {
        setBadges(fallbackBadges);
      }
    } catch (err) {
      console.error("Failed to load badge catalog:", err);
      setBadges(fallbackBadges);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Programming & Logic", "Cloud Infrastructure", "Artificial Intelligence", "Leadership & Management", "Community & Mentorship"];
  const levels = ["All", "Foundational", "Intermediate", "Advanced", "Officer"];

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      const titleStr = badge.title || '';
      const descStr = badge.description || '';
      const critStr = badge.criteria || '';
      const skillsStr = typeof badge.skills_list === 'string' ? badge.skills_list : (badge.skills ? badge.skills.join(', ') : '');

      const matchesSearch = searchQuery === '' || 
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        descStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        critStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skillsStr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || badge.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || badge.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [badges, searchQuery, selectedCategory, selectedLevel]);

  return (
    <div className="wallet-wrapper" style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 16px' }}>
      
      {/* Search and Filters Control Bar */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Search Input Box */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '260px', maxWidth: '420px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}></i>
            <input 
              type="text"
              placeholder="Search badges by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Level Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Level:</span>
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--text-main)',
                background: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {levels.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0' }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: isActive ? 800 : 600,
                  border: isActive ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                  background: isActive ? 'var(--primary)' : '#f8fafc',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', padding: '0 4px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
          Showing <span style={{ color: 'var(--text-main)', fontWeight: 900 }}>{filteredBadges.length}</span> badges
        </div>
        {(searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All') && (
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedLevel('All'); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ULTRA CLEAN MINIMAL BADGE CARDS GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--primary)' }}></i>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>Loading badge directory...</p>
        </div>
      ) : filteredBadges.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
          {filteredBadges.map((badge) => {
            const org = badge.organization || "Microsoft Student Club PRPCEM";
            const relDate = badge.release_date || badge.issue_date || "Sep 17, 2025";
            const earners = badge.earners_count !== undefined ? badge.earners_count : (badge.earnersCount || 0);
            const iconName = badge.icon || badge.badge_icon || "fa-award";
            const bgGrad = badge.gradient || "linear-gradient(135deg, #0284c7 0%, #005696 100%)";
            const accent = badge.accent_color || "#2563eb";
            const badgeImg = badge.image_url || badge.image || badge.badge_image;

            return (
              <div 
                key={badge.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'white',
                  border: '1px solid #d0d7de',
                  borderRadius: '22px',
                  padding: '28px 24px 24px',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  cursor: 'pointer',
                  minHeight: '340px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(37, 99, 235, 0.12)';
                  e.currentTarget.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.04)';
                  e.currentTarget.style.borderColor = '#d0d7de';
                }}
                onClick={() => setActiveModalBadge(badge)}
              >
                {/* Earners Count Tag Top Right */}
                <span 
                  style={{ 
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: '#2563eb',
                    background: '#eff6ff',
                    padding: '3px 10px',
                    borderRadius: '20px'
                  }}
                >
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', fontSize: '10px' }}></i>
                  {earners} Earners
                </span>

                {/* Badge Shield Image Area (Centered at Top) */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '12px', marginBottom: '24px', width: '100%', minHeight: '130px' }}>
                  {badgeImg ? (
                    <img 
                      src={badgeImg} 
                      alt={badge.title} 
                      style={{ width: '130px', height: '130px', objectFit: 'contain', filter: 'drop-shadow(0 6px 16px rgba(37, 99, 235, 0.2))' }} 
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '24px', 
                        background: bgGrad, 
                        color: 'white', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        fontSize: '46px',
                        boxShadow: `0 10px 25px ${accent}40`,
                        position: 'relative'
                      }}
                    >
                      <i className={`fa-solid ${iconName}`}></i>
                    </div>
                  )}
                </div>

                {/* 1. Badge Name (Title) - Left Aligned */}
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '6px', lineHeight: 1.3, textAlign: 'left', fontFamily: 'Outfit, sans-serif' }}>
                  {badge.title}
                </h3>

                {/* 2. Badge Issuer Sub-line - Blue Text Left Aligned */}
                <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: 600, textAlign: 'left', marginBottom: '16px' }}>
                  {org}
                </div>

                {/* 3. Issued Date Line - Left Aligned */}
                <div style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 500, textAlign: 'left', marginTop: 'auto' }}>
                  Issued {relDate.startsWith('Released:') ? relDate.replace('Released:', '').trim() : relDate}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div style={{ background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', padding: '48px 24px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '22px', margin: '0 auto 16px' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>No Badges Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 20px' }}>
            We couldn't find any active badges matching your search query or selected filters.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedLevel('All'); }}
            style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* FULL DETAILS MODAL - DISPLAYED ON CLICK */}
      {activeModalBadge && (
        <div 
          className="modal-overlay" 
          onClick={() => setActiveModalBadge(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              animation: 'fadeIn 200ms ease-out'
            }}
          >
            <button 
              onClick={() => setActiveModalBadge(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div 
                style={{ 
                  background: activeModalBadge.gradient || "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: 'white',
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '30px',
                  margin: '0 auto 16px',
                  boxShadow: `0 10px 24px -6px ${activeModalBadge.accent_color || '#2563eb'}88`
                }}
              >
                <i className={`fa-solid ${activeModalBadge.icon || activeModalBadge.badge_icon || 'fa-award'}`}></i>
              </div>

              <span style={{ fontSize: '11px', fontWeight: 800, color: activeModalBadge.accent_color || '#2563eb', textTransform: 'uppercase', background: activeModalBadge.bg_light || '#eff6ff', padding: '4px 12px', borderRadius: '20px' }}>
                {activeModalBadge.category} • {activeModalBadge.level || 'Intermediate'} Level
              </span>

              <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', marginTop: '10px', marginBottom: '6px' }}>
                {activeModalBadge.title}
              </h2>
              
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '6px' }}>
                <span><i className="fa-solid fa-building-columns" style={{ marginRight: '4px' }}></i> {activeModalBadge.organization || "Microsoft Student Club PRPCEM"}</span>
                <span><i className="fa-solid fa-users" style={{ marginRight: '4px', color: '#2563eb' }}></i> {activeModalBadge.earners_count !== undefined ? activeModalBadge.earners_count : activeModalBadge.earnersCount} Earners</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {/* Description */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Badge Description
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {activeModalBadge.description || "Official achievement badge issued by Microsoft Student Club PRPCEM."}
                </p>
              </div>

              {/* Eligibility Criteria */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fa-solid fa-circle-check"></i> Eligibility & Earning Criteria
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                  {activeModalBadge.criteria || "Complete the associated workshop or event requirements."}
                </p>
              </div>

              {/* Evaluated Skills */}
              {(activeModalBadge.skills_list || activeModalBadge.skills) && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Evaluated Skills & Competencies
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(typeof activeModalBadge.skills_list === 'string' 
                      ? activeModalBadge.skills_list.split(',') 
                      : (activeModalBadge.skills || [])
                    ).map((s, idx) => (
                      <span key={idx} style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '11px', padding: '4px 10px', borderRadius: '6px' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Release Date & Code */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', fontWeight: 700, borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <span>Release Date: {activeModalBadge.release_date || activeModalBadge.issue_date || 'Jul 2026'}</span>
                <span>Badge ID: {activeModalBadge.badge_code || activeModalBadge.id}</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveModalBadge(null)}
              style={{ width: '100%', padding: '11px 0', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
