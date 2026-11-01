import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar 
} from 'lucide-react';

export const ExperienceModal = ({ isOpen, onClose, onSave, experience = null }) => {
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    duration: '',
    location: '',
    description: '',
    skillsInput: '',
    isPublished: true
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (experience) {
      setFormData({
        role: experience.role || '',
        company: experience.company || '',
        duration: experience.duration || '',
        location: experience.location || '',
        description: experience.description || '',
        skillsInput: (experience.skills || []).join(', '),
        isPublished: experience.isPublished !== false
      });
    } else {
      setFormData({
        role: '',
        company: '',
        duration: '',
        location: 'Remote / Hybrid',
        description: '',
        skillsInput: '',
        isPublished: true
      });
    }
    setError('');
  }, [experience, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role.trim() || !formData.company.trim()) {
      setError('Please provide role and company name.');
      return;
    }

    const parsedSkills = formData.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    setSaving(true);
    try {
      await onSave({
        ...formData,
        skills: parsedSkills
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
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
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Briefcase size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {experience ? 'Edit Internship / Experience' : 'Add Internship or Work Experience'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Record your industrial training, internship roles, and technical contributions
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Role / Job Title *</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder="e.g. Cloud Engineering Intern"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company / Organization *</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder="e.g. Infosys, Wipro, Startup..."
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Duration / Period</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. June 2026 - August 2026 (3 months)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / Mode</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Bangalore / Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Key Responsibilities & Achievements</label>
            <textarea 
              className="form-textarea" 
              rows={3}
              placeholder="Highlight technical achievements, tools used, and production impact..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Tools & Technologies Utilized (comma-separated)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Docker, Kubernetes, Python, CI/CD, Terraform"
              value={formData.skillsInput}
              onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
            />
          </div>

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
                Publish Experience on Public Portfolio
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Make this professional experience visible to recruiters
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#0ea5e9', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <CheckCircle2 size={16} />
              <span>{saving ? 'Saving...' : (experience ? 'Save Changes' : 'Add Experience')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
