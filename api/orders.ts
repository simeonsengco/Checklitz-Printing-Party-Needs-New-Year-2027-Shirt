import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FREE_SHIPPING_THRESHOLD = 1500;
const STANDARD_SHIPPING_FEE = 50;

function isImageHeader(buffer: Buffer): boolean {
  const sig = buffer.subarray(0, 4);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  if (sig.subarray(0, 4).equals(png)) return true;
  const jpg = Buffer.from([0xff, 0xd8, 0xff]);
  if (sig.subarray(0, 3).equals(jpg)) return true;
  const riff = Buffer.from([0x52, 0x49, 0x46, 0x46]);
  if (sig.subarray(0, 4).equals(riff)) {
    const rest = buffer.subarray(8, 12);
    const webp = Buffer.from([0x57, 0x45, 0x42, 0x50]);
    if (rest.length === 4 && rest.equals(webp)) return true;
  }
  return false;
}
function parseDataUrl(dataUrl: string | undefined): Buffer | null {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:(image\/(png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return Buffer.from(match[3], 'base64');
}

export default function handler(req: VercelRequest & { body: any }, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { cart, form, products, proofBase64 } = req.body || {};
  if (!cart || !form || !products) return res.status(400).json({ error: 'cart, form, and products are required.' });

  const productMap = new Map<string, any>((products || []).map((p: any) => [p.id as string, p] as [string, any]));
  const validMethods = ['gcash', 'maya', 'cod', 'bank-transfer'];
  const method = validMethods.includes(form.paymentMethod) ? form.paymentMethod : undefined;
  if (!method) return res.status(400).json({ error: 'Invalid payment method.' });

  let itemsCount = 0;
  let subtotal = 0;
  const resolvedItems: any[] = [];
  for (const ci of cart) {
    const product = productMap.get(ci.productId);
    if (!product) return res.status(400).json({ error: `Unknown product ${ci.productId}.` });
    if (product.soldOut) return res.status(409).json({ error: `${product.name} is sold out.` });
    const qty = Math.min(99, Math.max(1, Math.floor(ci.quantity)));
    const lineTotal = product.price * qty;
    itemsCount += qty;
    subtotal += lineTotal;
    resolvedItems.push({ product, size: ci.size, quantity: qty, lineTotal });
  }
  if (itemsCount === 0) return res.status(400).json({ error: 'Cart is empty.' });

  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  if (method !== 'cod') {
    const buf = parseDataUrl(proofBase64 ?? null);
    if (!buf) return res.status(400).json({ error: 'Payment proof is required (PNG/JPG/WEBP).' });
    if (!isImageHeader(buf)) return res.status(400).json({ error: 'Invalid image format. Upload PNG, JPG, or WEBP.' });
  }

  const orderNumber = `CHK-2027-${Math.floor(1000 + Math.random() * 9000)}`;
  const order = {
    orderNumber,
    createdAt: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
    status: 'pending',
    customer: { ...form, paymentMethod: method, paymentProof: undefined, paymentProofBase64: method !== 'cod' ? proofBase64 ?? null : null },
    items: resolvedItems,
    summary: {
      itemsCount, subtotal, shippingFee, total,
      freeShippingRemaining: qualifiesForFreeShipping ? 0 : FREE_SHIPPING_THRESHOLD - subtotal,
      qualifiesForFreeShipping,
    },
  };

  // Persist order server-side so admin can read it via /api/admin/orders
  try {
    const DATA_DIR = '/tmp/checklitz';
    const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const orders = (() => { try { const r = fs.readFileSync(ORDERS_FILE, 'utf8'); return r ? JSON.parse(r) : []; } catch { return []; } })() as any[];
    orders.unshift({ ...order, serverCreatedAt: new Date().toISOString() });
    if (orders.length > 2000) orders.length = 2000;
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch { /* persist best-effort */ }

  return res.status(201).json({ orderNumber, order });
}

export const config = { api: { bodyParser: true } };