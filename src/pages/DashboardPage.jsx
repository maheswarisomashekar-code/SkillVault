import React from 'react';
import { 
  Award, 
  ShieldCheck, 
  UploadCloud, 
  Globe, 
  Clock, 
  FileScan, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { SkillDistributionChart } from '../components/SkillDistributionChart';
import { CertificateCard } from '../components/CertificateCard';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = ({ 
  certificates = [], 
  onNavigate, 
  onOpenUpload, 
  onPreviewCertificate, 
  onEditCertificate, 
  onDeleteCertificate 
}) => {
  const { userProfile, currentUser } = useAuth();

  // Compute live statistics
  const totalCerts = certificates.length;
  const verifiedCerts = certificates.filter(c => c.verificationStatus === 'VERIFIED').length;
  const ocrScannedCerts = certificates.filter(c => c.verificationStatus === 'OCR_PROCESSED' || c.verificationStatus === 'PENDING_REVIEW').length;
  const publishedCerts = certificates.filter(c => c.isPublished).length;

  const categoriesSet = new Set(certificates.map(c => c.category || 'other'));
  const uniqueCategories = categoriesSet.size;

  const recentCertificates = certificates.slice(0, 3);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1, maxWidth: '650px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(14, 165, 233, 0.15)',
            color: '#38bdf8',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}>
            <Sparkles size={12} />
            <span>Verified Cloud Credential Vault</span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Welcome, {userProfile?.fullName || currentUser?.displayName || 'Student'}! 👋
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {[userProfile?.institution, userProfile?.degree].filter(Boolean).join(' • ') || 'Academic & Professional Credentials'}
            <br />
            Manage, OCR-extract, and securely publish your academic credentials to the cloud.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
          <button className="btn btn-secondary" onClick={() => onNavigate('portfolio')}>
            <Globe size={16} />
            <span>View Public Portfolio</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenUpload}>
            <UploadCloud size={16} />
            <span>Upload Certificate</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <StatCard 
          title="Total Credentials" 
          value={totalCerts} 
          subtitle="Stored in Cloud Storage" 
          icon={Award} 
          color="#0ea5e9" 
        />
        <StatCard 
          title="Genuinely Verified" 
          value={verifiedCerts} 
          subtitle="Issuer or institutional check" 
          icon={ShieldCheck} 
          color="#10b981" 
        />
        <StatCard 
          title="OCR Scanned" 
          value={ocrScannedCerts} 
          subtitle="Awaiting manual/issuer verify" 
          icon={FileScan} 
          color="#f59e0b" 
        />
        <StatCard 
          title="Publicly Published" 
          value={publishedCerts} 
          subtitle="Live on shareable portfolio" 
          icon={Globe} 
          color="#8b5cf6" 
        />
      </div>

      {/* Mid Section: Analytics & Verification Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Skill Category Distribution</h3>
              <p className="card-subtitle">Breakdown of uploaded achievements</p>
            </div>
          </div>
          <SkillDistributionChart certificates={certificates} />
        </div>

        {/* Cloud Verification Pipeline */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Verification Credibility Pipeline</h3>
              <p className="card-subtitle">Defensible Cloud Security Principle</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ color: '#10b981', marginTop: '2px' }}>
                <ShieldCheck size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  Level 3: Verified Credential ({verifiedCerts})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Confirmed via live issuer URL or cryptographic digital signature. High credibility for portfolio visitors.
                </div>
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ color: '#38bdf8', marginTop: '2px' }}>
                <FileScan size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  Level 2: OCR Extracted ({ocrScannedCerts})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Document text read and indexed by Cloud OCR. Does not guarantee authenticity without issuer check.
                </div>
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                <UploadCloud size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  Level 1: Cloud Storage Persistence
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Binaries stored in Firebase Storage buckets with Firestore metadata isolation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Certificates Section */}
      <div style={{ marginTop: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Credentials
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Latest certificates stored in your cloud database
            </p>
          </div>
          {certificates.length > 3 && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('certificates')}
            >
              <span>View All ({certificates.length})</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {recentCertificates.length > 0 ? (
          <div className="cert-grid">
            {recentCertificates.map(cert => (
              <CertificateCard 
                key={cert.id} 
                certificate={cert}
                onPreview={onPreviewCertificate}
                onEdit={onEditCertificate}
                onDelete={onDeleteCertificate}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Award size={32} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No certificates uploaded yet
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
              Upload your course certificates, hackathon wins, or internship letters to test the Cloud OCR parser.
            </p>
            <button className="btn btn-primary" onClick={onOpenUpload}>
              <UploadCloud size={16} />
              <span>Upload First Certificate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
