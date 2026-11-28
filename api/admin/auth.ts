import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'sengcosimeon1106@gmail.com').trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();
const SESSION_TTL_MS = 60 * 60 * 1000;
const SESSION_SECRET = (() => {
  const explicit = (process.env.ADMIN_SESSION_SECRET || '').trim();
  if (explicit) return explicit;
  if (ADMIN_PASSWORD) {
    return crypto.createHash('sha256').update(`${ADMIN_PASSWORD}::checklitz`).digest('hex');
  }
  return crypto.randomBytes(32).toString('hex');
})();

const scryptSalt = (email: string) => crypto.createHash('sha256').update(`checklitz::${email}`).digest('hex');
function scryptHash(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
function timingSafeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
export function adminEmail(): string { return ADMIN_EMAIL; }
export function isAdminConfigured(): boolean { return ADMIN_PASSWORD.length > 0; }
export function verifyAdminCredentials(email: string, password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  if ((email || '').trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return false;
  const salt = scryptSalt(ADMIN_EMAIL);
  return timingSafeEq(scryptHash(password || '', salt), scryptHash(ADMIN_PASSWORD, salt));
}

interface TokenPayload { email: string; exp: number; jti: string; }
const activeSessions = new Map<string, TokenPayload>();
function hmac(payload: string): string { return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url'); }

export function issueSession(email: string): { token: string; email: string; expiresAt: number } {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload: TokenPayload = { email, exp, jti: crypto.randomBytes(16).toString('hex') };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const token = `${body}.${hmac(body)}`;
  activeSessions.set(token, payload);
  return { token, email, expiresAt: exp };
}
export function authenticateBearer(token: string): { email: string } | null {
  if (!token || token.indexOf('.') === -1) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  if (!timingSafeEq(sig, hmac(body))) return null;
  let payload: TokenPayload;
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return null; }
  if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
  if (!activeSessions.has(token)) return null;
  return { email: payload.email };
}
export function revokeSession(token: string): void { activeSessions.delete(token); }

export default function handler(req: any, res: VercelResponse) {
  try {
    const { action, email, password } = req.body || {};
    console.log('DEBUG: action=', action, 'email=', email);
    if (action === 'login') {
      if (!isAdminConfigured()) return res.status(503).json({ error: 'Admin not configured. Set ADMIN_PASSWORD env var.' });
      if (!verifyAdminCredentials(email, password)) return res.status(401).json({ error: 'Invalid email or password.' });
      const { token, expiresAt } = issueSession(email);
      return res.json({ token, email, expiresAt });
    }
    if (action === 'logout') {
      const m = (req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
      if (m) revokeSession(m[1]);
      return res.json({ success: true });
    }
    if (action === 'status') {
      const m = (req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
      if (!m) return res.status(401).json({ error: 'Missing Bearer token.' });
      const v = authenticateBearer(m[1]);
      if (!v) return res.status(401).json({ error: 'Invalid or revoked session.' });
      return res.json({ email: v.email });
    }
    res.status(400).json({ error: 'Unknown action.' });
  } catch (e: any) {
    console.error('AUTH HANDLER ERROR:', e.message, e.stack);
    res.status(500).json({ error: 'Internal server error: ' + e.message });
  }
}

export const config = { api: { bodyParser: true } };