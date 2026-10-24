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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { currentUser, userProfile, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
          <span className="brand-badge">Cloud IS&E</span>
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
        <div className="user-quick-profile">
          <div className="avatar-circle">
            {(userProfile?.fullName || currentUser?.displayName || 'S')[0].toUpperCase()}
          </div>
          <div className="user-text-meta">
            <div className="user-name-title">
              {userProfile?.fullName || currentUser?.displayName || 'Student'}
            </div>
            <div className="user-subtext">
              {userProfile?.usn || userProfile?.degree || 'ISE Dept'}
            </div>
          </div>
          <button 
            onClick={logout} 
            title="Sign Out"
            style={{ 
              color: 'var(--text-muted)', 
              padding: '6px', 
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fb7185'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
