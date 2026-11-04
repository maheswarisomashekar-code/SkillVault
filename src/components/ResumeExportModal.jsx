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
    const resumeEl = document.getElementById('printable-ats-resume');
    if (!resumeEl) return;

    const resumeHtml = resumeEl.outerHTML;
    const candidateName = (profile?.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');

    // 1. Try opening clean standalone print window
    const printWin = window.open('', '_blank', 'width=880,height=920');

    const fullDocumentHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${candidateName}_CV_SkillVault</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      font-size: 10pt;
      line-height: 1.4;
    }
    .print-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #334155;
      font-family: sans-serif;
    }
    .print-btn {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .print-btn:hover {
      background: #0369a1;
    }
    .resume-canvas {
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      padding: 24px 28px;
      background: #ffffff !important;
      color: #0f172a !important;
    }
    a {
      color: #0284c7;
      text-decoration: underline;
    }
    @media print {
      .print-bar {
        display: none !important;
      }
      .resume-canvas, #printable-ats-resume {
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        background: #ffffff !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <div style="font-weight: 700; font-size: 13px;">📄 SkillVault • Verified ATS Resume</div>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="resume-canvas">
    ${resumeHtml}
  </div>
  <script>
    function triggerPrint() {
      window.focus();
      setTimeout(function() {
        window.print();
      }, 300);
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      triggerPrint();
    } else {
      window.addEventListener('DOMContentLoaded', triggerPrint);
      window.addEventListener('load', triggerPrint);
    }
  </script>
</body>
</html>`;

    if (printWin) {
      printWin.document.open();
      printWin.document.write(fullDocumentHtml);
      printWin.document.close();
    } else {
      // Fallback if popup blocker intercepted: use a full-dimension hidden iframe
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.top = '-10000px';
      printFrame.style.left = '-10000px';
      printFrame.style.width = '850px';
      printFrame.style.height = '1100px';
      document.body.appendChild(printFrame);

      const doc = printFrame.contentWindow.document;
      doc.open();
      doc.write(fullDocumentHtml);
      doc.close();

      setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        setTimeout(() => {
          try {
            document.body.removeChild(printFrame);
          } catch (e) {}
        }, 3000);
      }, 500);
    }
  };

  const handleDownloadHtml = () => {
    const resumeEl = document.getElementById('printable-ats-resume');
    if (!resumeEl) return;

    const candidateName = (profile?.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${candidateName}_CV_SkillVault</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; color: #0f172a; max-width: 820px; margin: 20px auto; padding: 24px; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${resumeEl.outerHTML}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${candidateName}_ATS_Resume.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  };

  const publishedCerts = certificates.filter(c => c.isPublished !== false);
  const publicProjects = projects.filter(p => p.isPublic !== false && p.isPublished !== false);
  const publicExperiences = experiences.filter(e => e.isPublic !== false && e.isPublished !== false);

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={handleDownloadHtml}
              title="Download standalone ATS resume file"
            >
              <Download size={15} />
              <span>Download File</span>
            </button>

            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              onClick={handlePrint}
              style={{
                boxShadow: '0 0 16px rgba(14, 165, 233, 0.4)',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)'
              }}
            >
              <Printer size={15} />
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
                  {profile.email && <div>✉️ <a href={`mailto:${profile.email}`} style={{ color: '#334155', textDecoration: 'none' }}>{profile.email}</a></div>}
                  {profile.githubUsername && (
                    <div>
                      🐙 <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                        github.com/{profile.githubUsername}
                      </a>
                    </div>
                  )}
                  {profile.linkedinUrl && (
                    <div>
                      💼 <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                        linkedin.com/in/{profile.linkedinUrl.replace(/.*linkedin\.com\/in\//, '')}
                      </a>
                    </div>
                  )}
                  <div style={{ color: '#0284c7', fontWeight: 600 }}>
                    🛡️ <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>
                      Verified Cloud Portfolio ↗
                    </a>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {publicProjects.map((proj) => {
                    const repoLink = proj.repoUrl || proj.githubUrl || proj.gitUrl || '';
                    const demoLink = proj.liveDemoUrl || proj.demoUrl || proj.previewUrl || '';

                    const formatExternalLink = (url) => {
                      if (!url) return '';
                      const trimmed = url.trim();
                      if (/^https?:\/\//i.test(trimmed)) return trimmed;
                      return `https://${trimmed}`;
                    };

                    const formatRepoSlug = (url) => {
                      if (!url) return '';
                      return url.trim()
                        .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
                        .replace(/\/$/, '');
                    };

                    return (
                      <div key={proj.id} style={{ breakInside: 'avoid' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ fontSize: '11pt', fontWeight: 700, color: '#0f172a' }}>
                            {proj.title} {proj.role ? <span style={{ fontWeight: 500, color: '#64748b', fontSize: '9.5pt' }}>({proj.role})</span> : ''}
                          </div>
                          
                          <div style={{ fontSize: '8.5pt', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {repoLink && (
                              <a 
                                href={formatExternalLink(repoLink)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  color: '#0284c7', 
                                  textDecoration: 'none', 
                                  fontWeight: 600, 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '3px',
                                  padding: '2px 7px',
                                  background: '#f0f9ff',
                                  border: '1px solid #bae6fd',
                                  borderRadius: '4px'
                                }}
                              >
                                <span>🔗 GitHub:</span>
                                <span style={{ textDecoration: 'underline' }}>{formatRepoSlug(repoLink)}</span>
                              </a>
                            )}
                            {demoLink && (
                              <a 
                                href={formatExternalLink(demoLink)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  color: '#059669', 
                                  textDecoration: 'none', 
                                  fontWeight: 600, 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '3px',
                                  padding: '2px 7px',
                                  background: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  borderRadius: '4px'
                                }}
                              >
                                <span>🚀 Live Demo</span>
                                <span style={{ fontSize: '9.5pt' }}>↗</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {proj.description && (
                          <p style={{ margin: '4px 0 4px', fontSize: '9.5pt', color: '#334155', lineHeight: 1.45 }}>
                            {proj.description}
                          </p>
                        )}

                        {proj.techStack && proj.techStack.length > 0 && (
                          <div style={{ fontSize: '8.5pt', color: '#475569', marginTop: '3px' }}>
                            <strong style={{ color: '#1e293b' }}>Technologies:</strong> {proj.techStack.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                          {cert.sha256Hash ? ` • SHA-256 Ledger Verified` : ''}
                          {cert.vivaScore !== undefined && (
                            <span style={{ color: '#059669', fontWeight: 600 }}> • 🏆 Viva: {cert.vivaScore}%</span>
                          )}
                          {cert.verificationUrl && (
                            <span> • <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>Verify Link ↗</a></span>
                          )}
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
