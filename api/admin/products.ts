import fs from 'node:fs';
import path from 'node:path';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateBearer } from './auth';

const DATA_DIR = '/tmp/checklitz';
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function readJson<T>(file: string, fallback: T): T { try { if (!fs.existsSync(file)) return fallback; const raw = fs.readFileSync(file, 'utf8'); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function writeJson(file: string, data: unknown) { ensureDir(); fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8'); }

interface Override { id: string; price?: number; compareAtPrice?: number; tag?: string; soldOut?: boolean; }

export default function handler(req: VercelRequest & { body: any }, res: VercelResponse) {
  const m = (req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'Missing Bearer token.' });
  const verified = authenticateBearer(m[1]);
  if (!verified) return res.status(401).json({ error: 'Invalid or revoked session.' });

  const overrides = readJson<Override[]>(PRODUCTS_FILE, []) as Override[];

  if (req.method === 'GET') {
    return res.json(overrides);
  }
  if (req.method === 'PUT') {
    const { id, patch } = req.body || {};
    if (!id || !patch) return res.status(400).json({ error: 'id and patch required.' });
    const idx = overrides.findIndex((o) => o.id === id);
    if (idx === -1) {
      const newOv: Override = { id, ...patch };
      overrides.unshift(newOv);
      writeJson(PRODUCTS_FILE, overrides);
      return res.json({ success: true, product: newOv });
    }
    const updated = { ...overrides[idx], ...patch };
    overrides[idx] = updated;
    writeJson(PRODUCTS_FILE, overrides);
    return res.json({ success: true, product: updated });
  }
  res.status(405).json({ error: 'Method not allowed.' });
}

export const config = { api: { bodyParser: true } };