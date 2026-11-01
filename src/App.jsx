import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { UploadModal } from './components/UploadModal';
import { CertificatePreviewModal } from './components/CertificatePreviewModal';
import { EditCertificateModal } from './components/EditCertificateModal';

import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { PortfolioManagerPage } from './pages/PortfolioManagerPage';
import { PublicPortfolioPage } from './pages/PublicPortfolioPage';
import { VerificationValidatorPage } from './pages/VerificationValidatorPage';
import { ProfilePage } from './pages/ProfilePage';

import { getUserCertificates, deleteCertificateRecord } from './services/certificateService';
import { seedInitialSampleData } from './services/sampleData';

function MainAppContent() {
  const { currentUser, loading } = useAuth();

  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [editCert, setEditCert] = useState(null);

  // Hash-based Public Portfolio detection
  const [publicPortfolioId, setPublicPortfolioId] = useState(null);

  useEffect(() => {
    seedInitialSampleData().then(() => {
      if (currentUser) {
        loadCertificates();
      }
    });

    // Check hash for #/p/:id
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/p/')) {
        const id = hash.replace('#/p/', '');
        setPublicPortfolioId(id);
      } else {
        setPublicPortfolioId(null);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Fetch certificates when current user changes
  useEffect(() => {
    if (currentUser) {
      loadCertificates();
    }
  }, [currentUser]);

  const loadCertificates = async () => {
    if (!currentUser) return;
    setLoadingCerts(true);
    try {
      const data = await getUserCertificates(currentUser.uid);
      setCertificates(data);
    } catch (e) {
      console.error('Failed to load certificates:', e);
    } finally {
      setLoadingCerts(false);
    }
  };

  const handleUploadSuccess = (newCert) => {
    setCertificates((prev) => [newCert, ...prev]);
  };

  const handleEditSuccess = (updatedCert) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === updatedCert.id ? updatedCert : c))
    );
  };

  const handleDeleteCertificate = async (cert) => {
    if (window.confirm(`Are you sure you want to delete "${cert.title}" from cloud storage and database?`)) {
      try {
        await deleteCertificateRecord(cert.id, cert.storagePath);
        setCertificates((prev) => prev.filter((c) => c.id !== cert.id));
      } catch (err) {
        alert(`Failed to delete certificate: ${err.message}`);
      }
    }
  };

  // If a public portfolio URL is requested via hash, show Public Portfolio directly
  if (publicPortfolioId) {
    return (
      <PublicPortfolioPage 
        portfolioId={publicPortfolioId} 
        onBackToApp={() => {
          window.location.hash = '';
          setPublicPortfolioId(null);
        }}
      />
    );
  }

  // Auth Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        <div>Loading SkillVault Cloud System...</div>
      </div>
    );
  }

  // Not logged in -> Show Authentication Page
  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Main Layout Area */}
      <div className="main-wrapper">
        <TopBar 
          activeTab={activeTab} 
          setIsSidebarOpen={setIsSidebarOpen}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenPortfolio={() => setActiveTab('portfolio')}
        />

        <main className="content-body">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              certificates={certificates}
              onNavigate={setActiveTab}
              onOpenUpload={() => setIsUploadOpen(true)}
              onPreviewCertificate={setPreviewCert}
              onEditCertificate={setEditCert}
              onDeleteCertificate={handleDeleteCertificate}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificatesPage 
              certificates={certificates}
              onOpenUpload={() => setIsUploadOpen(true)}
              onPreviewCertificate={setPreviewCert}
              onEditCertificate={setEditCert}
              onDeleteCertificate={handleDeleteCertificate}
            />
          )}

          {activeTab === 'upload' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Cloud Document Upload & OCR Text Extraction
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Trigger genuine OCR analysis, verify extracted entities, and persist records in Cloud Storage & Firestore.
                </p>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <button 
                  className="btn btn-primary"
                  style={{ padding: '14px 28px', fontSize: '1rem' }}
                  onClick={() => setIsUploadOpen(true)}
                >
                  <span>Launch Cloud OCR Uploader</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <PortfolioManagerPage 
              certificates={certificates}
              onCertificateUpdate={handleEditSuccess}
              onPreviewPublicPortfolio={(id) => {
                window.location.hash = `#/p/${id}`;
              }}
            />
          )}

          {activeTab === 'validator' && (
            <VerificationValidatorPage />
          )}

          {activeTab === 'profile' && (
            <ProfilePage />
          )}
        </main>
      </div>

      {/* Upload & Smart OCR Modal */}
      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Preview Modal */}
      <CertificatePreviewModal 
        certificate={previewCert}
        isOpen={Boolean(previewCert)}
        onClose={() => setPreviewCert(null)}
        onUpdate={handleEditSuccess}
      />

      {/* Edit Metadata Modal */}
      <EditCertificateModal 
        certificate={editCert}
        isOpen={Boolean(editCert)}
        onClose={() => setEditCert(null)}
        onSaveSuccess={handleEditSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
