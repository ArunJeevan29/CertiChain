import crypto from 'crypto';

/**
 * Generates a unique Student ID in the format: STU-YYYY-XXXXXX
 * where YYYY is the current year and XXXXXX is a 6-character hex string.
 */
export const generateStudentId = () => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `STU-${year}-${randomHex}`;
};
