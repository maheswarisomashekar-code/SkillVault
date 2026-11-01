import React, { useState } from 'react';
import { 
  Layers, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  Cloud,
  GraduationCap,
  Server,
  Database,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const { login, register, loginDemoStudent, authError, isFirebaseConfigured } = useAuth();

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

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginDemoStudent();
    } catch (err) {
      setError('Could not initialize demo student profile.');
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
      background: 'radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.12) 0%, var(--bg-main) 60%)',
      padding: '32px 20px'
    }}>
      <div style={{
        maxWidth: '1050px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Left Side: Professional Cloud Computing Showcase Panel */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.9))',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-subtle)',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div className="brand-icon-wrapper" style={{ width: '44px', height: '44px' }}>
                <Layers size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  SkillVault
                </h1>
                <span className="brand-badge">Cloud Computing ISE</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.25, marginBottom: '14px' }}>
              Cloud-Based Skill Credential & Digital Portfolio
            </h2>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
              Individual 5th Semester Cloud Computing Project. Upload certificates, perform smart OCR extraction, store in secure cloud storage, and publish a verified public portfolio.
            </p>

            {/* Cloud Architecture Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                  <Cloud size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Cloud Storage for Firebase</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure object storage with owner-scoped security rules</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <Database size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Cloud Firestore NoSQL</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time student profiles and credential metadata</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <FileCheck2 size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Smart OCR & Authenticity Guard</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extracts names, dates, and rejects non-credential spam</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department of Information Science</span>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>VTU Lab Evaluation</span>
          </div>
        </div>

        {/* Right Side: Clean Login / Registration Form */}
        <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isRegistering ? 'Create Student Account' : 'Student & Evaluator Sign In'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {isRegistering 
                ? 'Register with your college email to manage your cloud credentials' 
                : 'Sign in to access your dashboard, upload certificates, or verify credentials'}
            </p>
          </div>

          {/* 1-Click Demo Login for Viva Evaluators */}
          {!isRegistering && (
            <div style={{ marginBottom: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDemoLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.15))',
                  border: '1px solid rgba(14, 165, 233, 0.35)',
                  color: '#38bdf8',
                  padding: '12px'
                }}
              >
                <GraduationCap size={18} />
                <span>1-Click Viva Evaluator Quick Demo</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '20px 0 4px',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                <span>Or use student credentials</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
              </div>
            </div>
          )}

          {/* Error notification */}
          {(error || authError) && (
            <div style={{
              padding: '12px 16px',
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

          {/* Main Form */}
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
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

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">College Email *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  required
                  placeholder="name@student.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
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
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              <span>{isRegistering ? 'Create Student Account' : 'Sign In to SkillVault'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle mode */}
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
