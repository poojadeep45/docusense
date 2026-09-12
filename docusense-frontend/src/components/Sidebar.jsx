import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderKanban, Tags, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/categories', label: 'Categories', icon: FolderKanban },
  { to: '/tags', label: 'Tags', icon: Tags },
];

export default function Sidebar() {
  const { username, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">DS</span>
        <span className="sidebar-brand-text">DocuSense</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{username ? username[0].toUpperCase() : '?'}</div>
          <span className="sidebar-username">{username}</span>
        </div>
        <ThemeToggle />
        <button className="sidebar-logout" onClick={logout} title="Log out">
          <LogOut size={17} strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
}