import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  UploadCloud, 
  Award, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { CertificateCard } from '../components/CertificateCard';

export const CertificatesPage = ({ 
  certificates = [], 
  onOpenUpload, 
  onPreviewCertificate, 
  onEditCertificate, 
  onDeleteCertificate,
  onTakeViva
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'course', label: 'Courses' },
    { id: 'internship', label: 'Internships' },
    { id: 'hackathon', label: 'Hackathons' },
    { id: 'academic', label: 'Academic' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'other', label: 'Other' },
  ];

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        cert.title.toLowerCase().includes(query) ||
        cert.issuer.toLowerCase().includes(query) ||
        (cert.credentialId && cert.credentialId.toLowerCase().includes(query));

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'all' || 
        (cert.category || 'other').toLowerCase() === selectedCategory;

      // 3. Status Filter
      const matchesStatus = selectedStatus === 'all' || 
        (cert.verificationStatus || 'UPLOADED').toUpperCase() === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [certificates, searchQuery, selectedCategory, selectedStatus]);

  return (
    <div>
      {/* Top Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Certificate Repository
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Total {certificates.length} credentials stored in cloud database
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenUpload}>
          <UploadCloud size={16} />
          <span>Upload New Certificate</span>
        </button>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input 
            type="text" 
            className="form-input" 
            style={{ paddingLeft: '38px' }}
            placeholder="Search by title, issuer, or credential ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--text-muted)' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Verification Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="form-select" 
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="OCR_PROCESSED">OCR Extracted</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="UPLOADED">Uploaded Only</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '24px'
      }}>
        {categories.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: isActive ? 'var(--color-primary)' : 'var(--border-subtle)',
                background: isActive ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-surface)',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="cert-grid">
          {filteredCertificates.map(cert => (
            <CertificateCard 
              key={cert.id} 
              certificate={cert}
              onPreview={onPreviewCertificate}
              onEdit={onEditCertificate}
              onDelete={onDeleteCertificate}
              onTakeViva={onTakeViva}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Award size={32} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {certificates.length === 0 ? 'No certificates found' : 'No credentials match your filters'}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
            {certificates.length === 0 
              ? 'Start building your portfolio by uploading your first achievement certificate.'
              : 'Try clearing your search query or selecting a different category filter.'}
          </p>
          {certificates.length === 0 ? (
            <button className="btn btn-primary" onClick={onOpenUpload}>
              <UploadCloud size={16} />
              <span>Upload Certificate</span>
            </button>
          ) : (
            <button 
              className="btn btn-secondary" 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedStatus('all'); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
