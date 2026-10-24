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
  GraduationCap
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
      background: 'radial-gradient(ellipse at 80% 20%, rgba(14, 165, 233, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(99, 102, 241, 0.12) 0%, var(--bg-main) 70%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ffffff',
            boxShadow: '0 4px 20px var(--color-primary-glow)'
          }}>
            <Layers size={28} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            SkillVault
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Cloud-Based Skill Credential & Portfolio System
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isFirebaseConfigured ? '#34d399' : '#fbbf24',
            marginTop: '10px',
            fontWeight: 600
          }}>
            <Cloud size={12} />
            <span>{isFirebaseConfigured ? 'Firebase Live Connected' : 'Cloud Sandbox Mode Active'}</span>
          </div>
        </div>

        {/* Demo Fast Login Button for Evaluators */}
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(99, 102, 241, 0.12))',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: '#38bdf8',
              padding: '12px'
            }}
          >
            <GraduationCap size={18} />
            <span>1-Click Student Evaluator Login</span>
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px 0',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
          <span>Or sign in with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
        </div>

        {/* Error notification */}
        {(error || authError) && (
          <div style={{
            padding: '12px',
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

        {/* Main form */}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Student Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  required
                  placeholder="e.g. Arjun Sharma"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Student / College Email</label>
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

          <div className="form-group">
            <label className="form-label">Password</label>
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
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
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
  );
};
