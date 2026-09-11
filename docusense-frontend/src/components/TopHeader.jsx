import React from 'react';

export default function TopHeader({ title, subtitle, actions }) {
  return (
    <div className="top-header">
      <div>
        <h1 className="top-header-title">{title}</h1>
        {subtitle && <p className="top-header-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="top-header-actions">{actions}</div>}
    </div>
  );
}