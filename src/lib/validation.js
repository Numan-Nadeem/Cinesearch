/**
 * Pure validation helpers for search filters and inputs (Section 8).
 */

/**
 * Validates an optional 4-digit release year between 1880 and the current year.
 * @param {string | number} yearInput
 * @param {number} [currentYear]
 * @returns {{ valid: boolean, error: string }}
 */
export function validateReleaseYear(yearInput, currentYear = new Date().getFullYear()) {
  const str = String(yearInput ?? '').trim();
  if (!str) {
    return { valid: true, error: '' };
  }
  const num = Number(str);
  if (!/^\d{4}$/.test(str) || Number.isNaN(num) || num < 1880 || num > currentYear) {
    return {
      valid: false,
      error: `Year must be 4 digits between 1880 and ${currentYear}`,
    };
  }
  return { valid: true, error: '' };
}
