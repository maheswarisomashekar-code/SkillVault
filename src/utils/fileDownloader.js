/**
 * Helper to safely download or open files (including base64 data URLs)
 * without triggering Chrome's "Not allowed to navigate top-frame to data URL" blank page.
 */

// Converts a base64 data URL to a Blob
export const dataUrlToBlob = (dataUrl) => {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'application/pdf';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Downloads a certificate file (works with both data URLs and cloud http URLs)
 */
export const downloadCertificateFile = (fileUrl, fileName = 'certificate.pdf') => {
  if (!fileUrl) return;

  if (fileUrl.startsWith('data:')) {
    const blob = dataUrlToBlob(fileUrl);
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'certificate.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } else {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'certificate.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Opens a certificate file in a new tab safely via Blob URL
 * (Chrome blocks direct top-level navigation to data: URLs)
 */
export const openCertificateInNewTab = (fileUrl, fileName = 'certificate.pdf') => {
  if (!fileUrl) return;

  if (fileUrl.startsWith('data:')) {
    const blob = dataUrlToBlob(fileUrl);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } else {
    window.open(fileUrl, '_blank');
  }
};
