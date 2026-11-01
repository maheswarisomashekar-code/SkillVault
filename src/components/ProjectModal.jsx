import React, { useState, useEffect } from 'react';
import { 
  X, 
  Code, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Sparkles
} from 'lucide-react';
import { GithubIcon } from './BrandIcons';
import { verifyRepoOwnership } from '../services/projectService';

export const ProjectModal = ({ isOpen, onClose, onSave, project = null, studentGithubUrl = '' }) => {
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    role: '',
    description: '',
    techStack: [],
    techStackInput: '',
    liveDemoUrl: '',
    repoUrl: '',
    previewImageUrl: '',
    isPublished: true
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        tagline: project.tagline || '',
        role: project.role || '',
        description: project.description || '',
        techStack: project.techStack || [],
        techStackInput: (project.techStack || []).join(', '),
        liveDemoUrl: project.liveDemoUrl || '',
        repoUrl: project.repoUrl || '',
        previewImageUrl: project.previewImageUrl || '',
        isPublished: project.isPublished !== false
      });
    } else {
      setFormData({
        title: '',
        tagline: '',
        role: 'Lead Developer',
        description: '',
        techStack: [],
        techStackInput: '',
        liveDemoUrl: '',
        repoUrl: '',
        previewImageUrl: '',
        isPublished: true
      });
    }
    setError('');
  }, [project, isOpen]);

  if (!isOpen) return null;

  const repoCheck = verifyRepoOwnership(formData.repoUrl, studentGithubUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a project title.');
      return;
    }

    if (!formData.liveDemoUrl && !formData.repoUrl) {
      setError('Recruiters need verifiable access! Please provide at least a Live Demo Link or a GitHub Repository Link.');
      return;
    }

    // Process comma separated tech stack
    const parsedTech = formData.techStackInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    setSaving(true);
    try {
      await onSave({
        ...formData,
        techStack: parsedTech,
        isVerifiedRepo: repoCheck.isVerified
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
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
              <Code size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {project ? 'Edit Engineering Project' : 'Add Verifiable Engineering Project'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Provide live demo and GitHub source code links for recruiter verification
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder="e.g. Cloud Credential & Digital Portfolio Platform"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Role / Contribution *</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder="e.g. Lead Cloud Architect, Full Stack"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Short Tagline / Summary</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Serverless web app with smart OCR document parsing and verified public portfolios"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Technical Description & Architecture</label>
            <textarea 
              className="form-textarea" 
              rows={3}
              placeholder="Describe what the project does, key challenges solved, cloud architecture (storage, database, auth), and system performance..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Technologies & Tools (comma-separated)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. React, Firebase, Cloud Storage, Tesseract OCR, Docker, Node.js"
              value={formData.techStackInput}
              onChange={(e) => setFormData({ ...formData, techStackInput: e.target.value })}
            />
          </div>

          {/* Verification Links for Recruiters */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} />
              <span>Recruiter Proof & Access Links</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Live Cloud Demo / Deployed App URL</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://app.vercel.app or Firebase URL"
                    value={formData.liveDemoUrl}
                    onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                    style={{ paddingLeft: '36px' }}
                  />
                  <ExternalLink size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">GitHub Source Code Repository</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://github.com/username/project"
                    value={formData.repoUrl}
                    onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                    style={{ paddingLeft: '36px' }}
                  />
                  <div style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
                    <GithubIcon size={15} />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Verification Indicator */}
            {formData.repoUrl && (
              <div style={{ marginTop: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {repoCheck.isVerified ? (
                  <span style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} />
                    Verified: Repository owner matches your registered GitHub handle ({repoCheck.repoOwner})
                  </span>
                ) : repoCheck.status === 'OWNER_MISMATCH' ? (
                  <span style={{ color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={13} />
                    Notice: Repo owner ({repoCheck.repoOwner}) differs from your profile handle ({repoCheck.studentOwner})
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>
                    Tip: Add your GitHub profile in Student Profile so recruiters see the "Verified Owner" badge.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Visibility Checkbox */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Publish Project to Public Portfolio
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Show this project with live links to evaluators and recruiters
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#0ea5e9', cursor: 'pointer' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <CheckCircle2 size={16} />
              <span>{saving ? 'Saving...' : (project ? 'Save Changes' : 'Add Project')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
