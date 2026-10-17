export type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

/**
 * Merge class names reliably without external module resolution errors
 */
export function cn(...inputs: any[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const [key, val] of Object.entries(input)) {
        if (val) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Format voter receipt code in readable blocks (e.g. VOTE-A9B2-4F11-C82D)
 */
export function formatReceiptCode(code: string): string {
  if (!code) return '';
  const clean = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join('-') || clean;
}

/**
 * Mask citizen national ID showing only first and last 2 digits
 */
export function maskNationalId(id: string): string {
  if (!id || id.length <= 4) return id || '';
  const first2 = id.slice(0, 2);
  const last2 = id.slice(-2);
  const maskedLength = Math.max(id.length - 4, 4);
  return `${first2}${'•'.repeat(maskedLength)}${last2}`;
}

/**
 * Mask phone number showing only last 3 digits
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '•••••••';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 5) return '•••••';
  return `•••••••${clean.slice(-3)}`;
}
