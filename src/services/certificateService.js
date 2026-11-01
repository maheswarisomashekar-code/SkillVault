import { 
  db, 
  storage, 
  isFirebaseConfigured,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from '../config/firebase';
import { mockUploadFile, mockDeleteFile } from './mockCloudStorage';
import { idbSaveCertificate, idbGetAllCertificates, idbDeleteCertificate } from './indexedDbService';

const LOCAL_CERTS_KEY = 'skillvault_local_certificates';

/**
 * Validates certificate file type and size (< 10MB)
 */
export const validateCertificateFile = (file) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const maxBytes = 10 * 1024 * 1024; // 10 MB

  if (!file) {
    return { valid: false, error: 'Please select a file to upload.' };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file format. Only PDF, PNG, JPG, and WEBP certificates are supported.' 
    };
  }

  if (file.size > maxBytes) {
    return { 
      valid: false, 
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.` 
    };
  }

  return { valid: true };
};

/**
 * Upload certificate binary to Cloud Storage (or simulated cloud storage if not connected)
 */
export const uploadCertificateFile = async (file, userId, onProgress) => {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `certificates/${userId}/${timestamp}_${sanitizedName}`;

  if (isFirebaseConfigured && storage) {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        userId,
        originalName: file.name
      }
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error('Firebase Storage upload error:', error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadUrl,
            storagePath,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          });
        }
      );
    });
  } else {
    // Local cloud simulation mode
    const downloadUrl = await mockUploadFile(file, storagePath, onProgress);
    return {
      downloadUrl,
      storagePath,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
  }
};

/**
 * Save certificate metadata in Cloud Firestore (or local simulation)
 */
export const createCertificateRecord = async (userId, data) => {
  const certificateId = data.id || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const record = {
    id: certificateId,
    userId,
    title: data.title || 'Untitled Certificate',
    issuer: data.issuer || 'Independent',
    recipient: data.recipient || '',
    issueDate: data.issueDate || new Date().toISOString().split('T')[0],
    category: data.category || 'course',
    description: data.description || '',
    fileUrl: data.fileUrl || '',
    storagePath: data.storagePath || '',
    fileName: data.fileName || '',
    fileSize: data.fileSize || 0,
    fileType: data.fileType || '',
    credentialId: data.credentialId || '',
    verificationUrl: data.verificationUrl || '',
    rawOcrText: data.rawOcrText || '',
    confidenceScore: data.confidenceScore || 70,
    verificationStatus: data.verificationStatus || 'OCR_PROCESSED',
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const certRef = doc(db, 'certificates', certificateId);
    await setDoc(certRef, record);
    return record;
  } else {
    // Save to IndexedDB (no 5MB quota limit)
    await idbSaveCertificate(record);
    return record;
  }
};

/**
 * Fetch all certificates belonging to a specific student
 */
export const getUserCertificates = async (userId) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'certificates'), 
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const certs = [];
      snapshot.forEach((docSnap) => certs.push(docSnap.data()));
      certs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return certs;
    } catch (e) {
      console.error('Failed to query Firestore certificates:', e);
      return await idbGetAllCertificates(userId);
    }
  } else {
    return await idbGetAllCertificates(userId);
  }
};

/**
 * Fetch public certificates for a shareable student portfolio
 */
export const getPublicCertificates = async (userId) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        where('isPublished', '==', true)
      );
      const snapshot = await getDocs(q);
      const certs = [];
      snapshot.forEach(docSnap => certs.push(docSnap.data()));
      return certs;
    } catch (e) {
      console.error('Failed to query public certificates:', e);
      const all = await idbGetAllCertificates(userId);
      return all.filter(c => c.isPublished);
    }
  } else {
    const all = await idbGetAllCertificates(userId);
    return all.filter(c => c.isPublished);
  }
};

/**
 * Update certificate metadata
 */
export const updateCertificateRecord = async (certificateId, updates) => {
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const certRef = doc(db, 'certificates', certificateId);
    await updateDoc(certRef, updateData);
    return updateData;
  } else {
    const all = await idbGetAllCertificates();
    const existing = all.find(c => c.id === certificateId);
    if (existing) {
      const updated = { ...existing, ...updateData };
      await idbSaveCertificate(updated);
      return updated;
    }
    return null;
  }
};

/**
 * Delete certificate from Firestore and Cloud Storage
 */
export const deleteCertificateRecord = async (certificateId, storagePath) => {
  if (isFirebaseConfigured && db) {
    // 1. Delete from Firestore
    await deleteDoc(doc(db, 'certificates', certificateId));
    // 2. Delete binary from Storage if path exists
    if (storagePath && storage) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Could not delete storage object or already removed:', err);
      }
    }
    return true;
  } else {
    await idbDeleteCertificate(certificateId);
    if (storagePath) {
      await mockDeleteFile(storagePath);
    }
    return true;
  }
};

/**
 * Verify a credential lookup by ID (for public verification portal)
 */
export const getCertificateById = async (certificateId) => {
  if (!certificateId) return null;
  const cleanId = certificateId.trim().toLowerCase();

  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, 'certificates', certificateId.trim()));
      if (docSnap.exists()) {
        return docSnap.data();
      }

      // Also query by credentialId field
      const q = query(
        collection(db, 'certificates'),
        where('credentialId', '==', certificateId.trim())
      );
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return querySnap.docs[0].data();
      }
    } catch (e) {
      console.warn('Firestore doc lookup failed:', e);
    }
  }

  const all = await idbGetAllCertificates();
  return all.find(c => {
    const idMatch = c.id && c.id.toLowerCase() === cleanId;
    const credMatch = c.credentialId && c.credentialId.toLowerCase() === cleanId;
    return idMatch || credMatch;
  }) || null;
};
