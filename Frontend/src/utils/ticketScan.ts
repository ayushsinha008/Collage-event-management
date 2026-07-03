/** Extract ticket UUID or TKT code from a QR scan or manual input. */
export function normalizeTicketScan(raw: string): string {
  const trimmed = raw.trim();
  const uuidMatch = trimmed.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  if (uuidMatch) return uuidMatch[0];
  const tktMatch = trimmed.match(/TKT-[A-Z0-9]+-[0-9]+/i);
  if (tktMatch) return tktMatch[0].toUpperCase();
  return trimmed;
}
