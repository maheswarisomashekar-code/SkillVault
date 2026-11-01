import React from 'react';
import { Menu, Cloud, CloudCheck, UploadCloud, ExternalLink, LogOut } from 'lucide-react';
import { isFirebaseConfigured } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const TopBar = ({ activeTab, setIsSidebarOpen, onOpenUpload, onOpenPortfolio }) => {
  const { logout, userProfile, currentUser } = useAuth();

  const titles = {
    dashboard: 'Student Overview & Analytics',
    certificates: 'Certificate Repository',
    upload: 'Smart Cloud Upload & OCR Engine',
    portfolio: 'Digital Portfolio Customizer',
    validator: 'Public Credential Verification Portal',
    profile: 'Student Identity & Academic Profile'
  };

  const subtitles = {
    dashboard: 'Real-time credential metrics & cloud distribution',
    certificates: 'Securely stored multi-format digital certificates',
    upload: 'Automated entity extraction and anti-tamper verification',
    portfolio: 'Publicly shareable showcase with privacy controls',
    validator: 'Defensible multi-tier authenticity lookup registry',
    profile: 'Manage personal details, institutional records, and verified skills'
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
            {subtitles[activeTab] || 'Cloud-Based Skill Credential Platform'}
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

        <button 
          className="btn btn-secondary btn-sm"
          onClick={logout}
          title="Sign out of your account"
          style={{
            borderColor: 'rgba(244, 63, 94, 0.3)',
            color: '#fb7185'
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
