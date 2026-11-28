import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateBearer } from './auth';

const DATA_DIR = '/tmp/checklitz';
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function readJson<T>(file: string, fallback: T): T { try { if (!fs.existsSync(file)) return fallback; const raw = fs.readFileSync(file, 'utf8'); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function writeJson(file: string, data: unknown) { ensureDir(); fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8'); }

interface StoredOrder { serverCreatedAt: string; [k: string]: unknown; }

export default function handler(req: VercelRequest & { body: any }, res: VercelResponse) {
  const m = (req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'Missing Bearer token.' });
  const verified = authenticateBearer(m[1]);
  if (!verified) return res.status(401).json({ error: 'Invalid or revoked session.' });

  const orders = readJson<StoredOrder[]>(ORDERS_FILE, []) as StoredOrder[];

  if (req.method === 'GET') {
    const statusFilter = req.query?.status as string | undefined;
    const methodFilter = req.query?.method as string | undefined;
    const search = (req.query?.search as string | undefined) || '';
    let filtered = orders;
    if (statusFilter) filtered = filtered.filter((o) => (o as any).status === statusFilter);
    if (methodFilter) filtered = filtered.filter((o) => (o as any).customer?.paymentMethod === methodFilter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((o) => {
        const c: any = o?.customer;
        return [
          o.orderNumber,
          c?.fullName,
          c?.contactNumber,
          c?.referenceNumber,
          c?.email,
          c?.ewalletAccountName,
          c?.bankAccountName,
        ].filter(Boolean).join(' ').toLowerCase().includes(q);
      });
    }
    const safe = filtered.map(({ paymentProofBase64: _p, ...rest }: StoredOrder) => ({
      ...rest,
      customer: rest.customer ? { ...rest.customer, paymentProofBase64: undefined } : undefined,
    }));
    return res.json(safe);
  }

  if (req.method === 'POST') {
    const { orderNumber, status } = req.body || {};
    const valid: string[] = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    if (!orderNumber || !status || !valid.includes(status)) return res.status(400).json({ error: 'orderNumber and valid status required.' });
    const idx = orders.findIndex((o) => o.orderNumber === orderNumber);
    if (idx === -1) return res.status(404).json({ error: 'Order not found.' });
    orders[idx] = { ...orders[idx], status };
    writeJson(ORDERS_FILE, orders);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed.' });
}

export const config = { api: { bodyParser: true } };