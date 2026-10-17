/**
 * Rounds a Date object down to the start of the current hour.
 * Essential for cryptographic vote secrecy: prevents traffic correlation attacks
 * by ensuring ballot timestamps cannot be matched against server access logs.
 */
export function roundToHour(date: Date = new Date()): Date {
  const rounded = new Date(date);
  rounded.setMinutes(0, 0, 0);
  return rounded;
}
