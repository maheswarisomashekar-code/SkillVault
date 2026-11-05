import React, { useState, useEffect } from 'react';
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
  Award,
  Code,
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Target,
  FileText,
  BookOpen
} from 'lucide-react';
import { GithubIcon } from '../components/BrandIcons';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile, extractSkillsFromCertificates } from '../services/profileService';
import { updateCertificateRecord } from '../services/certificateService';
import { 
  getStudentProjects, 
  saveStudentProject, 
  deleteStudentProject,
  getStudentExperiences,
  saveStudentExperience,
  deleteStudentExperience
} from '../services/projectService';
import { ProjectModal } from '../components/ProjectModal';
import { ExperienceModal } from '../components/ExperienceModal';
import { ResumeExportModal } from '../components/ResumeExportModal';
import { RoleAnalyzerModal } from '../components/RoleAnalyzerModal';

export const PortfolioManagerPage = ({ certificates = [], onCertificateUpdate, onPreviewPublicPortfolio, onTakeViva }) => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeSection, setActiveSection] = useState('projects'); // 'projects' | 'certificates' | 'experience'

  // Modals
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Experiences state
  const [experiences, setExperiences] = useState([]);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);

  const isPublic = userProfile?.isPortfolioPublic !== false;
  const portfolioId = currentUser?.uid || 'student';
  const shareableUrl = `${window.location.origin}${window.location.pathname}#/p/${portfolioId}`;

  // Dynamically derive authentic candidate name and skills from certificates
  const candidateDisplayName = (userProfile?.fullName && !['Student Candidate', 'Student'].includes(userProfile.fullName))
    ? userProfile.fullName
    : (certificates && certificates.length > 0 && certificates[0]?.recipient && !['Student', 'Verified Student'].includes(certificates[0].recipient)
        ? certificates[0].recipient
        : userProfile?.fullName || currentUser?.displayName || 'Student Candidate');

  const rawSkills = Array.isArray(userProfile?.skills) ? userProfile.skills : [];
  const isBoilerplate = rawSkills.includes('Database Management') && rawSkills.includes('Web Development');
  const cleanSkills = isBoilerplate ? [] : rawSkills;
  const effectiveSkills = (cleanSkills.length > 0)
    ? cleanSkills
    : extractSkillsFromCertificates(certificates);

  const effectiveProfile = {
    ...(userProfile || {}),
    fullName: candidateDisplayName,
    email: userProfile?.email || currentUser?.email || '',
    skills: effectiveSkills
  };

  useEffect(() => {
    if (currentUser?.uid) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      const projList = await getStudentProjects(currentUser.uid);
      setProjects(projList);
      const expList = await getStudentExperiences(currentUser.uid);
      setExperiences(expList);
    } catch (e) {
      console.warn('Failed loading portfolio additions:', e);
    }
  };

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
      await updateCertificateRecord(cert.id, {
        isPublished: !cert.isPublished
      });
      if (onCertificateUpdate) {
        onCertificateUpdate({ ...cert, isPublished: !cert.isPublished });
      }
    } catch (e) {
      console.error('Failed to toggle publish status:', e);
    }
  };

  // Projects handlers
  const handleSaveProject = async (projData) => {
    const saved = await saveStudentProject(currentUser.uid, projData);
    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteProject = async (projId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    await deleteStudentProject(currentUser.uid, projId);
    setProjects(prev => prev.filter(p => p.id !== projId));
  };

  const handleToggleProjectPublish = async (proj) => {
    const updated = await saveStudentProject(currentUser.uid, {
      ...proj,
      isPublished: !proj.isPublished
    });
    setProjects(prev => prev.map(p => p.id === proj.id ? updated : p));
  };

  // Experience handlers
  const handleSaveExperience = async (expData) => {
    const saved = await saveStudentExperience(currentUser.uid, expData);
    setExperiences(prev => {
      const idx = prev.findIndex(e => e.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteExperience = async (expId) => {
    if (!window.confirm('Delete this experience entry?')) return;
    await deleteStudentExperience(currentUser.uid, expId);
    setExperiences(prev => prev.filter(e => e.id !== expId));
  };

  const publishedCertsCount = certificates.filter(c => c.isPublished !== false).length;
  const publishedProjectsCount = projects.filter(p => p.isPublished !== false).length;

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Digital Portfolio Customizer
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Manage your shareable showcase: publish verified certificates, engineering projects with live demo links, and internship experiences
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
                  ? 'Anyone with this unique link can inspect your verified credentials, cloud projects, and live demos.' 
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

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setIsRoleModalOpen(true)}
            >
              <Target size={14} style={{ color: '#818cf8' }} />
              <span>Target Role Analyzer</span>
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setIsResumeModalOpen(true)}
            >
              <FileText size={14} style={{ color: '#38bdf8' }} />
              <span>Export ATS CV (PDF)</span>
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

      {/* Section Switcher Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '24px',
        paddingBottom: '12px'
      }}>
        <button
          className={`btn btn-sm ${activeSection === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSection('projects')}
        >
          <Code size={15} />
          <span>Engineering Projects ({projects.length})</span>
        </button>

        <button
          className={`btn btn-sm ${activeSection === 'certificates' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSection('certificates')}
        >
          <Award size={15} />
          <span>Verified Credentials ({certificates.length})</span>
        </button>

        <button
          className={`btn btn-sm ${activeSection === 'experience' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSection('experience')}
        >
          <Briefcase size={15} />
          <span>Internships & Experience ({experiences.length})</span>
        </button>
      </div>

      {/* SECTION 1: ENGINEERING PROJECTS */}
      {activeSection === 'projects' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title">Featured Engineering Projects</h3>
              <p className="card-subtitle">
                Add projects with live demo links and GitHub repositories for recruiters to inspect ({publishedProjectsCount} published)
              </p>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingProject(null);
                setIsProjectModalOpen(true);
              }}
            >
              <Plus size={15} />
              <span>Add Verifiable Project</span>
            </button>
          </div>

          {projects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {projects.map(proj => {
                const isPublished = proj.isPublished !== false;
                return (
                  <div 
                    key={proj.id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: `1px solid ${isPublished ? 'rgba(14, 165, 233, 0.3)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                            {proj.title}
                          </span>
                          {proj.role && (
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              background: 'rgba(14, 165, 233, 0.15)',
                              color: '#38bdf8',
                              fontWeight: 600
                            }}>
                              {proj.role}
                            </span>
                          )}
                          {proj.isVerifiedRepo && (
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle2 size={12} />
                              Verified Repo Owner
                            </span>
                          )}
                        </div>

                        {proj.tagline && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            {proj.tagline}
                          </div>
                        )}

                        {proj.description && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '10px' }}>
                            {proj.description}
                          </p>
                        )}

                        {/* Tech Stack Badges */}
                        {proj.techStack && proj.techStack.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                            {proj.techStack.map((tech, i) => (
                              <span 
                                key={i}
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid var(--border-subtle)',
                                  color: 'var(--text-secondary)'
                                }}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Recruiter Links */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          {proj.liveDemoUrl && (
                            <a 
                              href={proj.liveDemoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ 
                                fontSize: '0.78rem', 
                                color: '#38bdf8', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                textDecoration: 'none',
                                fontWeight: 600 
                              }}
                            >
                              <ExternalLink size={13} />
                              <span>Live Cloud Demo</span>
                            </a>
                          )}
                          {proj.repoUrl && (
                            <a 
                              href={proj.repoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ 
                                fontSize: '0.78rem', 
                                color: '#a5b4fc', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                textDecoration: 'none',
                                fontWeight: 600 
                              }}
                            >
                              <GithubIcon size={13} />
                              <span>Source Code</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className={`btn btn-sm ${isPublished ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => handleToggleProjectPublish(proj)}
                        >
                          {isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span>{isPublished ? 'Published' : 'Hidden'}</span>
                        </button>
                        {onTakeViva && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onTakeViva({
                              id: proj.id,
                              title: proj.title,
                              issuer: (proj.techStack || []).join(', ') || 'Engineering Project',
                              category: 'project',
                              rawOcrText: `${proj.title} ${proj.description || ''} ${(proj.techStack || []).join(' ')}`,
                              description: proj.description,
                              vivaScore: proj.vivaScore
                            })}
                            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.08)' }}
                            title="Take AI Viva Exam on this project"
                          >
                            <BookOpen size={13} />
                            <span>{proj.vivaScore !== undefined ? `⭐ ${proj.vivaScore}%` : 'Take Viva'}</span>
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditingProject(proj);
                            setIsProjectModalOpen(true);
                          }}
                          title="Edit Project"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeleteProject(proj.id)}
                          style={{ color: '#fb7185' }}
                          title="Delete Project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Code size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No Projects Added Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Showcase your software applications, cloud architectures, and GitHub repositories with live links.
              </p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingProject(null);
                  setIsProjectModalOpen(true);
                }}
              >
                <Plus size={14} />
                <span>Add Your First Project</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: VERIFIED CREDENTIALS SELECTION */}
      {activeSection === 'certificates' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Published Credentials Selection</h3>
              <p className="card-subtitle">
                Choose which certificates are displayed on your public portfolio ({publishedCertsCount} of {certificates.length} published)
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
                      {onTakeViva && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onTakeViva(cert)}
                          style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.08)' }}
                          title="Take AI Viva Exam on this credential"
                        >
                          <BookOpen size={13} />
                          <span>{cert.vivaScore !== undefined ? `⭐ ${cert.vivaScore}%` : 'Take Viva'}</span>
                        </button>
                      )}
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
      )}

      {/* SECTION 3: INTERNSHIP & WORK EXPERIENCE */}
      {activeSection === 'experience' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title">Internships & Professional Experience</h3>
              <p className="card-subtitle">
                Highlight industrial training, internships, and technical roles
              </p>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingExp(null);
                setIsExpModalOpen(true);
              }}
            >
              <Plus size={15} />
              <span>Add Experience</span>
            </button>
          </div>

          {experiences.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {experiences.map(exp => {
                const isPublished = exp.isPublished !== false;
                return (
                  <div 
                    key={exp.id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: `1px solid ${isPublished ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                          {exp.role}
                        </span>
                        <span style={{
                          fontSize: '0.78rem',
                          color: '#34d399',
                          fontWeight: 600
                        }}>
                          @ {exp.company}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {exp.duration} {exp.location ? `• ${exp.location}` : ''}
                      </div>
                      {exp.description && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
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
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-muted)'
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditingExp(exp);
                          setIsExpModalOpen(true);
                        }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDeleteExperience(exp.id)}
                        style={{ color: '#fb7185' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Briefcase size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No Experience Added Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Add your summer internships, industrial training, or student club developer positions.
              </p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingExp(null);
                  setIsExpModalOpen(true);
                }}
              >
                <Plus size={14} />
                <span>Add First Experience</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
        studentGithubUrl={userProfile?.github || ''}
      />

      <ExperienceModal 
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        onSave={handleSaveExperience}
        experience={editingExp}
      />

      {/* ATS Resume Export Modal */}
      <ResumeExportModal 
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profile={effectiveProfile}
        certificates={certificates}
        projects={projects}
        experiences={experiences}
      />

      {/* Target Role Readiness Modal */}
      <RoleAnalyzerModal 
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        profile={effectiveProfile}
        certificates={certificates}
        projects={projects}
      />
    </div>
  );
};
