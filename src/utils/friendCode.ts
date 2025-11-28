/**
 * Deterministically generate an 8-character friend code from a UID.
 * We simply take the UID, strip non-alphanumerics, uppercase it,
 * and use the last 8 characters (padding if necessary). This keeps
 * codes stable per user while remaining unique thanks to UID uniqueness.
 */
export function generateFriendCode(uid: string): string {
  const clean = uid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "USERCODE";
  if (clean.length >= 8) {
    return clean.slice(-8);
  }
  return clean.padStart(8, "0");
}









