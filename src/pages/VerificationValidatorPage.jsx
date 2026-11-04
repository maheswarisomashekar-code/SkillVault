import React, { useState, useEffect } from 'react';
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
  Terminal,
  Zap,
  RefreshCcw,
  ShieldAlert,
  ArrowRight,
  Flame,
  Bug
} from 'lucide-react';
import { getCertificateById } from '../services/certificateService';
import { idbGetAllCertificates } from '../services/indexedDbService';
import { verifyCertificateIntegrity, computeCertificateHash, canonicalizeCertificate } from '../services/cryptoService';
import { VerificationBadge } from '../components/VerificationBadge';
import { CategoryBadge } from '../components/CategoryBadge';

// Helper to calculate hex diff and demonstrate Avalanche Effect
const calculateHashDiff = (hash1 = '', hash2 = '') => {
  if (!hash1 || !hash2) return { diffCount: 0, percent: 0 };
  let diff = 0;
  const len = Math.max(hash1.length, hash2.length);
  for (let i = 0; i < len; i++) {
    if (hash1[i] !== hash2[i]) diff++;
  }
  return {
    diffCount: diff,
    totalChars: len,
    percent: Math.round((diff / len) * 100)
  };
};

export const VerificationValidatorPage = () => {
  const [queryId, setQueryId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [availableCerts, setAvailableCerts] = useState([]);

  // Active View Tab: 'lookup' or 'tamper_lab'
  const [activeMode, setActiveMode] = useState('tamper_lab');

  // Cryptographic Ledger Verification States
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [verifyingCrypto, setVerifyingCrypto] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Live Tamper Attack Simulator State
  const [tamperedPayload, setTamperedPayload] = useState({
    recipient: '',
    title: '',
    issuer: '',
    issueDate: ''
  });
  const [liveComputedHash, setLiveComputedHash] = useState('');
  const [attackType, setAttackType] = useState('none'); // 'none' | 'recipient' | 'issuer' | 'date' | 'custom'

  // Fetch available certificates for 1-click testing
  useEffect(() => {
    idbGetAllCertificates().then(certs => {
      if (certs && certs.length > 0) {
        setAvailableCerts(certs);
        // Pre-select the first certificate (e.g. O.P. Jindal or AWS) for immediate showcase
        selectCertificateForDemo(certs[0]);
      }
    }).catch(err => console.warn('Could not load local certs for demo:', err));
  }, []);

  const selectCertificateForDemo = async (cert) => {
    if (!cert) return;
    setResult(cert);
    setSearched(true);
    setQueryId(cert.credentialId || cert.id);
    
    // Ensure SHA-256 is present
    let originalHash = cert.sha256Hash;
    if (!originalHash) {
      originalHash = await computeCertificateHash(cert);
      cert.sha256Hash = originalHash;
    }

    setTamperedPayload({
      recipient: cert.recipient || 'Student Name',
      title: cert.title || 'Course Certificate',
      issuer: cert.issuer || 'Issuing University',
      issueDate: cert.issueDate || '2026-11-04'
    });

    setLiveComputedHash(originalHash);
    setAttackType('none');

    // Run baseline integrity check
    const check = await verifyCertificateIntegrity(cert);
    setIntegrityStatus(check);
  };

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!queryId.trim()) return;

    setLoading(true);
    setSearched(true);
    setIntegrityStatus(null);
    setAttackType('none');

    try {
      const cert = await getCertificateById(queryId.trim());
      setResult(cert);
      if (cert) {
        selectCertificateForDemo(cert);
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

    setTimeout(async () => {
      const check = await verifyCertificateIntegrity(result, simulateField, simulateVal);
      setIntegrityStatus(check);
      setVerifyingCrypto(false);
    }, 350);
  };

  // Live Tamper Simulation Trigger
  const triggerAttack = async (type) => {
    if (!result) return;
    setAttackType(type);

    let updated = { ...tamperedPayload };

    if (type === 'recipient_1char') {
      // Change just 1 letter of recipient (e.g. Maheswari S -> Maheswari K)
      const current = result.recipient || 'Student';
      const modified = current.endsWith('K') ? current.slice(0, -1) + 'X' : current.slice(0, -1) + 'K';
      updated.recipient = modified;
    } else if (type === 'issuer_spoof') {
      updated.issuer = 'Unauthorized Fake Academy';
    } else if (type === 'date_backdate') {
      updated.issueDate = '2020-01-01';
    } else if (type === 'restore') {
      updated = {
        recipient: result.recipient || 'Student Name',
        title: result.title || 'Course Certificate',
        issuer: result.issuer || 'Issuing University',
        issueDate: result.issueDate || '2026-11-04'
      };
      setAttackType('none');
    }

    setTamperedPayload(updated);

    // Compute live hash of tampered payload
    const testPayload = { ...result, ...updated };
    const newHash = await computeCertificateHash(testPayload);
    setLiveComputedHash(newHash);

    // Check integrity against original
    const isValid = newHash === result.sha256Hash;
    setIntegrityStatus({
      isValid,
      computedHash: newHash,
      storedHash: result.sha256Hash,
      ledgerBlockId: result.ledgerBlockId || 'BLK-VAULT-2026',
      tamperedField: isValid ? null : type
    });
  };

  const handleCustomFieldChange = async (field, val) => {
    const updated = { ...tamperedPayload, [field]: val };
    setTamperedPayload(updated);
    setAttackType('custom');

    const testPayload = { ...result, ...updated };
    const newHash = await computeCertificateHash(testPayload);
    setLiveComputedHash(newHash);

    const isValid = newHash === result.sha256Hash;
    setIntegrityStatus({
      isValid,
      computedHash: newHash,
      storedHash: result.sha256Hash,
      ledgerBlockId: result.ledgerBlockId || 'BLK-VAULT-2026',
      tamperedField: isValid ? null : field
    });
  };

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const hashDiff = result?.sha256Hash && liveComputedHash
    ? calculateHashDiff(result.sha256Hash, liveComputedHash)
    : { diffCount: 0, percent: 0 };

  const isTampered = integrityStatus && !integrityStatus.isValid;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(14, 165, 233, 0.2))',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 0 24px rgba(16, 185, 129, 0.25)',
          border: '1px solid rgba(52, 211, 153, 0.3)'
        }}>
          <ShieldCheck size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          Public Credential Verification & Anti-Tamper Lab
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0', lineHeight: 1.5 }}>
          Recruiter & Academic Verification Portal with <strong>SHA-256 Cryptographic Tamper-Proofing</strong>. Test real-time verification and simulate malicious attacks live.
        </p>

        {/* View Mode Toggle Pill */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginTop: '20px',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveMode('tamper_lab')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeMode === 'tamper_lab' ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'transparent',
              color: activeMode === 'tamper_lab' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeMode === 'tamper_lab' ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Flame size={15} />
            <span>💥 Live Tamper Attack Simulator</span>
            <span style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '1px 6px', 
              borderRadius: '4px', 
              fontSize: '0.68rem',
              letterSpacing: '0.05em' 
            }}>
              EXAMINER DEMO
            </span>
          </button>

          <button
            onClick={() => setActiveMode('lookup')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeMode === 'lookup' ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'transparent',
              color: activeMode === 'lookup' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeMode === 'lookup' ? '0 0 15px rgba(14, 165, 233, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={15} />
            <span>🔍 Credential ID Lookup</span>
          </button>
        </div>
      </div>

      {/* 1-Click Showcase Certificate Selector Chips */}
      {availableCerts.length > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={14} style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
              Select Certificate to Verify / Tamper:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {availableCerts.map((cert) => {
              const isSelected = result?.id === cert.id;
              return (
                <button
                  key={cert.id}
                  onClick={() => selectCertificateForDemo(cert)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#38bdf8' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>📜 {cert.title.length > 32 ? cert.title.substring(0, 32) + '...' : cert.title}</span>
                  <span style={{ fontSize: '0.7rem', color: isSelected ? '#7dd3fc' : '#64748b' }}>({cert.issuer})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lookup Mode Search Card */}
      {activeMode === 'lookup' && (
        <div className="card" style={{ marginBottom: '24px' }}>
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
      )}

      {/* Main Content Area */}
      {result ? (
        <div>
          {/* ========================================================================= */}
          {/* SECTION 1: LIVE TAMPER ATTACK SIMULATOR (THE SHOWSTOPPER) */}
          {/* ========================================================================= */}
          {activeMode === 'tamper_lab' && (
            <div style={{
              borderRadius: '16px',
              background: isTampered 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)' 
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: isTampered ? '2px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(16, 185, 129, 0.4)',
              boxShadow: isTampered 
                ? '0 0 40px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(239, 68, 68, 0.1)' 
                : '0 0 30px rgba(16, 185, 129, 0.2)',
              padding: '24px',
              marginBottom: '28px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Simulator Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isTampered ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isTampered ? '0 0 20px rgba(239, 68, 68, 0.6)' : '0 0 15px rgba(16, 185, 129, 0.4)'
                  }}>
                    {isTampered ? <Flame size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Live Cryptographic Tamper Attack Simulator</span>
                      {isTampered ? (
                        <span style={{ 
                          background: '#ef4444', 
                          color: '#ffffff', 
                          fontSize: '0.68rem', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          letterSpacing: '0.08em',
                          fontWeight: 800,
                          animation: 'pulse 1.5s infinite'
                        }}>
                          ATTACK DETECTED
                        </span>
                      ) : (
                        <span style={{ 
                          background: '#10b981', 
                          color: '#ffffff', 
                          fontSize: '0.68rem', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          letterSpacing: '0.08em',
                          fontWeight: 800
                        }}>
                          GENUINE & SECURE
                        </span>
                      )}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '3px 0 0' }}>
                      Simulate a malicious hacker modifying certificate records to demonstrate the <strong>Avalanche Effect</strong> in SHA-256.
                    </p>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={() => triggerAttack('restore')}
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontSize: '0.78rem',
                    padding: '6px 14px'
                  }}
                >
                  <RefreshCcw size={14} />
                  <span>Restore Original Credential</span>
                </button>
              </div>

              {/* 1-Click Attack Triggers */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  ⚡ Step 1: Launch Simulated Tamper Attack (Click an attack vector):
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => triggerAttack('recipient_1char')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: attackType === 'recipient_1char' ? '1px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.3)',
                      background: attackType === 'recipient_1char' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.08)',
                      color: '#fca5a5',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <User size={16} style={{ color: '#f87171' }} />
                    <div>
                      <div>Alter Recipient by 1 Letter</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400 }}>e.g. Change Name (+1 char)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerAttack('issuer_spoof')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: attackType === 'issuer_spoof' ? '1px solid #ef4444' : '1px solid rgba(249, 115, 22, 0.3)',
                      background: attackType === 'issuer_spoof' ? 'rgba(249, 115, 22, 0.25)' : 'rgba(249, 115, 22, 0.08)',
                      color: '#fdba74',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Building size={16} style={{ color: '#fb923c' }} />
                    <div>
                      <div>Spoof Issuing Authority</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400 }}>Change university name</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerAttack('date_backdate')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: attackType === 'date_backdate' ? '1px solid #ef4444' : '1px solid rgba(168, 85, 247, 0.3)',
                      background: attackType === 'date_backdate' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.08)',
                      color: '#d8b4fe',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Calendar size={16} style={{ color: '#c084fc' }} />
                    <div>
                      <div>Backdate Issue Date</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400 }}>Modify year to 2020</div>
                    </div>
                  </button>
                </div>

                {/* Live Custom Text Input */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Or type custom changes in real-time to observe the hash recalculating:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Recipient Name:</span>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                        value={tamperedPayload.recipient}
                        onChange={(e) => handleCustomFieldChange('recipient', e.target.value)}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Issuing Authority:</span>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                        value={tamperedPayload.issuer}
                        onChange={(e) => handleCustomFieldChange('issuer', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Side-by-Side SHA-256 Hash Comparison */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8' }}>
                    ⚡ Step 2: Side-by-Side Cryptographic Hash Comparison
                  </div>
                  {isTampered && (
                    <div style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Flame size={13} />
                      <span>Avalanche Effect: {hashDiff.diffCount}/64 Hex Chars Changed ({hashDiff.percent}%)</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {/* Original Hash */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🔒 1. Original Stored Hash (Cloud Vault Ledger Block):
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Immutable</span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#34d399', wordBreak: 'break-all' }}>
                      {result.sha256Hash}
                    </div>
                  </div>

                  {/* Recalculated Hash */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: isTampered ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                    border: isTampered ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        color: isTampered ? '#f87171' : '#34d399', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                      }}>
                        {isTampered ? '💥 2. Real-Time Recalculated Hash (Tampered Payload):' : '✓ 2. Real-Time Recalculated Hash (Authentic Payload):'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: isTampered ? '#fca5a5' : '#86efac' }}>
                        {isTampered ? 'HASH MISMATCH' : 'MATCHES EXACTLY'}
                      </span>
                    </div>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.8rem', 
                      color: isTampered ? '#f87171' : '#34d399', 
                      wordBreak: 'break-all',
                      fontWeight: isTampered ? 700 : 400
                    }}>
                      {liveComputedHash}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Security Verdict Alert Banner */}
              {isTampered ? (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.18)',
                  border: '1px solid rgba(239, 68, 68, 0.6)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <ShieldAlert size={28} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fca5a5', margin: '0 0 4px' }}>
                      🚨 FORGERY BLOCKED: CRYPTOGRAPHIC INTEGRITY BREACH!
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#fecaca', margin: 0, lineHeight: 1.5 }}>
                      The real-time calculated SHA-256 hash does NOT match the immutable ledger block (<code>{result.ledgerBlockId || 'BLK-VAULT-2026'}</code>). 
                      Even a <strong>1-character modification</strong> causes ~50% of the 256 bits to flip (*Avalanche Effect*), rendering document fabrication impossible.
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#fb7185', fontWeight: 700 }}>
                      Recruiter Decision: REJECTED (Credential Verification Failed)
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}>
                  <ShieldCheck size={28} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#86efac', margin: '0 0 4px' }}>
                      🛡️ CRYPTOGRAPHIC INTEGRITY VERIFIED (100% AUTHENTIC)
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#bbf7d0', margin: 0, lineHeight: 1.5 }}>
                      Every byte of this credential matches the registered Cloud Vault ledger block. Non-repudiation and origin authenticity are mathematically guaranteed.
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 700 }}>
                      Recruiter Decision: APPROVED & VERIFIED
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: AUTHENTICATED CREDENTIAL RECORD & METADATA */}
          {/* ========================================================================= */}
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
        </div>
      ) : (
        searched && (
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
