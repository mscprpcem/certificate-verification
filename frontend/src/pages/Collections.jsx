import React from 'react';

export default function Collections() {
  const learningPaths = [
    {
      title: "Cloud Learning Path",
      completed: 4,
      total: 10,
      skills: "Cloud Architecture, Kubernetes, Cloud Security",
      badges: [
        { name: "Cloud Beginner", status: "completed", icon: "fa-cloud-meatball" },
        { name: "Cloud Associate", status: "completed", icon: "fa-server" },
        { name: "Cloud Security", status: "completed", icon: "fa-lock" },
        { name: "Cloud AI Specialist", status: "completed", icon: "fa-brain" },
        { name: "Azure Fundamentals", status: "locked", icon: "fa-shield-halved" },
        { name: "GCP Cloud Engineer", status: "locked", icon: "fa-cloud" },
        { name: "AWS Solutions Architect", status: "locked", icon: "fa-network-wired" },
        { name: "Kubernetes Admin", status: "locked", icon: "fa-dharmachakra" },
        { name: "Serverless Builder", status: "locked", icon: "fa-bolt" },
        { name: "DevOps Professional", status: "locked", icon: "fa-code-branch" }
      ]
    },
    {
      title: "Artificial Intelligence Path",
      completed: 1,
      total: 5,
      skills: "Machine Learning, Deep Learning, Prompt Engineering",
      badges: [
        { name: "AI Workshop Participant", status: "completed", icon: "fa-brain" },
        { name: "Prompt Engineer Expert", status: "locked", icon: "fa-terminal" },
        { name: "ML Models Developer", status: "locked", icon: "fa-sliders" },
        { name: "Computer Vision Specialist", status: "locked", icon: "fa-eye" },
        { name: "Neural Networks Architect", status: "locked", icon: "fa-circle-nodes" }
      ]
    },
    {
      title: "Software Engineering Path",
      completed: 2,
      total: 6,
      skills: "Java, Data Structures, OOP, Architecture",
      badges: [
        { name: "Java Fundamentals", status: "completed", icon: "fa-mug-hot" },
        { name: "Quiz Master (Data Structures)", status: "completed", icon: "fa-trophy" },
        { name: "System Design Associate", status: "locked", icon: "fa-sitemap" },
        { name: "Object Oriented Pro", status: "locked", icon: "fa-cube" },
        { name: "Design Patterns Master", status: "locked", icon: "fa-palette" },
        { name: "Full Stack Engineer", status: "locked", icon: "fa-layer-group" }
      ]
    }
  ];

  return (
    <div className="wallet-wrapper">
      <div style={{ marginBottom: '24px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800 }}>Learning Paths & Collections</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Track your progress through standard Microsoft Student Club curations. Complete locked milestones to earn path completions.
        </p>
      </div>

      <div className="collections-grid">
        {learningPaths.map((path, idx) => {
          const pct = Math.round((path.completed / path.total) * 100);
          return (
            <div key={idx} className="collection-card">
              <div className="collection-header-row">
                <h4 style={{ fontSize: '18px', fontWeight: 800 }}>{path.title}</h4>
                <span className="collection-badge-count">
                  {path.completed}/{path.total} Completed
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, margin: '8px 0 4px' }}>
                <span>Completion progress</span>
                <span style={{ color: 'var(--primary)' }}>{pct}%</span>
              </div>
              
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)' }}></div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                <strong>Key Skills:</strong> {path.skills}
              </div>

              <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                Badges Check List
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {path.badges.map((badge, bIdx) => (
                  <div 
                    key={bIdx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      background: badge.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                      border: badge.status === 'completed' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      opacity: badge.status === 'completed' ? 1 : 0.65
                    }}
                  >
                    <i 
                      className={`fa-solid ${badge.icon}`} 
                      style={{ color: badge.status === 'completed' ? '#16a34a' : '#64748b', fontSize: '14px' }}
                    ></i>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: badge.status === 'completed' ? '#14532d' : '#475569' }}>
                        {badge.name}
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: badge.status === 'completed' ? '#16a34a' : '#94a3b8', textTransform: 'uppercase' }}>
                        {badge.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
