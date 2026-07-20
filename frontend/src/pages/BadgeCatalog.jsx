import React from 'react';

export default function BadgeCatalog() {
  const distinctBadges = [
    {
      title: "Quiz Master Badge",
      category: "Programming & Logic",
      icon: "fa-trophy",
      description: "Mastery of data structures, algorithms, and technical challenges.",
      criteria: "Score 90% or higher in any weekly programming quiz."
    },
    {
      title: "Microsoft Azure Specialist",
      category: "Cloud Infrastructure",
      icon: "fa-cloud",
      description: "Hands-on experience in Microsoft Azure cloud configurations and virtual networks.",
      criteria: "Complete all deployment labs in the Azure Cloud Workshop."
    },
    {
      title: "AI Workshop Specialist",
      category: "Artificial Intelligence",
      icon: "fa-brain",
      description: "Practical integration of machine learning models and APIs.",
      criteria: "Attend the AI Workshop and submit a working project."
    },
    {
      title: "Cloud Explorer Badge",
      category: "Cloud Computing",
      icon: "fa-cloud-meatball",
      description: "Fundamental knowledge of Azure cloud services and Git version control.",
      criteria: "Complete the introductory labs on Microsoft Azure and GitHub."
    },
    {
      title: "MSC Core Team Lead",
      category: "Leadership & Management",
      icon: "fa-shield-halved",
      description: "Leadership and management of MSC chapter operations.",
      criteria: "Appointed as a core committee officer for a full academic tenure."
    },
    {
      title: "Volunteer Advocate",
      category: "Community Contribution",
      icon: "fa-handshake-angle",
      description: "Operational support and student coordination during club events.",
      criteria: "Serve as a volunteer organizer in at least 3 MSC events."
    },
    {
      title: "Community Speaker",
      category: "Public Speaking & Tutoring",
      icon: "fa-microphone",
      description: "Delivery of technical presentations or tutoring sessions to student peers.",
      criteria: "Lead a workshop or presentation at an official MSC meetup."
    }
  ];

  return (
    <div className="wallet-wrapper" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Club Badge Directory</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto' }}>
          Overview of official badges issued by the Microsoft Student Club PRPCEM chapter and their earning criteria.
        </p>
      </div>

      {/* Simple, clean grid of badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
        {distinctBadges.map((badge, index) => (
          <div 
            key={index} 
            className="admin-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '20px', 
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div 
                style={{ 
                  background: 'var(--primary-light)', 
                  color: 'var(--primary)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '16px'
                }}
              >
                <i className={`fa-solid ${badge.icon}`}></i>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>{badge.title}</h4>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {badge.category}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '14px', flexGrow: 1 }}>
              {badge.description}
            </p>

            <div 
              style={{ 
                borderTop: '1px solid #f1f5f9', 
                paddingTop: '10px', 
                fontSize: '11px',
                color: 'var(--text-main)'
              }}
            >
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>How to earn: </span>
              <span style={{ fontWeight: 500 }}>{badge.criteria}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
