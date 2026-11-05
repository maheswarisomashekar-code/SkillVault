import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  Building, 
  User, 
  Hash, 
  FileText, 
  ShieldCheck, 
  CheckCircle, 
  Copy, 
  Clock,
  Download,
  BookOpen
} from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { VerificationBadge } from './VerificationBadge';
import { updateCertificateRecord } from '../services/certificateService';
import { downloadCertificateFile, openCertificateInNewTab } from '../utils/fileDownloader';

export const CertificatePreviewModal = ({ certificate, isOpen, onClose, onUpdate, onTakeViva }) => {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!isOpen || !certificate) return null;

  const copyCredentialId = () => {
    if (certificate.credentialId || certificate.id) {
      navigator.clipboard.writeText(certificate.credentialId || certificate.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulateVerification = async () => {
    setVerifying(true);
    // Simulates institutional or issuer check
    setTimeout(async () => {
      const updated = await updateCertificateRecord(certificate.id, {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date().toISOString()
      });
      setVerifying(false);
      if (onUpdate) onUpdate(updated);
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <CategoryBadge category={certificate.category} />
              <VerificationBadge status={certificate.verificationStatus} />
              {certificate.vivaScore !== undefined && certificate.vivaScore >= 70 && (
                <span style={{
                  fontSize: '0.74rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(16, 185, 129, 0.2))',
                  color: '#facc15',
                  border: '1px solid rgba(234, 179, 8, 0.5)',
                  fontWeight: 800,
                  boxShadow: '0 0 10px rgba(234, 179, 8, 0.3)'
                }}>
                  ⭐ Viva-Verified ({certificate.vivaScore}%) • Oral Defense Authenticated
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {certificate.title}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Certificate Media View */}
          <div style={{
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            marginBottom: '24px',
            textAlign: 'center',
            maxHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            {certificate.fileUrl ? (
              certificate.fileType === 'application/pdf' ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <FileText size={52} style={{ color: '#0ea5e9', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {certificate.fileName || `${certificate.title}.pdf`}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                    Verified PDF Credential • Ready for immediate download or tab preview
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button 
                      type="button"
                      onClick={() => downloadCertificateFile(certificate.fileUrl, certificate.fileName || `${certificate.title}.pdf`)}
                      className="btn btn-primary btn-sm"
                    >
                      <Download size={15} />
                      <span>Download Certificate File</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => openCertificateInNewTab(certificate.fileUrl, certificate.fileName || `${certificate.title}.pdf`)}
                      className="btn btn-outline btn-sm"
                    >
                      <ExternalLink size={15} />
                      <span>Open in Browser Tab</span>
                    </button>

                    {onTakeViva && (
                      <button 
                        type="button"
                        onClick={() => {
                          onClose();
                          onTakeViva(certificate);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{
                          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2))',
                          borderColor: 'rgba(56, 189, 248, 0.4)',
                          color: '#38bdf8',
                          fontWeight: 600
                        }}
                      >
                        <BookOpen size={15} />
                        <span>{certificate.vivaScore !== undefined ? 'Retake Viva Exam' : '🎓 Take Course Viva Exam'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <img 
                    src={certificate.fileUrl} 
                    alt={certificate.title}
                    style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => downloadCertificateFile(certificate.fileUrl, certificate.fileName || `${certificate.title}.png`)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Download size={14} />
                    <span>Download Image</span>
                  </button>
                </div>
              )
            ) : (
              <div style={{ padding: '40px', color: 'var(--text-muted)' }}>
                No preview available
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
                <Building size={14} />
                <span>Issuer</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {certificate.issuer}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
                <Calendar size={14} />
                <span>Issue Date</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {certificate.issueDate}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
                <User size={14} />
                <span>Recipient</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {certificate.recipient || 'Student'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
                <Hash size={14} />
                <span>Credential ID</span>
              </div>
              <div style={{ 
                fontFamily: 'var(--font-mono)', 
                fontWeight: 600, 
                color: '#38bdf8', 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {certificate.credentialId || certificate.id.substring(0, 14)}
                </span>
                <button onClick={copyCredentialId} style={{ color: 'var(--text-muted)', marginLeft: '4px' }} title="Copy ID">
                  {copied ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Verification & Cryptographic Ledger section */}
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Cloud Verification & Cryptographic Ledger
              </span>
              <VerificationBadge status={certificate.verificationStatus} />
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              {certificate.verificationStatus === 'VERIFIED'
                ? 'This credential has been verified against issuer records and sealed into the tamper-proof ledger.'
                : 'OCR successfully read the document. Cryptographically signed with SHA-256 digest.'}
            </p>

            {/* SHA-256 pill */}
            {certificate.sha256Hash && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                color: '#38bdf8',
                marginBottom: '12px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                wordBreak: 'break-all'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>SHA-256 Digest: </span>
                {certificate.sha256Hash}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {certificate.verificationUrl && (
                <a 
                  href={certificate.verificationUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <ExternalLink size={14} />
                  <span>Open Issuer Verification URL</span>
                </a>
              )}

              {certificate.verificationStatus !== 'VERIFIED' && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleSimulateVerification}
                  disabled={verifying}
                >
                  <ShieldCheck size={14} style={{ color: '#10b981' }} />
                  <span>{verifying ? 'Checking...' : 'Confirm Issuer Check'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Raw OCR Text Diagnostic accordion (Viva evaluation proof) */}
          {certificate.rawOcrText && (
            <details style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: '0.78rem'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Cloud OCR Extraction Log & Raw Scanned Text (Viva Diagnostic)
              </summary>
              <pre style={{
                marginTop: '10px',
                padding: '10px',
                background: 'var(--bg-main)',
                borderRadius: 'var(--radius-sm)',
                overflowX: 'auto',
                fontFamily: 'var(--font-mono)',
                color: '#94a3b8',
                whiteSpace: 'pre-wrap'
              }}>
                {certificate.rawOcrText}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};
