import React from 'react';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  Building, 
  ExternalLink, 
  Globe, 
  Lock,
  FileText
} from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { VerificationBadge } from './VerificationBadge';

export const CertificateCard = ({ certificate, onPreview, onEdit, onDelete }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Top Media / Thumbnail Preview */}
      <div 
        onClick={() => onPreview(certificate)}
        style={{
          height: '160px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        {certificate.fileUrl ? (
          certificate.fileType === 'application/pdf' ? (
            <div style={{ textAlign: 'center', color: '#0ea5e9' }}>
              <FileText size={40} style={{ margin: '0 auto 8px' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF Document</span>
            </div>
          ) : (
            <img 
              src={certificate.fileUrl} 
              alt={certificate.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Image</div>
        )}

        {/* Hover overlay hint */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.82rem'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        >
          <Eye size={16} />
          <span>Click to Preview</span>
        </div>

        {/* Portfolio Status Pill */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '3px 8px',
          borderRadius: '9999px',
          background: certificate.isPublished ? 'rgba(16, 185, 129, 0.85)' : 'rgba(30, 41, 59, 0.85)',
          backdropFilter: 'blur(4px)',
          color: '#ffffff',
          fontSize: '0.7rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {certificate.isPublished ? <Globe size={11} /> : <Lock size={11} />}
          <span>{certificate.isPublished ? 'Public' : 'Private'}</span>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <CategoryBadge category={certificate.category} />
        <VerificationBadge status={certificate.verificationStatus} />
      </div>

      {/* Title & Metadata */}
      <h4 
        onClick={() => onPreview(certificate)}
        title={certificate.title}
        style={{
          fontSize: '1.02rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          cursor: 'pointer',
          lineHeight: 1.35,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {certificate.title}
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building size={14} style={{ color: 'var(--text-muted)' }} />
          <span>{certificate.issuer}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <span>{certificate.issueDate || 'Date unspecified'}</span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onPreview(certificate)}
            title="Inspect Details & OCR Diagnostics"
          >
            <Eye size={14} />
            <span>View</span>
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(certificate)}
            title="Edit Details"
          >
            <Edit3 size={14} />
          </button>
        </div>

        <button 
          onClick={() => onDelete(certificate)}
          style={{
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fb7185'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          title="Delete from Cloud"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
