import React, { useState } from 'react';
import { 
  Globe, 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Share2, 
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../services/profileService';
import { updateCertificateRecord } from '../services/certificateService';

export const PortfolioManagerPage = ({ certificates = [], onCertificateUpdate, onPreviewPublicPortfolio }) => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isPublic = userProfile?.isPortfolioPublic !== false;
  const portfolioId = currentUser?.uid || 'student';
  const shareableUrl = `${window.location.origin}${window.location.pathname}#/p/${portfolioId}`;

  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleTogglePublic = async () => {
    setUpdating(true);
    try {
      await saveUserProfile(currentUser.uid, {
        isPortfolioPublic: !isPublic
      });
      await refreshProfile();
    } catch (e) {
      console.error('Failed to toggle portfolio sharing:', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleCertificatePublish = async (cert) => {
    try {
      const updated = await updateCertificateRecord(cert.id, {
        isPublished: !cert.isPublished
      });
      if (onCertificateUpdate) {
        onCertificateUpdate({ ...cert, isPublished: !cert.isPublished });
      }
    } catch (e) {
      console.error('Failed to toggle publish status:', e);
    }
  };

  const publishedCount = certificates.filter(c => c.isPublished).length;

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Digital Portfolio Customizer
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Manage your shareable showcase URL, privacy controls, and select published credentials
        </p>
      </div>

      {/* Share Link Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(99, 102, 241, 0.12))',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: isPublic ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              color: isPublic ? '#34d399' : '#fb7185',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isPublic ? <Globe size={22} /> : <Lock size={22} />}
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isPublic ? 'Public Portfolio Active' : 'Portfolio is Private'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {isPublic 
                  ? 'Anyone with this unique link can view your published certificates and achievements.' 
                  : 'Link is disabled. Visitors will see a private access restriction.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className={`btn ${isPublic ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              onClick={handleTogglePublic}
              disabled={updating}
            >
              {isPublic ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{isPublic ? 'Disable Public Sharing' : 'Enable Public Link'}</span>
            </button>

            {isPublic && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onPreviewPublicPortfolio(portfolioId)}
              >
                <ExternalLink size={14} />
                <span>Preview Live Portfolio</span>
              </button>
            )}
          </div>
        </div>

        {/* Shareable Link Bar */}
        <div style={{
          background: 'var(--bg-main)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Share2 size={16} style={{ color: '#0ea5e9' }} />
          <input 
            type="text" 
            readOnly 
            value={shareableUrl} 
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button 
            className="btn btn-secondary btn-sm"
            onClick={copyShareableLink}
            style={{ padding: '6px 14px' }}
          >
            {copied ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Published Certificates Selector */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Published Credentials Selection</h3>
            <p className="card-subtitle">
              Choose which certificates are displayed on your public portfolio ({publishedCount} of {certificates.length} published)
            </p>
          </div>
        </div>

        {certificates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {certificates.map(cert => {
              const isCertPublished = cert.isPublished !== false;
              return (
                <div 
                  key={cert.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: `1px solid ${isCertPublished ? 'rgba(14, 165, 233, 0.3)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {cert.title}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-secondary)'
                      }}>
                        {cert.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Issued by {cert.issuer} • {cert.issueDate || 'Date N/A'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      className={`btn btn-sm ${isCertPublished ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleToggleCertificatePublish(cert)}
                    >
                      {isCertPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                      <span>{isCertPublished ? 'Published' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Award size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              No credentials found to publish. Upload certificates to include them on your portfolio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
