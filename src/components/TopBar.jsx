import React from 'react';
import { Menu, Cloud, CloudCheck, UploadCloud, ExternalLink } from 'lucide-react';
import { isFirebaseConfigured } from '../config/firebase';

export const TopBar = ({ activeTab, setIsSidebarOpen, onOpenUpload, onOpenPortfolio }) => {
  const titles = {
    dashboard: 'Student Overview & Analytics',
    certificates: 'Certificate Repository',
    upload: 'Smart Cloud Upload & OCR Engine',
    portfolio: 'Digital Portfolio Customizer',
    validator: 'Public Credential Verification Portal',
    profile: 'Student Identity & Academic Profile'
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button 
          className="mobile-menu-btn"
          style={{ 
            display: 'none', 
            color: 'var(--text-primary)', 
            background: 'var(--bg-surface-elevated)', 
            padding: '8px', 
            borderRadius: 'var(--radius-sm)' 
          }}
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {titles[activeTab] || 'SkillVault'}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Cloud Computing Lab Project • 5th Sem Information Science
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div 
          className="cloud-status-pill"
          title={isFirebaseConfigured 
            ? "Live connection active to Firebase Cloud Firestore and Cloud Storage" 
            : "Running with local cloud simulation. Add Firebase API keys in .env to connect live GCP project."}
        >
          <span className={`status-dot ${isFirebaseConfigured ? 'online' : 'simulation'}`}></span>
          <span style={{ color: isFirebaseConfigured ? '#34d399' : '#fbbf24' }}>
            {isFirebaseConfigured ? 'Cloud Live (Firebase)' : 'Cloud Sandbox Mode'}
          </span>
        </div>

        <button 
          className="btn btn-primary btn-sm"
          onClick={onOpenUpload}
        >
          <UploadCloud size={15} />
          <span>Upload</span>
        </button>
      </div>
    </header>
  );
};
