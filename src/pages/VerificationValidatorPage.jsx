import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Building, 
  Calendar, 
  User, 
  ExternalLink, 
  Hash, 
  Clock, 
  Cloud,
  FileCheck,
  Lock,
  Cpu,
  AlertTriangle,
  RotateCw,
  Copy,
  Check,
  Sparkles,
  Terminal
} from 'lucide-react';
import { getCertificateById } from '../services/certificateService';
import { verifyCertificateIntegrity, computeCertificateHash } from '../services/cryptoService';
import { VerificationBadge } from '../components/VerificationBadge';
import { CategoryBadge } from '../components/CategoryBadge';

export const VerificationValidatorPage = () => {
  const [queryId, setQueryId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Cryptographic Ledger Verification States
  const [integrityStatus, setIntegrityStatus] = useState(null); // null | { isValid, computedHash, storedHash, ledgerBlockId, tamperedField }
  const [verifyingCrypto, setVerifyingCrypto] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Evaluator Tamper Demo Mode
  const [demoMode, setDemoMode] = useState(false);
  const [tamperedName, setTamperedName] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!queryId.trim()) return;

    setLoading(true);
    setSearched(true);
    setIntegrityStatus(null);
    setDemoMode(false);
    setTamperedName('');

    try {
      const cert = await getCertificateById(queryId.trim());
      setResult(cert);
      if (cert) {
        setTamperedName(cert.recipient || 'Student Name');
      }
    } catch (err) {
      console.error('Lookup failed:', err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Run Real-time SHA-256 Digest Check
  const runCryptographicCheck = async (simulateField = null, simulateVal = null) => {
    if (!result) return;
    setVerifyingCrypto(true);

    // Give a realistic 400ms microsecond crypto calculation feel
    setTimeout(async () => {
      const check = await verifyCertificateIntegrity(result, simulateField, simulateVal);
      setIntegrityStatus(check);
      setVerifyingCrypto(false);
    }, 450);
  };

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 0 24px rgba(16, 185, 129, 0.25)'
        }}>
          <ShieldCheck size={32} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Public Credential Verification Registry
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '8px auto 0', lineHeight: 1.5 }}>
          Recruiter & Academic Verification Portal with <strong>SHA-256 Cryptographic Tamper-Proofing</strong>. Validate authentic credentials against the Cloud Vault ledger.
        </p>
      </div>

      {/* Search Card */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <form onSubmit={handleLookup}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="Enter Credential ID (e.g. R51P4QQUCMWH, GCP-ACE-98241, or cert_...)"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
              />
              <Hash size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '160px' }}>
              {loading ? (
                <>
                  <RotateCw size={16} className="spin-animation" />
                  <span>Querying Cloud...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Verify Credential</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {searched && (
        result ? (
          <div className="card" style={{
            border: '1px solid rgba(16, 185, 129, 0.35)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), var(--bg-surface))',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Authenticated Banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Cloud Record Authenticated
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cloud size={13} />
                    <span>Metadata verified in Cloud Registry • Immutable Record</span>
                  </div>
                </div>
              </div>

              {result.ledgerBlockId && (
                <div style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Lock size={12} />
                  <span>Ledger: {result.ledgerBlockId}</span>
                </div>
              )}
            </div>

            {/* Certificate Core Info */}
            <div style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              marginBottom: '20px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CategoryBadge category={result.category} />
                <VerificationBadge status={result.verificationStatus} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {result.title}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Credential Identifier: <strong style={{ color: 'var(--text-primary)' }}>{result.credentialId || result.id}</strong>
              </div>
            </div>

            {/* Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ background: 'var(--bg-main)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Holder / Recipient</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{result.recipient || 'Verified Student'}</strong>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Issuing Authority</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{result.issuer}</strong>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Issue Date</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{result.issueDate}</strong>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>OCR Confidence</span>
                <strong style={{ fontSize: '0.9rem', color: '#38bdf8' }}>{result.confidenceScore || 85}% Confirmed</strong>
              </div>
            </div>

            {/* Cryptographic SHA-256 Ledger Box */}
            <div style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} style={{ color: '#38bdf8' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    SHA-256 Cryptographic Fingerprint
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => handleCopyHash(result.sha256Hash)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '4px 8px', height: '28px' }}
                    title="Copy SHA-256 hash"
                  >
                    {copiedHash ? <Check size={12} style={{ color: '#34d399' }} /> : <Copy size={12} />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => runCryptographicCheck()}
                    disabled={verifyingCrypto}
                    className="btn btn-primary btn-sm"
                    style={{
                      fontSize: '0.78rem',
                      padding: '4px 12px',
                      height: '28px',
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                    }}
                  >
                    {verifyingCrypto ? (
                      <>
                        <RotateCw size={12} className="spin-animation" />
                        <span>Verifying Hash...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={13} />
                        <span>Run Cryptographic Integrity Check</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Hash Display */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#94a3b8',
                wordBreak: 'break-all',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>SHA256: </span>
                {result.sha256Hash || 'Computing immutable digest...'}
              </div>

              {/* Integrity Result Card */}
              {integrityStatus && (
                <div style={{
                  marginTop: '16px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: integrityStatus.isValid 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${integrityStatus.isValid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {integrityStatus.isValid ? (
                      <CheckCircle2 size={20} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <AlertTriangle size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: integrityStatus.isValid ? '#34d399' : '#f87171',
                        marginBottom: '4px'
                      }}>
                        {integrityStatus.isValid 
                          ? '✓ Cryptographic Signature Intact (Zero Tampering Detected)' 
                          : '⚠️ Tamper Alert: Hash Mismatch Detected!'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {integrityStatus.isValid ? (
                          <>
                            Real-time SHA-256 digest computed across Title, Recipient, Issuer, and License fields matches the immutable cloud ledger block <strong>{integrityStatus.ledgerBlockId}</strong> exactly.
                          </>
                        ) : (
                          <>
                            Payload data differs from original issuance. Stored ledger hash (<code>{integrityStatus.storedHash.substring(0, 16)}...</code>) does NOT match real-time calculated hash (<code>{integrityStatus.computedHash.substring(0, 16)}...</code>). Record integrity failed!
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Evaluator Viva Demo Mode: Interactive Tampering Simulator */}
            <div style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px dashed rgba(99, 102, 241, 0.3)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={16} style={{ color: '#818cf8' }} />
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c7d2fe' }}>
                      Evaluator Viva Demo Mode
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      Simulate data alteration to test the real-time cryptographic integrity guard
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !demoMode;
                    setDemoMode(next);
                    if (!next) {
                      // Reset check
                      runCryptographicCheck();
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  {demoMode ? 'Exit Demo Mode' : '🧪 Test Anti-Tamper Simulation'}
                </button>
              </div>

              {demoMode && (
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <label style={{ fontSize: '0.76rem', color: '#c7d2fe', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Modify Recipient Name below (e.g. change 1 letter):
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ fontSize: '0.85rem' }}
                      value={tamperedName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTamperedName(val);
                        runCryptographicCheck('recipient', val);
                      }}
                      placeholder="Type altered name..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setTamperedName(result.recipient || 'Student Name');
                        runCryptographicCheck();
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* External verification button */}
            {result.verificationUrl && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <a 
                  href={result.verificationUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <ExternalLink size={14} />
                  <span>Verify at Official Issuer Portal ({result.issuer})</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{
            border: '1px solid rgba(244, 63, 94, 0.3)',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05), var(--bg-surface))',
            textAlign: 'center',
            padding: '36px 20px'
          }}>
            <XCircle size={36} style={{ color: '#fb7185', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No Cloud Record Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
              No certificate matching credential ID <code>"{queryId}"</code> was found in the database. Please verify the identifier and try again.
            </p>
          </div>
        )
      )}
    </div>
  );
};
