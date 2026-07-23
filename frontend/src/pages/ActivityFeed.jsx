import React, { useEffect, useState } from 'react';
import { apiFetch } from '../config/api';

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const res = await apiFetch('/api/profile/activity');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to normalize sqlite date string representation
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString.replace(' ', 'T'));
      if (isNaN(date.getTime())) return isoString;
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} Days Ago`;
      if (diffDays < 14) return "Last Week";
      return `${Math.floor(diffDays / 7)} Weeks Ago`;
    } catch (err) {
      console.error(err);
      return isoString;
    }
  };

  return (
    <div className="wallet-wrapper" style={{ maxWidth: '600px' }}>
      <div className="wallet-section-card">
        <h3 style={{ fontSize: '18px', fontWeight: 800, borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '16px' }}>
          Activity Timeline
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <i className="fa-solid fa-circle-notch fa-spin"></i> Loading logs...
          </div>
        ) : activities.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No recent activity logged.
          </p>
        ) : (
          <div className="timeline-feed">
            {activities.map((act) => (
              <div key={act.id} className="timeline-node">
                <div className="timeline-time">{formatTime(act.timestamp)}</div>
                <div className="timeline-desc">{act.action}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
