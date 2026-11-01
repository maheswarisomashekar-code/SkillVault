// Local cloud storage simulator backed by browser IndexedDB (avoiding 5MB localStorage quota limits)
import { idbSaveFile, idbDeleteFile } from './indexedDbService';

export const mockUploadFile = async (file, path, onProgress) => {
  return new Promise((resolve, reject) => {
    // Simulate chunked upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (onProgress) onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        const reader = new FileReader();
        reader.onload = async () => {
          const fileData = {
            path,
            name: file.name,
            size: file.size,
            type: file.type,
            url: reader.result,
            createdAt: new Date().toISOString()
          };
          
          try {
            await idbSaveFile(path, fileData);
            resolve(reader.result);
          } catch (e) {
            console.warn('IndexedDB save failed, using memory blob:', e);
            const blobUrl = URL.createObjectURL(file);
            resolve(blobUrl);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    }, 150);
  });
};

export const mockDeleteFile = async (path) => {
  try {
    await idbDeleteFile(path);
    return true;
  } catch {
    return false;
  }
};
