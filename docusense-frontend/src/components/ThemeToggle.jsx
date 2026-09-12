import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}