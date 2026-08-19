import "server-only";

/* =============================================================================
   STAFF ACCESS
   -----------------------------------------------------------------------------
   A shared passcode is the weakest acceptable control and is here only so the
   cashier flow can be exercised before real accounts exist. It is checked on
   the SERVER for every staff request — hiding the /staff route from navigation
   is not access control.

   Replace with per-user staff accounts and a role claim before this is used on
   a real till, so redemptions can be attributed to a named person.
   ========================================================================== */

const FALLBACK = "shootq8";

export function staffPasscode(): string {
  return process.env.STAFF_PASSCODE?.trim() || FALLBACK;
}

export function isStaff(req: Request): boolean {
  const header = req.headers.get("x-staff-key")?.trim();
  if (header && timingSafeEqual(header, staffPasscode())) return true;

  const cookie = req.headers.get("cookie") ?? "";
  const match = /(?:^|;\s*)sq8_staff=([^;]+)/.exec(cookie);
  return !!match && timingSafeEqual(decodeURIComponent(match[1]), staffPasscode());
}

/** Constant-time compare so the passcode cannot be recovered by timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Who performed an action. Becomes a real user id once staff accounts exist. */
export function staffActor(req: Request): string {
  const cookie = req.headers.get("cookie") ?? "";
  const m = /(?:^|;\s*)sq8_staff_name=([^;]+)/.exec(cookie);
  return m ? decodeURIComponent(m[1]).slice(0, 40) : "counter";
}
