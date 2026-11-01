// Browser IndexedDB service to handle unlimited certificate files and avoid localStorage quota limits

const DB_NAME = 'SkillVaultDB';
const DB_VERSION = 1;
const STORE_FILES = 'certificate_files';
const STORE_CERTS = 'certificate_metadata';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'path' });
      }
      if (!db.objectStoreNames.contains(STORE_CERTS)) {
        db.createObjectStore(STORE_CERTS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const idbSaveFile = async (path, fileData) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readwrite');
    const store = tx.objectStore(STORE_FILES);
    store.put({ path, ...fileData });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const idbGetFile = async (path) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readonly');
    const store = tx.objectStore(STORE_FILES);
    const req = store.get(path);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const idbDeleteFile = async (path) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readwrite');
    const store = tx.objectStore(STORE_FILES);
    store.delete(path);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const idbSaveCertificate = async (certificate) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CERTS, 'readwrite');
    const store = tx.objectStore(STORE_CERTS);
    store.put(certificate);
    tx.oncomplete = () => resolve(certificate);
    tx.onerror = () => reject(tx.error);
  });
};

export const idbGetAllCertificates = async (userId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CERTS, 'readonly');
    const store = tx.objectStore(STORE_CERTS);
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result || [];
      const userCerts = userId ? all.filter(c => c.userId === userId) : all;
      userCerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(userCerts);
    };
    req.onerror = () => reject(req.error);
  });
};

export const idbDeleteCertificate = async (certificateId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CERTS, 'readwrite');
    const store = tx.objectStore(STORE_CERTS);
    store.delete(certificateId);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};
