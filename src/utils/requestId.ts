import { randomBytes } from 'crypto';

/**
 * Request ID generator for distributed tracing
 *
 * Generates unique identifiers for each request to enable
 * correlation of logs across multiple services and processes.
 */

/**
 * Generate a unique request/correlation ID
 * Uses crypto.randomBytes for cryptographically strong random IDs
 *
 * Format: 16 bytes = 32 hex characters (128 bits of entropy)
 * Example: "a1b2c3d4e5f67890a1b2c3d4e5f67890"
 *
 * @returns {string} A unique hexadecimal request ID
 */
export const generateRequestId = (): string => {
  return randomBytes(16).toString('hex');
};

/**
 * Generate a shorter request ID (useful for headers)
 *
 * Format: 8 bytes = 16 hex characters (64 bits of entropy)
 * Example: "a1b2c3d4e5f67890"
 *
 * @returns {string} A unique short hexadecimal request ID
 */
export const generateShortRequestId = (): string => {
  return randomBytes(8).toString('hex');
};

/**
 * Generate a timestamp-prefixed request ID for time-based sorting
 *
 * Format: timestamp (13 digits) + hyphen + random hex (16 chars)
 * Example: "1699876543210-a1b2c3d4e5f67890"
 *
 * @returns {string} A timestamp-prefixed request ID
 */
export const generateTimestampedRequestId = (): string => {
  const timestamp = Date.now();
  const random = randomBytes(8).toString('hex');
  return `${timestamp}-${random}`;
};

/**
 * Validate if a string is a valid request ID format
 *
 * @param {string} id - The ID to validate
 * @returns {boolean} True if the ID is valid
 */
export const isValidRequestId = (id: string): boolean => {
  // Check for standard format (32 hex chars)
  const standardFormat = /^[a-f0-9]{32}$/i;
  // Check for short format (16 hex chars)
  const shortFormat = /^[a-f0-9]{16}$/i;
  // Check for timestamped format (timestamp-hex)
  const timestampedFormat = /^\d{13}-[a-f0-9]{16}$/i;

  return (
    standardFormat.test(id) ||
    shortFormat.test(id) ||
    timestampedFormat.test(id)
  );
};

/**
 * Extract timestamp from a timestamped request ID
 *
 * @param {string} id - The timestamped request ID
 * @returns {Date | null} The extracted date or null if invalid
 */
export const extractTimestamp = (id: string): Date | null => {
  const match = id.match(/^(\d{13})-[a-f0-9]{16}$/i);
  if (match) {
    return new Date(parseInt(match[1], 10));
  }
  return null;
};

// Export default generator
export default generateRequestId;
