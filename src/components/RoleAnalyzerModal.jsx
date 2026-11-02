import React, { useState } from 'react';
import { 
  X, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Award, 
  Cloud, 
  Terminal, 
  Code, 
  Cpu, 
  ShieldCheck,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { TARGET_ROLES, analyzeRoleReadiness } from '../services/roleAnalyzerService';

export const RoleAnalyzerModal = ({ 
  isOpen, 
  onClose, 
  profile, 
  certificates = [], 
  projects = [] 
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState('cloud-architect');

  if (!isOpen) return null;

  const analysis = analyzeRoleReadiness(selectedRoleId, profile, certificates, projects);

  const getRoleIcon = (iconName) => {
    switch (iconName) {
      case 'Terminal': return <Terminal size={18} />;
      case 'Code': return <Code size={18} />;
      case 'Cpu': return <Cpu size={18} />;
      case 'ShieldCheck': return <ShieldCheck size={18} />;
      default: return <Cloud size={18} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '860px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.25)'
            }}>
              <Target size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Target Role & Cloud Readiness Analyzer</span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontWeight: 600
                }}>
                  AI Skill Matrix
                </span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Evaluates your verified credentials and engineering projects against industry job benchmarks
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          padding: '14px 24px',
          background: 'var(--bg-main)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {TARGET_ROLES.map((r) => {
            const isSelected = r.id === selectedRoleId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoleId(r.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-surface)',
                  color: isSelected ? '#c7d2fe' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                {getRoleIcon(r.icon)}
                <span>{r.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Readiness Score Card */}
          <div style={{
            padding: '22px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), var(--bg-surface-elevated))',
            border: `1px solid ${analysis.statusColor}50`,
            marginBottom: '24px',
            boxShadow: `0 8px 30px -10px ${analysis.statusColor}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: `${analysis.statusColor}20`,
                  color: analysis.statusColor,
                  fontWeight: 700,
                  border: `1px solid ${analysis.statusColor}40`
                }}>
                  {analysis.badgeText}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Level: {analysis.role.level}
                </span>
              </div>

              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {analysis.role.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                {analysis.role.description}
              </p>
            </div>

            {/* Score Ring / Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: `conic-gradient(${analysis.statusColor} ${analysis.score * 3.6}deg, rgba(255, 255, 255, 0.08) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${analysis.statusColor}40`
              }}>
                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: analysis.statusColor, lineHeight: 1 }}>
                    {analysis.score}%
                  </span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Match
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: analysis.statusColor }}>
                  {analysis.statusLabel}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {analysis.matchedSkills.length} of {analysis.totalRequired} core competencies verified
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Grid: Matched Skills vs Skill Gaps */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Validated Skills */}
            <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Validated Competencies ({analysis.matchedSkills.length})
                </h5>
              </div>

              {analysis.matchedSkills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.matchedSkills.map((skill, idx) => (
                    <span 
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: '#34d399',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>✓</span>
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  Upload certificates or tag projects to validate skills for this role.
                </p>
              )}
            </div>

            {/* Missing Skills / Gaps */}
            <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <AlertCircle size={18} style={{ color: '#f59e0b' }} />
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Recommended Competencies to Acquire ({analysis.missingSkills.length})
                </h5>
              </div>

              {analysis.missingSkills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.missingSkills.map((skill, idx) => (
                    <span 
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: '#fbbf24',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>+</span>
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                  🎉 Outstanding! You have satisfied 100% of benchmark skills for this role.
                </div>
              )}
            </div>
          </div>

          {/* Recommended Cloud Certification Roadmap */}
          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BookOpen size={18} style={{ color: '#818cf8' }} />
              <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Curated Certification Roadmap for {analysis.role.title}
              </h5>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Earning one of these globally recognized certifications will bridge missing competencies and maximize recruiter callbacks:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analysis.recommendedCerts.map((cert, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {cert.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Authority: {cert.issuer}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    fontWeight: 600
                  }}>
                    Recommended Next
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-surface)'
        }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
