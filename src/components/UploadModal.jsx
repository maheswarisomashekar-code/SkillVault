import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  ExternalLink,
  ShieldAlert,
  Lock,
  UserX,
  XCircle,
  Bell,
  CalendarClock,
  Mail,
  Zap
} from 'lucide-react';
import { validateCertificateFile, uploadCertificateFile, createCertificateRecord } from '../services/certificateService';
import { runTesseractOCR } from '../services/ocrService';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const UploadModal = ({ isOpen, onClose, onUploadSuccess, existingCertificates = [] }) => {
  const { currentUser, userProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Upload & OCR states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stage, setStage] = useState('idle'); // 'idle' | 'uploading' | 'ocr' | 'review' | 'saving'
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const [isLikelyCertificate, setIsLikelyCertificate] = useState(true);
  const [detectedDocumentType, setDetectedDocumentType] = useState('CERTIFICATE');
  const [detectedRecipient, setDetectedRecipient] = useState('');
  const [ocrWarnings, setOcrWarnings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Editable Form Fields
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    recipient: '',
    issueDate: '',
    expiryDate: '',
    enableExpiryReminder: false,
    category: 'course',
    description: '',
    credentialId: '',
    verificationUrl: '',
    isPublished: true,
    verificationStatus: 'OCR_PROCESSED'
  });

  const accountHolderName = userProfile?.fullName || currentUser?.displayName || '';

  // Cross-reference document ownership vs logged-in account
  const ownershipValidation = useMemo(() => {
    if (!accountHolderName || ['student candidate', 'student', 'candidate', 'demo student'].includes(accountHolderName.toLowerCase().trim())) {
      return { hasConflict: false };
    }

    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const getTokens = (s) => norm(s).split(' ').filter(t => t.length >= 3);

    const accountTokens = getTokens(accountHolderName);
    const inputTokens = getTokens(formData.recipient);
    const detectedTokens = getTokens(detectedRecipient);
    const rawTextNorm = norm(formData.rawOcrText);

    // Conflict Check 1: OCR detected a name from the document and it belongs to someone else
    if (detectedRecipient && detectedTokens.length > 0 && accountTokens.length > 0) {
      const matchFound = accountTokens.some(at => detectedTokens.includes(at));
      if (!matchFound) {
        return {
          hasConflict: true,
          detectedName: detectedRecipient,
          reason: `Document was issued to "${detectedRecipient}", which does not match your account name ("${accountHolderName}").`
        };
      }
    }

    // Conflict Check 2: User changed recipient to their name, but their name is NOT in the document text
    if (formData.recipient && rawTextNorm && inputTokens.length > 0 && detectedRecipient) {
      const inputExistsInDoc = inputTokens.some(it => rawTextNorm.includes(it));
      if (!inputExistsInDoc) {
        return {
          hasConflict: true,
          detectedName: detectedRecipient,
          reason: `The name "${formData.recipient}" does not appear anywhere in this document (Document indicates: "${detectedRecipient}").`
        };
      }
    }

    return { hasConflict: false };
  }, [accountHolderName, formData.recipient, detectedRecipient, formData.rawOcrText]);

  // Duplicate detection against existing vault records
  const duplicateValidation = useMemo(() => {
    if (!formData.title || !formData.issuer) return { isDuplicate: false, existingCert: null };
    const title = formData.title.trim().toLowerCase();
    const issuer = formData.issuer.trim().toLowerCase();
    const credId = (formData.credentialId || '').trim().toLowerCase();

    const match = (existingCertificates || []).find(c => {
      // 1. Same credential ID
      if (credId && c.credentialId && c.credentialId.trim().toLowerCase() === credId) return true;
      // 2. Same title and issuer
      if (title && issuer && c.title?.trim().toLowerCase() === title && c.issuer?.trim().toLowerCase() === issuer) return true;
      return false;
    });

    return {
      isDuplicate: Boolean(match),
      existingCert: match
    };
  }, [formData.title, formData.issuer, formData.credentialId, existingCertificates]);

  if (!isOpen) return null;

  const handleFile = (selectedFile) => {
    setErrorMessage('');
    const validation = validateCertificateFile(selectedFile);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    setFile(selectedFile);

    // Create preview
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      // PDF or non-image
      setFilePreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartProcessing = async () => {
    if (!file || !currentUser) return;
    setErrorMessage('');

    try {
      // Step 1: Upload to Cloud Storage
      setStage('uploading');
      setUploadProgress(10);

      const uploadResult = await uploadCertificateFile(
        file, 
        currentUser.uid, 
        (progress) => setUploadProgress(progress)
      );

      // Step 2: Trigger Genuine OCR Processing
      setStage('ocr');
      let extracted = null;
      let ocrSucceeded = false;

      try {
        // Tesseract can process image directly or via URL
        extracted = await runTesseractOCR(filePreview || file);
        ocrSucceeded = true;
      } catch (ocrErr) {
        console.warn('OCR processing encountered error; marking as unreadable:', ocrErr);
        extracted = {
          title: '',
          issuer: '',
          recipient: '',
          issueDate: '',
          category: 'other',
          confidenceScore: 0,
          isLikelyCertificate: false,
          documentType: 'RANDOM_IMAGE_OR_PHOTO',
          warnings: ['No readable certificate text detected in this image. Non-certificate photos, animals, and unreadable graphics are strictly rejected.']
        };
      }

      setOcrConfidence(extracted.confidenceScore || 0);
      setIsLikelyCertificate(extracted.isLikelyCertificate === true);
      setDetectedDocumentType(extracted.documentType || 'NON_CERTIFICATE_DOCUMENT');
      setDetectedRecipient(extracted.recipient || '');
      setOcrWarnings(extracted.warnings || []);

      // Auto-populate whatever fields OCR extracted (Tesseract.js runs free in browser)
      setFormData({
        title: extracted.title || '',
        issuer: extracted.issuer || '',
        recipient: extracted.recipient || '',
        issueDate: extracted.issueDate || '',
        expiryDate: extracted.expiryDate || '',
        enableExpiryReminder: Boolean(extracted.expiryDate),
        category: extracted.category || 'course',
        description: `Uploaded and scanned via SkillVault Cloud OCR on ${new Date().toLocaleDateString()}`,
        credentialId: extracted.credentialId || '',
        verificationUrl: extracted.verificationUrl || '',
        isPublished: extracted.isLikelyCertificate === true,
        verificationStatus: extracted.verificationUrl ? 'PENDING_REVIEW' : 'OCR_PROCESSED',
        fileUrl: uploadResult.downloadUrl,
        storagePath: uploadResult.storagePath,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        fileType: uploadResult.fileType,
        rawOcrText: extracted.rawText || '',
        ocrEngine: 'Tesseract.js (Client-Side $0 AWS Cost)'
      });

      setStage('review');
    } catch (err) {
      console.error('Upload & OCR failed:', err);
      setErrorMessage(`Upload error: ${err.message}`);
      setStage('idle');
    }
  };

  const handleSaveCertificate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer) {
      setErrorMessage('Please provide certificate title and issuing organization.');
      return;
    }

    // Strict Non-Certificate Rejection Guard (Blocks animal photos, problem statements, project reports, flyers)
    if (isLikelyCertificate !== true) {
      setErrorMessage(
        'Upload Blocked: Document rejected! SkillVault only accepts authentic educational and professional certificates with proof of conferment. Random photos (such as animal photos), competition problem statements, and project reports cannot be saved.'
      );
      return;
    }

    // Duplicate Credential Guard
    if (duplicateValidation.isDuplicate) {
      setErrorMessage(
        `Duplicate Blocked: This credential ("${duplicateValidation.existingCert?.title}") is already saved in your vault. Duplicate uploads are rejected to preserve clean records.`
      );
      return;
    }

    // Identity Ownership Validation Guard
    if (ownershipValidation.hasConflict) {
      setErrorMessage(
        `Upload Blocked: Credential Ownership Conflict! This document was issued to "${ownershipValidation.detectedName}", not "${accountHolderName}". SkillVault strictly forbids uploading or claiming other students' certificates.`
      );
      return;
    }

    try {
      setStage('saving');
      const savedRecord = await createCertificateRecord(currentUser.uid, {
        ...formData,
        confidenceScore: ocrConfidence || 75
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (_) {}

      if (onUploadSuccess) onUploadSuccess(savedRecord);
      handleReset();
      onClose();
    } catch (err) {
      console.error('Error saving record to Firestore:', err);
      setErrorMessage(`Failed to save certificate metadata: ${err.message}`);
      setStage('review');
    }
  };

  const handleReset = () => {
    setFile(null);
    setFilePreview(null);
    setStage('idle');
    setUploadProgress(0);
    setOcrConfidence(null);
    setDetectedRecipient('');
    setOcrWarnings([]);
    setErrorMessage('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(14, 165, 233, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {stage === 'review' ? 'Verify Extracted Metadata' : 'Upload Certificate to Cloud'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {stage === 'review' 
                  ? 'Review OCR readings and correct fields before saving to Firestore' 
                  : 'Files are stored in Cloud Storage and indexed with OCR text extraction'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {errorMessage && (
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
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STAGE 1: FILE PICKER */}
          {stage === 'idle' && (
            <div>
              {!file ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '48px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragActive ? 'rgba(14, 165, 233, 0.05)' : 'var(--bg-surface-elevated)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files && handleFile(e.dataTransfer?.files[0] || e.target.files[0])}
                  />
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(14, 165, 233, 0.12)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <UploadCloud size={28} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Click or drag certificate document here
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Supports PNG, JPG, WEBP and PDF certificates up to 10MB
                  </p>
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    {filePreview ? (
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                    ) : (
                      <div style={{
                        width: '80px',
                        height: '60px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(14, 165, 233, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8'
                      }}>
                        <FileText size={28} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                      </div>
                    </div>
                    <button 
                      onClick={() => setFile(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Change
                    </button>
                  </div>

                  <div style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(14, 165, 233, 0.08)',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.82rem',
                    color: '#38bdf8',
                    marginBottom: '20px'
                  }}>
                    <Sparkles size={16} />
                    <span>Cloud OCR engine will analyze this certificate and extract title, issuer, date, and credential ID automatically.</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={onClose}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleStartProcessing}>
                      <Sparkles size={16} />
                      <span>Process & Scan Document</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: UPLOAD & OCR PROGRESS */}
          {(stage === 'uploading' || stage === 'ocr') && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Loader2 size={40} className="spin-animation" style={{ color: '#0ea5e9', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {stage === 'uploading' ? 'Uploading to Cloud Storage...' : 'Analyzing Document with Smart OCR...'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {stage === 'uploading' 
                  ? `Transferring binary payload to Firebase Storage (${uploadProgress}%)`
                  : 'Recognizing text, dates, issuer authorities, and digital credential identifiers'}
              </p>

              <div style={{
                width: '100%',
                height: '8px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: '9999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: stage === 'uploading' ? `${uploadProgress}%` : '85%',
                  background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          )}

          {/* STAGE 3: REVIEW EXTRACTED FIELDS BEFORE SAVING */}
          {stage === 'review' && (
            <form onSubmit={handleSaveCertificate}>
              {/* Confidence & Legitimacy Banner */}
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: !isLikelyCertificate 
                  ? 'rgba(244, 63, 94, 0.12)' 
                  : (ocrConfidence > 70 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                border: `1px solid ${!isLikelyCertificate 
                  ? 'rgba(244, 63, 94, 0.35)' 
                  : (ocrConfidence > 70 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isLikelyCertificate ? (
                    <AlertTriangle size={20} style={{ color: '#fb7185' }} />
                  ) : (
                    <CheckCircle2 size={18} style={{ color: ocrConfidence > 70 ? '#34d399' : '#fbbf24' }} />
                  )}
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {!isLikelyCertificate ? 'Non-Academic Document Detected' : 'OCR Extraction Complete'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                      {!isLikelyCertificate 
                        ? 'Image contains no verifiable certificate or credential text. Unverified & unpublishable.' 
                        : `Confidence Score: ${ocrConfidence}% • Review and correct fields below`}
                    </span>
                  </div>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  color: !isLikelyCertificate ? '#fb7185' : 'var(--text-secondary)'
                }}>
                  {!isLikelyCertificate ? 'Rejected / Unverified' : 'Pre-Verification'}
                </div>
              </div>

              {ocrWarnings.length > 0 && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  fontSize: '0.78rem',
                  color: '#fbbf24',
                  marginBottom: '16px'
                }}>
                  {ocrWarnings.map((w, idx) => (
                    <div key={idx}>⚠️ {w}</div>
                  ))}
                </div>
              )}

              {/* Strict Non-Certificate Rejection Alert Banner */}
              {!isLikelyCertificate && (
                <div style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <XCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f87171', marginBottom: '4px' }}>
                      🚫 Upload Blocked: Non-Certificate Document Detected
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>
                      {detectedDocumentType === 'RANDOM_IMAGE_OR_PHOTO' ? (
                        <>
                          This file was identified as a <strong>random photo, animal image, landscape, or non-text graphic</strong>. SkillVault only accepts educational credentials and strictly rejects non-certificate images.
                        </>
                      ) : detectedDocumentType === 'PROJECT_REPORT_OR_DOCUMENT' ? (
                        <>
                          This document was identified as a <strong>Project Report, Table of Contents, or Academic Documentation</strong>. SkillVault is a verified credential vault and strictly rejects non-certificate files.
                        </>
                      ) : detectedDocumentType === 'EVENT_ANNOUNCEMENT_OR_BROCHURE' ? (
                        <>
                          This document was identified as a <strong>Competition Problem Statement, Event Announcement, or Rulesheet</strong> with registration details, not an individual completion certificate.
                        </>
                      ) : (
                        <>
                          This file lacks official certificate conferment proof (no "This is to certify that" or "Certificate of Completion"). Only genuine credential certificates can be uploaded.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Identity & Ownership Security Banner */}
              {ownershipValidation.hasConflict && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.45)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <ShieldAlert size={22} style={{ color: '#fb7185', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fb7185', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Credential Ownership Conflict Detected</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#f8fafc', marginTop: '4px', lineHeight: 1.5 }}>
                      This certificate was issued to <strong style={{ color: '#fb7185' }}>"{ownershipValidation.detectedName}"</strong>, but your logged-in profile name is <strong style={{ color: '#38bdf8' }}>"{accountHolderName}"</strong>.
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#fda4af', marginTop: '4px' }}>
                      🛡️ <strong>Anti-Impersonation Guard:</strong> To maintain defensible academic integrity, you cannot upload or publish credentials belonging to another individual.
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicate Credential Alert Banner */}
              {duplicateValidation.isDuplicate && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.14)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <AlertTriangle size={22} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24' }}>
                      Duplicate Credential Detected in Vault
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#f8fafc', marginTop: '4px', lineHeight: 1.5 }}>
                      A certificate with this title (<strong style={{ color: '#38bdf8' }}>"{duplicateValidation.existingCert?.title}"</strong>) from <strong style={{ color: '#38bdf8' }}>"{duplicateValidation.existingCert?.issuer}"</strong> is already saved in your vault.
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#fcd34d', marginTop: '4px' }}>
                      ⚠️ <strong>Deduplication Lock:</strong> Uploading the same certificate multiple times is blocked to keep your records clutter-free.
                    </div>
                  </div>
                </div>
              )}

              {/* In-Browser Tesseract.js Auto-Fill Callout ($0 AWS Cost) */}
              <div style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(16, 185, 129, 0.08))',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(14, 165, 233, 0.2)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <Zap size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>⚡ Auto-Filled by Tesseract.js (Client-Side OCR)</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      fontWeight: 700
                    }}>
                      $0 AWS Cost • 100% In-Browser
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    Tesseract.js runs directly in your browser via WebAssembly web workers for free — zero AWS Textract/Vision charges! Issuer, title, and dates are auto-filled so you don't type metadata for 20+ certificates. Review the extracted fields below and edit/correct any details as needed.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Certificate Title / Program Name *</label>
                    {formData.title && (
                      <span style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        ✨ Auto-filled from OCR (Click to edit)
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Google Cloud Certified Associate Cloud Engineer"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Issuing Organization / Authority *</label>
                    {formData.issuer && (
                      <span style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 600 }}>
                        ✨ Auto-filled
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={formData.issuer} 
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="e.g. Coursera, AWS, Google, NPTEL"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Recipient Name
                      {ownershipValidation.hasConflict ? (
                        <span style={{ color: '#fb7185', fontSize: '0.74rem', marginLeft: '6px', fontWeight: 600 }}>
                          ❌ Document Holder: {ownershipValidation.detectedName}
                        </span>
                      ) : (
                        detectedRecipient && formData.recipient && (
                          <span style={{ color: '#34d399', fontSize: '0.74rem', marginLeft: '6px', fontWeight: 600 }}>
                            ✓ Detected from Document
                          </span>
                        )
                      )}
                    </label>
                    {!formData.recipient && accountHolderName && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, recipient: accountHolderName })}
                        style={{ fontSize: '0.74rem', color: '#38bdf8', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Use account name ({accountHolderName})
                      </button>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter student name on certificate"
                    value={formData.recipient} 
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    style={{
                      borderColor: ownershipValidation.hasConflict ? '#f43f5e' : undefined
                    }}
                  />
                  {ownershipValidation.hasConflict && (
                    <div style={{ fontSize: '0.74rem', color: '#fb7185', marginTop: '4px' }}>
                      Certificate was awarded to "{ownershipValidation.detectedName}". You cannot claim another student's document.
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Issue Date
                    </label>
                    {formData.issueDate && Boolean(formData.rawOcrText) && (
                      <span style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 600 }}>
                        ✓ Detected from OCR
                      </span>
                    )}
                  </div>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.issueDate} 
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                  {!formData.issueDate && (
                    <div style={{ fontSize: '0.74rem', color: '#fbbf24', marginTop: '4px' }}>
                      ⚠️ Date not detected on certificate. Please pick issue date.
                    </div>
                  )}
                </div>

                {/* Expiry Date Field with Quick Presets */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Expiration / Renewal Date
                    </label>
                    {formData.expiryDate ? (
                      <span style={{ color: '#38bdf8', fontSize: '0.72rem', fontWeight: 600 }}>
                        📅 Configured
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        Optional (AWS, GCP, Cisco)
                      </span>
                    )}
                  </div>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.expiryDate || ''} 
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      expiryDate: e.target.value,
                      enableExpiryReminder: e.target.value ? true : formData.enableExpiryReminder
                    })}
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const d = new Date(formData.issueDate || Date.now());
                        d.setFullYear(d.getFullYear() + 1);
                        setFormData({ ...formData, expiryDate: d.toISOString().split('T')[0], enableExpiryReminder: true });
                      }}
                      style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      +1 Year
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const d = new Date(formData.issueDate || Date.now());
                        d.setFullYear(d.getFullYear() + 2);
                        setFormData({ ...formData, expiryDate: d.toISOString().split('T')[0], enableExpiryReminder: true });
                      }}
                      style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#38bdf8', cursor: 'pointer' }}
                    >
                      +2 Yrs (AWS/GCP)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const d = new Date(formData.issueDate || Date.now());
                        d.setFullYear(d.getFullYear() + 3);
                        setFormData({ ...formData, expiryDate: d.toISOString().split('T')[0], enableExpiryReminder: true });
                      }}
                      style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      +3 Years
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, expiryDate: '', enableExpiryReminder: false })}
                      style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer' }}
                    >
                      No Expiry
                    </button>
                  </div>
                </div>

                {/* Scheduled 7-Day Expiry Email Reminder (AWS SES & Lambda) */}
                <div style={{
                  gridColumn: 'span 2',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: formData.expiryDate ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-elevated)',
                  border: formData.expiryDate ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Bell size={18} style={{ color: formData.expiryDate ? '#38bdf8' : 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Scheduled 7-Day Expiry Email Reminder</span>
                        <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' }}>
                          AWS Lambda + SES
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                        {formData.expiryDate ? (
                          <>Dispatches automated renewal notice to <strong>{currentUser?.email || 'your email'}</strong> exactly 1 week before {formData.expiryDate} via Amazon SES & EventBridge daily cron.</>
                        ) : (
                          <>Set an expiration date above to activate automated 7-day email reminders via AWS SES & scheduled Lambda.</>
                        )}
                      </div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    disabled={!formData.expiryDate}
                    checked={formData.expiryDate ? formData.enableExpiryReminder : false}
                    onChange={(e) => setFormData({ ...formData, enableExpiryReminder: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0ea5e9', cursor: formData.expiryDate ? 'pointer' : 'not-allowed' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="course">Course / Specialization</option>
                    <option value="internship">Internship</option>
                    <option value="hackathon">Hackathon / Coding Contest</option>
                    <option value="academic">Academic Achievement</option>
                    <option value="workshop">Workshop / Bootcamp</option>
                    <option value="other">Other Credential</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '14px' }}>
                  <label className="form-label">Issuer Verification Link (URL)</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    value={formData.verificationUrl} 
                    onChange={(e) => setFormData({ ...formData, verificationUrl: e.target.value })}
                    placeholder="https://coursera.org/verify/... or https://udemy.com/certificate/..."
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Providing an authentic verification URL upgrades status to Verified/Pending Review.
                  </span>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '14px' }}>
                  <label className="form-label">Credential ID / License Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.credentialId} 
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    placeholder="e.g. CERT-8392-ABC"
                  />
                </div>
              </div>

              {/* Public Portfolio Visibility Toggle */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: ownershipValidation.hasConflict ? 'rgba(244, 63, 94, 0.06)' : 'var(--bg-surface-elevated)',
                border: ownershipValidation.hasConflict ? '1px dashed rgba(244, 63, 94, 0.35)' : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '10px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    color: ownershipValidation.hasConflict ? '#fb7185' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {ownershipValidation.hasConflict && <Lock size={14} />}
                    <span>Publish to Shareable Digital Portfolio</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ownershipValidation.hasConflict 
                      ? '🔒 Locked: Credentials issued to another individual cannot be published to your portfolio.'
                      : 'Visitors with your public portfolio link will be able to view this credential.'}
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  disabled={ownershipValidation.hasConflict}
                  checked={ownershipValidation.hasConflict ? false : formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#0ea5e9', cursor: ownershipValidation.hasConflict ? 'not-allowed' : 'pointer' }}
                />
              </div>

              {/* Raw OCR Text Diagnostic Drawer */}
              {formData.rawOcrText && (
                <details style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  marginBottom: '16px'
                }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#38bdf8' }}>
                    View Raw Text Scanned from Document by Cloud OCR
                  </summary>
                  <pre style={{
                    marginTop: '8px',
                    padding: '10px',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    overflowX: 'auto',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '160px',
                    overflowY: 'auto'
                  }}>
                    {formData.rawOcrText}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleReset}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={stage === 'saving' || duplicateValidation.isDuplicate || isLikelyCertificate !== true}
                  style={
                    duplicateValidation.isDuplicate
                      ? { opacity: 0.6, cursor: 'not-allowed', background: '#475569' }
                      : isLikelyCertificate !== true
                      ? { opacity: 0.6, cursor: 'not-allowed', background: '#dc2626', borderColor: '#ef4444' }
                      : {}
                  }
                >
                  {stage === 'saving' ? (
                    <>
                      <Loader2 size={16} className="spin-animation" />
                      <span>Saving to Cloud...</span>
                    </>
                  ) : isLikelyCertificate !== true ? (
                    <>
                      <XCircle size={16} />
                      <span>Upload Blocked (Not a Certificate)</span>
                    </>
                  ) : duplicateValidation.isDuplicate ? (
                    <>
                      <AlertTriangle size={16} />
                      <span>Already in Vault (Duplicate)</span>
                    </>
                  ) : ownershipValidation.hasConflict ? (
                    <>
                      <ShieldAlert size={16} />
                      <span>Save as Private Credential</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Save Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
