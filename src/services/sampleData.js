// Sample seed certificates for demonstration and viva evaluation

export const SAMPLE_CERTIFICATES = [
  {
    id: 'cert_gcp_cloud_eng_01',
    userId: 'student_cloud_demo_01',
    title: 'Google Cloud Certified Associate Cloud Engineer',
    issuer: 'Google Cloud',
    recipient: 'Maheswari S',
    issueDate: '2024-09-18',
    category: 'course',
    description: 'Demonstrated skills in deploying applications, monitoring operations, and managing enterprise cloud solutions on GCP.',
    fileUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    storagePath: 'certificates/student_cloud_demo_01/gcp_cert.jpg',
    fileName: 'Google_Cloud_ACE.png',
    fileSize: 1024 * 720,
    fileType: 'image/png',
    credentialId: 'GCP-ACE-98241',
    verificationUrl: 'https://google.accredible.com/verify/GCP-ACE-98241',
    rawOcrText: 'GOOGLE CLOUD CERTIFIED ASSOCIATE CLOUD ENGINEER\nThis is to certify that Maheswari S has successfully completed all requirements.\nIssue Date: September 18, 2024\nCredential ID: GCP-ACE-98241\nVerify at https://google.accredible.com/verify/GCP-ACE-98241',
    confidenceScore: 96,
    verificationStatus: 'VERIFIED',
    isPublished: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cert_coursera_k8s_02',
    userId: 'student_cloud_demo_01',
    title: 'Containerization and Kubernetes Microservices on Cloud',
    issuer: 'Coursera',
    recipient: 'Maheswari S',
    issueDate: '2024-08-10',
    category: 'course',
    description: 'Mastered Docker container packaging, Pod scheduling, and Kubernetes multi-tier deployments.',
    fileUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    storagePath: 'certificates/student_cloud_demo_01/k8s_cert.jpg',
    fileName: 'Coursera_Kubernetes.png',
    fileSize: 1024 * 540,
    fileType: 'image/png',
    credentialId: 'COURSERA-K8S-7741',
    verificationUrl: 'https://coursera.org/verify/COURSERA-K8S-7741',
    rawOcrText: 'COURSERA AUTHORIZED CERTIFICATE OF COMPLETION\nAwarded to Maheswari S for completing Containerization and Kubernetes Microservices on Cloud.\nIssue Date: August 10, 2024\nVerification: https://coursera.org/verify/COURSERA-K8S-7741',
    confidenceScore: 92,
    verificationStatus: 'VERIFIED',
    isPublished: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cert_hackathon_ise_03',
    userId: 'student_cloud_demo_01',
    title: 'First Place Winner - VTU Cloud Innovation Hackathon 2024',
    issuer: 'VTU ISE Student Chapter',
    recipient: 'Maheswari S',
    issueDate: '2024-10-05',
    category: 'hackathon',
    description: 'Developed an automated serverless document categorization pipeline using Cloud Run and Firestore.',
    fileUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    storagePath: 'certificates/student_cloud_demo_01/hackathon.jpg',
    fileName: 'Hackathon_First_Prize.png',
    fileSize: 1024 * 890,
    fileType: 'image/png',
    credentialId: 'HACK-VTU-2024-01',
    verificationUrl: '',
    rawOcrText: 'CERTIFICATE OF EXCELLENCE - 1ST PRIZE\nPresented to Maheswari S for the project Cloud Credential Engine at VTU Cloud Innovation Hackathon.\nDate: October 5, 2024',
    confidenceScore: 88,
    verificationStatus: 'OCR_PROCESSED',
    isPublished: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cert_internship_cloud_04',
    userId: 'student_cloud_demo_01',
    title: 'Cloud Systems & DevOps Engineering Intern',
    issuer: 'Infosys Springboard',
    recipient: 'Maheswari S',
    issueDate: '2024-07-25',
    category: 'internship',
    description: 'Completed 8 weeks hands-on internship focusing on CI/CD pipelines, Terraform infrastructure as code, and cloud monitoring.',
    fileUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    storagePath: 'certificates/student_cloud_demo_01/internship.jpg',
    fileName: 'DevOps_Internship_Certificate.png',
    fileSize: 1024 * 620,
    fileType: 'image/png',
    credentialId: 'INF-INT-2024-88',
    verificationUrl: 'https://springboard.infosys.com/verify/INF-INT-2024-88',
    rawOcrText: 'INTERNSHIP COMPLETION CERTIFICATE\nThis certifies that Maheswari S successfully completed the Cloud Systems & DevOps Internship.\nPeriod: June 2024 - July 2024\nCredential ID: INF-INT-2024-88',
    confidenceScore: 94,
    verificationStatus: 'PENDING_REVIEW',
    isPublished: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

import { idbSaveCertificate, idbGetAllCertificates } from './indexedDbService';

export const seedInitialSampleData = async () => {
  try {
    const existing = await idbGetAllCertificates();
    if (!existing || existing.length === 0) {
      // Migrate from localStorage if present
      const oldLocal = localStorage.getItem('skillvault_local_certificates');
      if (oldLocal) {
        try {
          const parsed = JSON.parse(oldLocal);
          for (const cert of parsed) {
            await idbSaveCertificate(cert);
          }
          return;
        } catch (_) {}
      }

      // Seed default demo certificates into IndexedDB
      for (const cert of SAMPLE_CERTIFICATES) {
        await idbSaveCertificate(cert);
      }
    }
  } catch (err) {
    console.warn('Could not seed initial sample data to IndexedDB:', err);
  }
};
