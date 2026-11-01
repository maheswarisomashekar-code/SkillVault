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
  const { login, register, authError } = useAuth();

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
      background: 'radial-gradient(ellipse at 50% 20%, rgba(14, 165, 233, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(99, 102, 241, 0.08) 0%, var(--bg-main) 70%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px 36px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        {/* Brand Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ffffff',
            boxShadow: '0 4px 20px var(--color-primary-glow)'
          }}>
            <Layers size={26} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            SkillVault
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isRegistering ? 'Create your student account to get started' : 'Sign in to access your credential portfolio'}
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

        {/* Authentication Form */}
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
                  placeholder="Enter your full name"
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
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Toggle Mode */}
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
