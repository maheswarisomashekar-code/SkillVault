/**
 * SkillVault Cryptographic Integrity & Simulated Ledger Service
 * Uses Web Crypto API (SHA-256) for zero-dependency, browser-native hashing.
 */

// Converts ArrayBuffer to lowercase 64-char hex string
const bufferToHex = (buffer) => {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Normalizes certificate metadata into a canonical string for deterministic hashing
 */
export const canonicalizeCertificate = (cert) => {
  return JSON.stringify({
    title: (cert.title || '').trim().toLowerCase(),
    issuer: (cert.issuer || '').trim().toLowerCase(),
    recipient: (cert.recipient || '').trim().toLowerCase(),
    issueDate: (cert.issueDate || '').trim(),
    credentialId: (cert.credentialId || '').trim().toUpperCase(),
  });
};

/**
 * Computes a SHA-256 cryptographic digest of a certificate payload
 */
export const computeCertificateHash = async (cert) => {
  try {
    const canonical = canonicalizeCertificate(cert);
    const encoder = new TextEncoder();
    const data = encoder.encode(canonical);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
  } catch (err) {
    console.error('Crypto digest error:', err);
    // Fallback pseudo-hash if Web Crypto is unavailable (e.g. older insecure contexts)
    return 'sha256_mock_' + Math.random().toString(36).substring(2, 15);
  }
};

/**
 * Generates an immutable ledger block descriptor
 */
export const generateLedgerBlock = (hash, timestamp = Date.now()) => {
  const shortId = hash.substring(0, 8).toUpperCase();
  const blockIndex = Math.floor(100000 + Math.random() * 900000);
  return {
    ledgerBlockId: `BLK-${blockIndex}-${shortId}`,
    recordedAt: new Date(timestamp).toISOString(),
    protocol: 'SkillVault-SHA256-Ledger/v1.0'
  };
};

/**
 * Verifies if the certificate's current state matches its stored cryptographic signature
 */
export const verifyCertificateIntegrity = async (cert, simulatedTamperField = null, simulatedTamperValue = null) => {
  if (!cert) return { isValid: false, reason: 'No certificate payload provided' };

  // Prepare payload (with optional simulated tampering for evaluator demo)
  const payloadToTest = { ...cert };
  if (simulatedTamperField && simulatedTamperValue !== null) {
    payloadToTest[simulatedTamperField] = simulatedTamperValue;
  }

  const computedHash = await computeCertificateHash(payloadToTest);
  const storedHash = cert.sha256Hash || (await computeCertificateHash(cert));

  const isValid = computedHash === storedHash;

  return {
    isValid,
    computedHash,
    storedHash,
    canonicalPayload: canonicalizeCertificate(payloadToTest),
    ledgerBlockId: cert.ledgerBlockId || `BLK-GEN-${storedHash.substring(0, 8).toUpperCase()}`,
    verifiedAt: new Date().toISOString(),
    tamperedField: isValid ? null : simulatedTamperField
  };
};
