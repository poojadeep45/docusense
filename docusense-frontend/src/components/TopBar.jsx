import React from 'react';

export default function TopBar({ username, onLogout }) {
  return (
    <div className="topbar">
      <div className="brand"><span className="mark"></span>DocuSense</div>
      {username && (
        <div className="userbar">
          <span>{username}</span>
          <button className="btn-ghost" onClick={onLogout}>Log out</button>
        </div>
      )}
    </div>
  );
}