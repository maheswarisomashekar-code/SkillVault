import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Globe, 
  ExternalLink, 
  Calendar, 
  Building, 
  Lock, 
  Layers, 
  ArrowLeft,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons';
import { getUserProfile } from '../services/profileService';
import { getPublicCertificates } from '../services/certificateService';
import { CategoryBadge } from '../components/CategoryBadge';
import { VerificationBadge } from '../components/VerificationBadge';
import { CertificatePreviewModal } from '../components/CertificatePreviewModal';

export const PublicPortfolioPage = ({ portfolioId, onBackToApp }) => {
  const [profile, setProfile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    const loadPortfolioData = async () => {
      setLoading(true);
      try {
        const userProf = await getUserProfile(portfolioId);
        setProfile(userProf);

        if (userProf?.isPortfolioPublic !== false) {
          const publicCerts = await getPublicCertificates(portfolioId);
          setCertificates(publicCerts);
        }
      } catch (err) {
        console.error('Failed to load public portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    if (portfolioId) {
      loadPortfolioData();
    }
  }, [portfolioId]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Layers size={36} className="spin-animation" style={{ color: '#0ea5e9', margin: '0 auto 16px' }} />
          <div>Retrieving verified credentials from cloud database...</div>
        </div>
      </div>
    );
  }

  // Handle Private Portfolios
  if (profile && profile.isPortfolioPublic === false) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 24px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.12)',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={30} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Portfolio is Private
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            The student has set this credential portfolio to private mode. Please request access directly from the owner.
          </p>
          {onBackToApp && (
            <button className="btn btn-secondary" onClick={onBackToApp}>
              <ArrowLeft size={16} />
              <span>Back to SkillVault</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const verifiedCount = certificates.filter(c => c.verificationStatus === 'VERIFIED').length;

  const filteredCerts = certificates.filter(c => {
    if (selectedCategory === 'all') return true;
    return (c.category || 'other').toLowerCase() === selectedCategory;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Top Banner Navigation */}
      <header style={{
        height: '64px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon-wrapper" style={{ width: '32px', height: '32px' }}>
            <Layers size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
            SkillVault <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>Portfolio</span>
          </span>
        </div>

        {onBackToApp && (
          <button className="btn btn-secondary btn-sm" onClick={onBackToApp}>
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </button>
        )}
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Student Profile Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          marginBottom: '40px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: '0 4px 20px var(--color-primary-glow)'
              }}>
                {(profile?.fullName || 'S')[0].toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {profile?.fullName || 'Student Portfolio'}
                  </h1>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={14} />
                    <span>Cloud Verified Profile</span>
                  </span>
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {profile?.degree || 'Bachelor of Engineering'} • {profile?.institution || 'Information Science & Engineering'}
                  {profile?.usn && <span style={{ fontFamily: 'var(--font-mono)', marginLeft: '8px', color: '#38bdf8' }}>[{profile.usn}]</span>}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {profile?.github && (
                <a 
                  href={profile.github} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  title="GitHub Profile"
                >
                  <GithubIcon size={15} />
                  <span>GitHub</span>
                </a>
              )}
              {profile?.linkedin && (
                <a 
                  href={profile.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  title="LinkedIn Profile"
                >
                  <LinkedinIcon size={15} />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              marginTop: '20px',
              lineHeight: 1.6,
              maxWidth: '850px'
            }}>
              {profile.bio}
            </p>
          )}

          {/* Skills Badges */}
          {profile?.skills && profile.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
              {profile.skills.map((skill, idx) => (
                <span 
                  key={idx}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    background: 'rgba(14, 165, 233, 0.12)',
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    color: '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Trust Stat Strip */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {certificates.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Published Credentials
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                {verifiedCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Independently Verified
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                Cloud Firestore & Storage
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Secured Infrastructure
              </div>
            </div>
          </div>
        </div>

        {/* Credentials Showcase Header & Category Filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Verified Credentials & Achievements
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Inspect authenticated certificates and skill demonstrations
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'course', 'internship', 'hackathon', 'academic', 'workshop'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--border-subtle)',
                  background: selectedCategory === cat ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-surface)',
                  color: selectedCategory === cat ? '#38bdf8' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Certificate Cards Grid */}
        {filteredCerts.length > 0 ? (
          <div className="cert-grid">
            {filteredCerts.map(cert => (
              <div 
                key={cert.id} 
                className="card" 
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
                onClick={() => setPreviewCert(cert)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Media thumbnail */}
                <div style={{
                  height: '160px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  {cert.fileUrl ? (
                    cert.fileType === 'application/pdf' ? (
                      <div style={{ textAlign: 'center', color: '#0ea5e9' }}>
                        <FileText size={38} style={{ margin: '0 auto 8px' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF Certificate</span>
                      </div>
                    ) : (
                      <img 
                        src={cert.fileUrl} 
                        alt={cert.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )
                  ) : (
                    <Award size={36} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <CategoryBadge category={cert.category} />
                  <VerificationBadge status={cert.verificationStatus} />
                </div>

                <h3 style={{
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                  lineHeight: 1.35
                }}>
                  {cert.title}
                </h3>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{cert.issuer}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{cert.issueDate || 'Date N/A'}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                    Click to Verify & Inspect
                  </span>
                  <ExternalLink size={14} style={{ color: '#38bdf8' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Award size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              No certificates published in this category yet.
            </p>
          </div>
        )}
      </main>

      {/* Preview Modal for Public Visitors */}
      {previewCert && (
        <CertificatePreviewModal 
          certificate={previewCert}
          isOpen={Boolean(previewCert)}
          onClose={() => setPreviewCert(null)}
        />
      )}
    </div>
  );
};
