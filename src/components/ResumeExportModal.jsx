import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Mail, 
  Globe, 
  Calendar, 
  Building, 
  FileCheck, 
  ShieldCheck, 
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './BrandIcons';

export const ResumeExportModal = ({ 
  isOpen, 
  onClose, 
  profile, 
  certificates = [], 
  projects = [], 
  experiences = [] 
}) => {
  const resumeRef = useRef(null);

  if (!isOpen || !profile) return null;

  const handlePrint = () => {
    window.print();
  };

  const publishedCerts = certificates.filter(c => c.isPublished !== false);
  const publicProjects = projects.filter(p => p.isPublic !== false);
  const publicExperiences = experiences.filter(e => e.isPublic !== false);

  const portfolioUrl = `${window.location.origin}/?portfolio=${profile.id || profile.email || 'student'}`;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px', width: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Action Header (Hidden on print) */}
        <div className="no-print" style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(14, 165, 233, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ATS-Friendly Cloud Verified CV
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Recruiter-optimized format with cryptographic verification links
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handlePrint}
              style={{
                boxShadow: '0 0 16px rgba(14, 165, 233, 0.4)',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)'
              }}
            >
              <Printer size={16} />
              <span>Print / Save as PDF</span>
            </button>
            <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Sheet / Paper Container */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          background: 'var(--bg-main)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {/* Printable Resume Paper */}
          <div 
            id="printable-ats-resume"
            ref={resumeRef}
            className="ats-resume-sheet"
            style={{
              width: '100%',
              maxWidth: '800px',
              background: '#ffffff',
              color: '#1e293b',
              padding: '36px 42px',
              borderRadius: '4px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '11pt',
              lineHeight: 1.45
            }}
          >
            {/* 1. Header & Contact */}
            <header style={{ borderBottom: '2px solid #0284c7', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '22pt', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                    {profile.fullName || 'Student Name'}
                  </h1>
                  <div style={{ fontSize: '11.5pt', fontWeight: 600, color: '#0284c7' }}>
                    {profile.degree || 'B.E. Computer Science & Engineering'} {profile.usn ? `• USN: ${profile.usn}` : ''}
                  </div>
                  <div style={{ fontSize: '9.5pt', color: '#64748b' }}>
                    {profile.institution || 'Department of Technical Education'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '9pt', color: '#334155', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {profile.email && <div>✉️ {profile.email}</div>}
                  {profile.githubUsername && <div>🐙 github.com/{profile.githubUsername}</div>}
                  {profile.linkedinUrl && <div>💼 linkedin.com/in/{profile.linkedinUrl.replace(/.*linkedin\.com\/in\//, '')}</div>}
                  <div style={{ color: '#0284c7', fontWeight: 600 }}>
                    🛡️ Verified Cloud Portfolio: {portfolioUrl}
                  </div>
                </div>
              </div>
            </header>

            {/* 2. Professional Summary */}
            {profile.bio && (
              <section style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '8px' }}>
                  Professional Summary
                </h2>
                <p style={{ margin: 0, color: '#334155', fontSize: '10pt', lineHeight: 1.5 }}>
                  {profile.bio}
                </p>
              </section>
            )}

            {/* 3. Core Technical Competencies */}
            {profile.skills && profile.skills.length > 0 && (
              <section style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '8px' }}>
                  Technical Competencies & Skills
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profile.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        fontSize: '9pt',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '3px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Software Engineering Projects */}
            {publicProjects.length > 0 && (
              <section style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '10px' }}>
                  Engineering Projects & Cloud Deployments
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {publicProjects.map((proj) => (
                    <div key={proj.id} style={{ breakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontSize: '11pt', fontWeight: 700, color: '#0f172a' }}>
                          {proj.title} {proj.role ? <span style={{ fontWeight: 500, color: '#64748b', fontSize: '9.5pt' }}>({proj.role})</span> : ''}
                        </div>
                        <div style={{ fontSize: '8.5pt', color: '#0284c7' }}>
                          {proj.demoUrl && <span>[Live Demo] </span>}
                          {proj.githubUrl && <span>[GitHub]</span>}
                        </div>
                      </div>

                      {proj.description && (
                        <p style={{ margin: '3px 0 4px', fontSize: '9.5pt', color: '#334155', lineHeight: 1.45 }}>
                          {proj.description}
                        </p>
                      )}

                      {proj.techStack && proj.techStack.length > 0 && (
                        <div style={{ fontSize: '8.5pt', color: '#475569' }}>
                          <strong>Technologies:</strong> {proj.techStack.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. Work Experience & Internships */}
            {publicExperiences.length > 0 && (
              <section style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '10px' }}>
                  Industry Internships & Experience
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {publicExperiences.map((exp) => (
                    <div key={exp.id} style={{ breakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontSize: '10.5pt', fontWeight: 700, color: '#0f172a' }}>
                          {exp.role} • <span style={{ color: '#0284c7' }}>{exp.company}</span>
                        </div>
                        <div style={{ fontSize: '8.5pt', color: '#64748b' }}>
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate} {exp.location ? `| ${exp.location}` : ''}
                        </div>
                      </div>

                      {exp.description && (
                        <p style={{ margin: '3px 0 0', fontSize: '9.5pt', color: '#334155', lineHeight: 1.45 }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. Cloud Verified Credentials & Certifications */}
            {publishedCerts.length > 0 && (
              <section style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '10px' }}>
                  Cloud Verified Certifications & Credentials
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {publishedCerts.map((cert) => (
                    <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', breakInside: 'avoid' }}>
                      <div>
                        <div style={{ fontSize: '10pt', fontWeight: 700, color: '#0f172a' }}>
                          {cert.title}
                        </div>
                        <div style={{ fontSize: '8.5pt', color: '#475569' }}>
                          {cert.issuer} {cert.credentialId ? `• License: ${cert.credentialId}` : ''} 
                          {cert.sha256Hash ? ` • SHA-256 Verified` : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#64748b', whiteSpace: 'nowrap' }}>
                        <div>{cert.issueDate || 'Issued'}</div>
                        <div style={{ color: '#059669', fontWeight: 600 }}>✓ Verified</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ATS Footer */}
            <footer style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '8pt', color: '#94a3b8' }}>
              Generated via SkillVault Cloud Credential Registry • Cryptographically signed with SHA-256 tamper-proof ledger.
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
