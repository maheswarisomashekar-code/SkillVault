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
  FileText,
  Code,
  Briefcase,
  Sparkles,
  CheckCircle,
  Building2,
  MapPin,
  Clock
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons';
import { getUserProfile } from '../services/profileService';
import { getPublicCertificates } from '../services/certificateService';
import { getStudentProjects, getStudentExperiences } from '../services/projectService';
import { CategoryBadge } from '../components/CategoryBadge';
import { VerificationBadge } from '../components/VerificationBadge';
import { CertificatePreviewModal } from '../components/CertificatePreviewModal';
import { ResumeExportModal } from '../components/ResumeExportModal';
import { RoleAnalyzerModal } from '../components/RoleAnalyzerModal';

export const PublicPortfolioPage = ({ portfolioId, onBackToApp }) => {
  const [profile, setProfile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioTab, setPortfolioTab] = useState('all'); // 'all' | 'projects' | 'certificates' | 'experience'
  const [selectedCertCategory, setSelectedCertCategory] = useState('all');
  const [previewCert, setPreviewCert] = useState(null);

  // New features modals
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    const loadPortfolioData = async () => {
      setLoading(true);
      try {
        const userProf = await getUserProfile(portfolioId);
        setProfile(userProf);

        if (userProf?.isPortfolioPublic !== false) {
          const [publicCerts, publicProjects, publicExps] = await Promise.all([
            getPublicCertificates(portfolioId),
            getStudentProjects(portfolioId, true),
            getStudentExperiences(portfolioId, true)
          ]);
          setCertificates(publicCerts || []);
          setProjects(publicProjects || []);
          setExperiences(publicExps || []);
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
          <div>Retrieving verified credentials and cloud projects...</div>
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

  const verifiedCertCount = certificates.filter(c => c.verificationStatus === 'VERIFIED').length;

  const filteredCerts = certificates.filter(c => {
    if (selectedCertCategory === 'all') return true;
    return (c.category || 'other').toLowerCase() === selectedCertCategory;
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
            SkillVault <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>Verified Showcase</span>
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
          marginBottom: '32px',
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
                  {[profile?.degree, profile?.institution].filter(Boolean).join(' • ') || 'Verified Candidate'}
                  {profile?.usn && <span style={{ fontFamily: 'var(--font-mono)', marginLeft: '8px', color: '#38bdf8' }}>[{profile.usn}]</span>}
                </div>
              </div>
            </div>

            {/* Actions & Social Links */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsRoleModalOpen(true)}
              >
                <Sparkles size={14} style={{ color: '#818cf8' }} />
                <span>Role Readiness</span>
              </button>

              <button 
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsResumeModalOpen(true)}
                style={{
                  boxShadow: '0 0 16px rgba(14, 165, 233, 0.35)',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)'
                }}
              >
                <FileText size={14} />
                <span>Download ATS CV (PDF)</span>
              </button>

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

          {/* Recruiter Trust Stat Strip */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '36px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                {projects.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Engineering Projects
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {certificates.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Verified Credentials
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                {verifiedCertCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Institutional Signatures
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a5b4fc' }}>
                {experiences.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Internship / Industry Roles
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '32px',
          paddingBottom: '12px',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setPortfolioTab('all')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: portfolioTab === 'all' ? 'var(--color-primary)' : 'var(--bg-surface)',
              color: portfolioTab === 'all' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            🌟 All Showcase
          </button>

          <button
            onClick={() => setPortfolioTab('projects')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: portfolioTab === 'projects' ? 'var(--color-primary)' : 'var(--bg-surface)',
              color: portfolioTab === 'projects' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Code size={15} />
            <span>Featured Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setPortfolioTab('certificates')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: portfolioTab === 'certificates' ? 'var(--color-primary)' : 'var(--bg-surface)',
              color: portfolioTab === 'certificates' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Award size={15} />
            <span>Credentials & Certificates ({certificates.length})</span>
          </button>

          <button
            onClick={() => setPortfolioTab('experience')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: portfolioTab === 'experience' ? 'var(--color-primary)' : 'var(--bg-surface)',
              color: portfolioTab === 'experience' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Briefcase size={15} />
            <span>Experience & Internships ({experiences.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: FEATURED ENGINEERING PROJECTS                 */}
        {/* ======================================================== */}
        {(portfolioTab === 'all' || portfolioTab === 'projects') && (
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code size={20} style={{ color: '#0ea5e9' }} />
                  <span>Featured Engineering Projects</span>
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Interactive cloud deployments and public source code repositories for recruiter evaluation
                </p>
              </div>
            </div>

            {projects.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {projects.map(proj => (
                  <div 
                    key={proj.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: 'linear-gradient(145deg, var(--bg-surface), rgba(30, 41, 59, 0.7))',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '24px',
                      transition: 'transform 0.2s ease, border-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: 'rgba(14, 165, 233, 0.15)',
                          color: '#38bdf8'
                        }}>
                          {proj.role || 'Software Project'}
                        </span>

                        {proj.isVerifiedRepo && (
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }} title="GitHub repository owner confirmed to match candidate handle">
                            <CheckCircle2 size={12} />
                            <span>Verified Owner</span>
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        {proj.title}
                      </h3>

                      {proj.tagline && (
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', fontWeight: 500 }}>
                          {proj.tagline}
                        </div>
                      )}

                      {proj.description && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                          {proj.description}
                        </p>
                      )}

                      {/* Tech Stack Pills */}
                      {proj.techStack && proj.techStack.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                          {proj.techStack.map((tech, i) => (
                            <span 
                              key={i}
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recruiter Action Buttons */}
                    <div style={{
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      {proj.liveDemoUrl && (
                        <a 
                          href={proj.liveDemoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <ExternalLink size={14} />
                          <span>Launch Live Demo</span>
                        </a>
                      )}

                      {proj.repoUrl && (
                        <a 
                          href={proj.repoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ flex: proj.liveDemoUrl ? '0 0 auto' : 1, justifyContent: 'center' }}
                          title="View Public Source Code on GitHub"
                        >
                          <GithubIcon size={14} />
                          <span>Source Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                <Code size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  No featured engineering projects published yet.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: VERIFIED CREDENTIALS & CERTIFICATES           */}
        {/* ======================================================== */}
        {(portfolioTab === 'all' || portfolioTab === 'certificates') && (
          <div style={{ marginBottom: '48px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} style={{ color: '#0ea5e9' }} />
                  <span>Verified Credentials & Certifications</span>
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Authenticated via SkillVault OCR extraction, cryptographic signatures, and issuer portals
                </p>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'course', 'internship', 'hackathon', 'academic', 'workshop'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCertCategory(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      border: '1px solid',
                      borderColor: selectedCertCategory === cat ? 'var(--color-primary)' : 'var(--border-subtle)',
                      background: selectedCertCategory === cat ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-surface)',
                      color: selectedCertCategory === cat ? '#38bdf8' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <CategoryBadge category={cert.category} />
                      <VerificationBadge status={cert.verificationStatus} />
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        fontFamily: 'monospace',
                        fontWeight: 600
                      }}>
                        SHA-256 Sealed
                      </span>
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
                        Click to Inspect Evidence
                      </span>
                      <ExternalLink size={14} style={{ color: '#38bdf8' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                <Award size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  No certificates published in this category yet.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: INTERNSHIP & INDUSTRY EXPERIENCE              */}
        {/* ======================================================== */}
        {(portfolioTab === 'all' || portfolioTab === 'experience') && (
          <div style={{ marginBottom: '48px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} style={{ color: '#10b981' }} />
                <span>Experience & Internships</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Professional training, industrial assignments, and developer roles
              </p>
            </div>

            {experiences.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {experiences.map(exp => (
                  <div 
                    key={exp.id}
                    className="card"
                    style={{
                      padding: '24px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {exp.role}
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <Building2 size={14} />
                          <span>{exp.company}</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {exp.duration && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} />
                            <span>{exp.duration}</span>
                          </span>
                        )}
                        {exp.location && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} />
                            <span>{exp.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {exp.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                        {exp.description}
                      </p>
                    )}

                    {exp.skills && exp.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {exp.skills.map((s, idx) => (
                          <span 
                            key={idx}
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              color: '#6ee7b7'
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                <Briefcase size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  No internship or work experience entries published yet.
                </div>
              </div>
            )}
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

      {/* ATS Resume Export Modal */}
      <ResumeExportModal 
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profile={profile}
        certificates={certificates}
        projects={projects}
        experiences={experiences}
      />

      {/* Target Role Readiness Modal */}
      <RoleAnalyzerModal 
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        profile={profile}
        certificates={certificates}
        projects={projects}
      />
    </div>
  );
};
