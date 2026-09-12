import React from 'react';
import { FileText, ShieldCheck, Sparkles, FolderKanban } from 'lucide-react';

const features = [
  { icon: Sparkles, text: 'AI-generated summaries for every document you upload' },
  { icon: FolderKanban, text: 'Organize files with categories and tags' },
  { icon: ShieldCheck, text: 'JWT-secured, per-user document isolation' },
];

export default function AuthSidePanel() {
  return (
    <div className="auth-side">
      <div className="auth-side-pattern" />
      <div className="auth-side-content">
        <div className="auth-side-mark"><FileText size={26} strokeWidth={2} /></div>
        <h3>Your documents, understood.</h3>
        <p>DocuSense reads what you upload and hands you the summary — organized, searchable, and yours alone.</p>

        <ul className="auth-side-features">
          {features.map(({ icon: Icon, text }) => (
            <li key={text}>
              <span className="auth-side-feature-icon"><Icon size={15} strokeWidth={2} /></span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}