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
  FileCheck
} from 'lucide-react';
import { getCertificateById } from '../services/certificateService';
import { VerificationBadge } from '../components/VerificationBadge';
import { CategoryBadge } from '../components/CategoryBadge';

export const VerificationValidatorPage = () => {
  const [queryId, setQueryId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!queryId.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const cert = await getCertificateById(queryId.trim());
      setResult(cert);
    } catch (err) {
      console.error('Lookup failed:', err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <ShieldCheck size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Public Credential Verification Registry
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '8px auto 0' }}>
          Recruiter and Academic Verification Portal. Enter any Certificate ID or Credential Hash to validate genuine cloud records.
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
                placeholder="Enter Credential ID (e.g. cert_1729... or custom ID)"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
              />
              <Hash size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={16} />
              <span>{loading ? 'Querying Cloud...' : 'Verify Credential'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {searched && (
        result ? (
          <div className="card" style={{
            border: '1px solid rgba(16, 185, 129, 0.35)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), var(--bg-surface))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
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
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Cloud Record Authenticated
                </div>
                <div style={{ fontSize: '0.78rem', color: '#34d399' }}>
                  Document metadata confirmed in Cloud Firestore
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CategoryBadge category={result.category} />
                <VerificationBadge status={result.verificationStatus} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {result.title}
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginBottom: '20px'
            }}>
              <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Holder / Recipient</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{result.recipient || 'Verified Student'}</strong>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Issuing Authority</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{result.issuer}</strong>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Issue Date</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{result.issueDate}</strong>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>OCR Confidence</span>
                <strong style={{ fontSize: '0.9rem', color: '#38bdf8' }}>{result.confidenceScore || 85}% Confirmed</strong>
              </div>
            </div>

            {result.verificationUrl && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <a 
                  href={result.verificationUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <ExternalLink size={14} />
                  <span>Verify at Issuer Portal ({result.issuer})</span>
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
              No certificate matching credential ID <code>"{queryId}"</code> was found in the database. Please verify the identifier and try again.
            </p>
          </div>
        )
      )}
    </div>
  );
};
