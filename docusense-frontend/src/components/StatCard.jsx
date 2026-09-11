import React from 'react';

export default function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-card-icon"><Icon size={20} strokeWidth={2} /></div>
      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  );
}