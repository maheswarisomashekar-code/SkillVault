// Local cloud storage simulator used when Firebase credentials are not yet configured in .env

const STORAGE_KEY = 'skillvault_mock_storage_files';

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
        reader.onload = () => {
          const fileData = {
            path,
            name: file.name,
            size: file.size,
            type: file.type,
            url: reader.result,
            createdAt: new Date().toISOString()
          };
          
          try {
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            existing[path] = fileData;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
            resolve(reader.result);
          } catch (e) {
            // If localStorage is full, still resolve with blob URL
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
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete existing[path];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch {
    return false;
  }
};
