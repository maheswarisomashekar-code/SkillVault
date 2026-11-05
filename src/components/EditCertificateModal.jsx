import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Edit3 } from 'lucide-react';
import { updateCertificateRecord } from '../services/certificateService';
import { normalizeToIsoDate } from '../services/ocrService';

export const EditCertificateModal = ({ certificate, isOpen, onClose, onSaveSuccess }) => {
  if (!isOpen || !certificate) return null;

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: certificate.title || '',
    issuer: certificate.issuer || '',
    recipient: certificate.recipient || '',
    category: certificate.category || 'course',
    issueDate: normalizeToIsoDate(certificate.issueDate) || certificate.issueDate || '',
    verificationUrl: certificate.verificationUrl || '',
    credentialId: certificate.credentialId || '',
    isPublished: certificate.isPublished !== undefined ? certificate.isPublished : true,
    verificationStatus: certificate.verificationStatus || 'OCR_PROCESSED'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateCertificateRecord(certificate.id, formData);
      setSaving(false);
      if (onSaveSuccess) onSaveSuccess({ ...certificate, ...updated });
      onClose();
    } catch (err) {
      console.error('Failed to update certificate:', err);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(14, 165, 233, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Edit Credential Details
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Update title, category, and public portfolio availability
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="form-group">
            <label className="form-label">Certificate Title *</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Issuing Organization *</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recipient / Student Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                placeholder="Student name on certificate"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="course">Course / Specialization</option>
                <option value="internship">Internship</option>
                <option value="hackathon">Hackathon</option>
                <option value="academic">Academic Achievement</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other Credential</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input 
                type="date" 
                className="form-input"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Credential ID</label>
              <input 
                type="text" 
                className="form-input"
                value={formData.credentialId}
                onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Verification Status</label>
              <select 
                className="form-select"
                value={formData.verificationStatus}
                onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
              >
                <option value="VERIFIED">🟢 Verified</option>
                <option value="PENDING_REVIEW">🟡 Pending Review</option>
                <option value="OCR_PROCESSED">🔵 OCR Scanned</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Issuer Verification Link (URL)</label>
            <input 
              type="url" 
              className="form-input"
              value={formData.verificationUrl}
              onChange={(e) => setFormData({ ...formData, verificationUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Publish on Public Portfolio
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                When enabled, recruiters and visitors can view this certificate.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="spin-animation" /> : <CheckCircle2 size={16} />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
