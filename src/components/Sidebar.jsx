import React from 'react';
import { 
  LayoutDashboard, 
  Award, 
  UploadCloud, 
  Globe, 
  User, 
  ShieldCheck, 
  LogOut, 
  Layers, 
  Orbit,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, certificates = [] }) => {
  const { currentUser, userProfile, logout } = useAuth();

  const candidateName = (userProfile?.fullName && !['Student Candidate', 'Student'].includes(userProfile.fullName))
    ? userProfile.fullName
    : (certificates && certificates.length > 0 && certificates[0]?.recipient && !['Student', 'Verified Student'].includes(certificates[0].recipient)
        ? certificates[0].recipient
        : userProfile?.fullName || currentUser?.displayName || 'Student');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'universe', label: '3D Skill Universe', icon: Orbit },
    { id: 'certificates', label: 'My Credentials', icon: Award },
    { id: 'upload', label: 'Smart Upload & OCR', icon: UploadCloud },
    { id: 'portfolio', label: 'Shareable Portfolio', icon: Globe },
    { id: 'validator', label: 'Verify Credential', icon: ShieldCheck },
    { id: 'profile', label: 'Student Profile', icon: User },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon-wrapper">
          <Layers size={22} />
        </div>
        <div className="brand-info" style={{ flex: 1 }}>
          <h1>SkillVault</h1>
          <span className="brand-badge">Cloud Vault</span>
        </div>
        {setIsOpen && (
          <button 
            className="mobile-close-btn"
            style={{ color: 'var(--text-muted)' }} 
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="sidebar-nav">
        <div className="nav-category">Main Navigation</div>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-quick-profile" style={{ marginBottom: '8px' }}>
          <div className="avatar-circle">
            {(candidateName || 'S')[0].toUpperCase()}
          </div>
          <div className="user-text-meta">
            <div className="user-name-title">
              {candidateName}
            </div>
            <div className="user-subtext">
              {userProfile?.usn || userProfile?.degree || currentUser?.email || 'Student Account'}
            </div>
          </div>
        </div>

        <button 
          onClick={logout} 
          className="btn btn-secondary btn-sm"
          style={{ 
            width: '100%', 
            justifyContent: 'center',
            borderColor: 'rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            background: 'rgba(244, 63, 94, 0.08)'
          }}
          title="Sign Out"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
