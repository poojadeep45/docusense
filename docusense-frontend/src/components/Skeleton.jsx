import React from 'react';

export function SkeletonStatRow({ count = 4 }) {
  return (
    <div className="stat-row">
      {Array.from({ length: count }).map((_, i) => (
        <div className="stat-card skeleton-card" key={i}>
          <div className="skeleton-block skeleton-circle" />
          <div style={{ flex: 1 }}>
            <div className="skeleton-block" style={{ width: '50%', height: 20, marginBottom: 8 }} />
            <div className="skeleton-block" style={{ width: '70%', height: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 5 }) {
  return (
    <table className="data-table">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}>
                <div className="skeleton-block" style={{ width: c === 0 ? '80%' : '60%', height: 14 }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonChartCard({ height = 260 }) {
  return (
    <div className="chart-card">
      <div className="skeleton-block" style={{ width: '40%', height: 16, marginBottom: 16 }} />
      <div className="skeleton-block" style={{ width: '100%', height }} />
    </div>
  );
}