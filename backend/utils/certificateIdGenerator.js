import crypto from 'crypto';

export const generateCertificateId = () => {
  const currentYear = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 hex characters
  return `CERT-${currentYear}-${randomHex}`;
};
