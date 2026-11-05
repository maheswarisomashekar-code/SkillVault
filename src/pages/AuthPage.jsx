import React, { useState } from 'react';
import { 
  Layers, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck2, 
  Cloud,
  CheckCircle2,
  LockKeyhole,
  Award,
  Globe2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const { login, register, loginDemoStudent, authError } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 15% 15%, rgba(14, 165, 233, 0.15) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.15) 0%, var(--bg-main) 65%)',
      padding: '32px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient Cloud Layers & Glowing Nebulas */}
      <div className="floating-cloud-1" style={{
        position: 'absolute',
        top: '6%',
        left: '5%',
        width: '420px',
        height: '420px',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(14, 165, 233, 0.06) 50%, transparent 70%)',
        filter: 'blur(60px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      <div className="floating-cloud-2" style={{
        position: 'absolute',
        bottom: '6%',
        right: '4%',
        width: '460px',
        height: '460px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)',
        filter: 'blur(70px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      <div className="floating-cloud-3" style={{
        position: 'absolute',
        top: '40%',
        right: '25%',
        width: '320px',
        height: '320px',
        background: 'radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, rgba(20, 184, 166, 0.04) 55%, transparent 75%)',
        filter: 'blur(55px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      {/* Decorative Cloud Grid & Cloud Icon Watermarks */}
      <div className="floating-cloud-1" style={{
        position: 'absolute',
        top: '4%',
        right: '12%',
        opacity: 0.18,
        color: '#38bdf8',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.4))'
      }}>
        <Cloud size={160} strokeWidth={1.2} />
      </div>

      <div className="floating-cloud-2" style={{
        position: 'absolute',
        bottom: '6%',
        left: '10%',
        opacity: 0.14,
        color: '#818cf8',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 20px rgba(129, 140, 248, 0.35))'
      }}>
        <Cloud size={200} strokeWidth={1} />
      </div>

      <div className="floating-cloud-3" style={{
        position: 'absolute',
        top: '22%',
        left: '2%',
        opacity: 0.12,
        color: '#2dd4bf',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 12px rgba(45, 212, 191, 0.3))'
      }}>
        <Cloud size={110} strokeWidth={1.3} />
      </div>

      {/* Main Two-Panel Card: Side-by-Side Dual Column */}
      <div className="auth-panel-glow auth-card-grid" style={{
        maxWidth: '1040px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.05fr 0.95fr',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Side: Rich Project Visuals & Feature Highlights */}
        <div className="auth-promo-panel" style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))',
          padding: '48px 42px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-subtle)',
          position: 'relative'
        }}>
          <div>
            {/* Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div className="brand-icon-wrapper" style={{ width: '44px', height: '44px', boxShadow: '0 0 18px rgba(14, 165, 233, 0.3)' }}>
                <Cloud size={22} />
              </div>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  SkillVault
                </span>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Cloud Credential Architecture
                </div>
              </div>
            </div>

            <h2 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#f8fafc',
              lineHeight: 1.25,
              marginBottom: '14px',
              letterSpacing: '-0.02em'
            }}>
              Authenticate, Verify, and Showcase Your Achievements.
            </h2>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
              A modern cloud platform for smart certificate ingestion, automated entity extraction via OCR, and verified digital portfolio publishing.
            </p>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="feature-pill-hover" style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div className="feature-icon-box" style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(14, 165, 233, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileCheck2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>Smart Multi-Format OCR</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated extraction from NPTEL, Coursera, PDFs, & scanned images</div>
                </div>
              </div>

              <div className="feature-pill-hover" style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div className="feature-icon-box" style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>Multi-Tier Verification</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Defensible validation with genuine credential lookup & issuer matching</div>
                </div>
              </div>

              <div className="feature-pill-hover" style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div className="feature-icon-box" style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Globe2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>Shareable Digital Showcase</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique live portfolio URL with granular student privacy controls</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '36px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '0.78rem'
          }}>
            <LockKeyhole size={14} style={{ color: '#10b981' }} />
            <span>Secured via Cloud Storage & Firestore multi-tenant isolation</span>
          </div>
        </div>

        {/* Right Side: Elegant Authentication Form */}
        <div className="auth-form-panel" style={{
          padding: '44px 38px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Mobile-only compact brand header */}
          <div className="auth-mobile-brand" style={{ display: 'none', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div className="brand-icon-wrapper" style={{ width: '38px', height: '38px' }}>
              <Cloud size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>SkillVault</div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>Cloud Credential Platform</div>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {isRegistering ? 'Create Your Account' : 'Welcome Back'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {isRegistering 
                ? 'Register with your email to start managing your credentials' 
                : 'Enter your credentials to access your dashboard and portfolio'}
            </p>
          </div>

          {/* Error Notification */}
          {(error || authError) && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '0.82rem',
              marginBottom: '20px'
            }}>
              {error || authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '40px' }}
                    required
                    placeholder="e.g. Maheswari S"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary auth-glow-btn" 
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Quick Demo Login (Crucial for mobile testers & examiners) */}
            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await loginDemoStudent();
                  } catch (e) {
                    setError(e.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '0.82rem',
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.08)'
                }}
              >
                <span>⚡ 1-Click Instant Demo Login</span>
              </button>
            </div>
          </form>

          {/* Toggle Register/Sign In */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              style={{ color: '#38bdf8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isRegistering ? 'Sign In' : 'Register Here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
