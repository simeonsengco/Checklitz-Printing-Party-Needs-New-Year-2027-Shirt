import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  Wallet,
  Smartphone,
  CreditCard,
  Landmark,
  Banknote,
  Info,
  Save,
  Eye,
  X,
  ShieldCheck,
  Receipt,
  CircleDollarSign,
  Lock,
} from 'lucide-react';
import { formatPhp } from '../lib/store';
import { useProducts, ProductOverride } from '../context/ProductsContext';
import {
  CheckoutForm,
  OrderReceipt,
  OrderStatus,
  PaymentMethod,
  Product,
} from '../types/store';

interface AdminPageProps {
  onBack: () => void;
  orders: OrderReceipt[];
  onUpdateOrderStatus?: (orderNumber: string, status: OrderStatus) => void;
}

const ADMIN_EMAIL = 'sengcosimeon1106@gmail.com';
const TOKEN_KEY = 'checklitz_admin_token_v1';

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
async function adminLogin(email: string, password: string): Promise<string> {
  const res = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Sign in failed.');
  return data.token as string;
}

async function adminVerify(token: string): Promise<string> {
  const res = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'status' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Session expired.');
  return data.email as string;
}

async function adminLogout(token: string): Promise<void> {
  try {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'logout' }),
    });
  } catch {
    // ignore
  }
}

async function fetchOrders(token: string): Promise<OrderReceipt[]> {
  const res = await fetch('/api/admin/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load orders.');
  return res.json();
}

async function persistOrderStatus(token: string, orderNumber: string, status: OrderStatus): Promise<void> {
  await fetch('/api/admin/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderNumber, status }),
  });
}

async function persistProduct(token: string, id: string, patch: ProductOverride): Promise<void> {
  const res = await fetch('/api/admin/products', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, patch }),
  });
  if (!res.ok) throw new Error('Failed to save product.');
}

// ---------------------------------------------------------------------------
// Small UI primitives
// ---------------------------------------------------------------------------
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  gcash: 'GCash',
  maya: 'Maya',
  'bank-transfer': 'Land Bank Transfer',
  cod: 'Cash on Delivery',
};

function orderSubtotal(o: OrderReceipt): number {
  return o.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
}

// ---------------------------------------------------------------------------
// AdminPage
// ---------------------------------------------------------------------------
export const AdminPage: React.FC<AdminPageProps> = ({
  onBack,
  orders: initialOrders,
  onUpdateOrderStatus,
}) => {
  const { products, updateProduct } = useProducts();

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');

  const [adminOrders, setAdminOrders] = useState<OrderReceipt[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'revenue' | 'orders' | 'catalog'>('revenue');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'awaiting' | 'verified' | 'cod' | 'cancelled'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderReceipt | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  // Verify existing token on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setAuthChecking(false);
        return;
      }
      try {
        const verifiedEmail = await adminVerify(token);
        if (!cancelled) setAuthEmail(verifiedEmail);
      } catch {
        if (!cancelled) {
          setToken(null);
          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch {}
        }
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load orders once authenticated (merge server + any local fallback)
  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const serverOrders = await fetchOrders(token);
      const merged = mergeOrders(serverOrders, initialOrders);
      setAdminOrders(merged);
    } catch {
      setAdminOrders((prev) => (prev.length ? prev : initialOrders));
      showToast('Could not refresh from server. Showing cached orders.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (authEmail) loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authEmail]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setAuthError('');
    try {
      const newToken = await adminLogin(email, password);
      try {
        localStorage.setItem(TOKEN_KEY, newToken);
      } catch {}
      setToken(newToken);
      const verifiedEmail = await adminVerify(newToken);
      setAuthEmail(verifiedEmail);
      setPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (token) await adminLogout(token);
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    setToken(null);
    setAuthEmail(null);
    setAdminOrders([]);
    setPassword('');
    onBack();
  };

  const handleRefresh = async () => {
    showToast('Refreshed live data.');
    await loadOrders();
  };

  const setOrderStatus = async (orderNumber: string, status: OrderStatus) => {
    setAdminOrders((prev) =>
      prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status } : o))
    );
    if (onUpdateOrderStatus) onUpdateOrderStatus(orderNumber, status);
    if (token) {
      try {
        await persistOrderStatus(token, orderNumber, status);
        showToast(`Order ${orderNumber} marked ${STATUS_LABELS[status]}.`);
      } catch {
        showToast('Saved locally — server sync failed.');
      }
    }
  };

  // ---- Derived metrics ----
  const metrics = useMemo(() => {
    const gross = adminOrders.reduce((s, o) => s + orderSubtotal(o), 0);
    const paid = adminOrders.filter((o) => o.status === 'paid' || o.status === 'completed');
    const verifiedPaid = paid.reduce((s, o) => s + orderSubtotal(o), 0);
    const awaiting = adminOrders.filter((o) => (o.status ?? 'pending') === 'pending');
    const awaitingAmount = awaiting.reduce((s, o) => s + orderSubtotal(o), 0);
    const codOrders = adminOrders.filter(
      (o) => o.customer.paymentMethod === 'cod' && o.status !== 'cancelled' && o.status !== 'completed'
    );
    const codAmount = codOrders.reduce((s, o) => s + orderSubtotal(o), 0);

    const byMethod: Record<PaymentMethod, { amount: number; count: number }> = {
      gcash: { amount: 0, count: 0 },
      maya: { amount: 0, count: 0 },
      'bank-transfer': { amount: 0, count: 0 },
      cod: { amount: 0, count: 0 },
    };
    for (const o of adminOrders) {
      const m = o.customer.paymentMethod;
      if (byMethod[m]) {
        byMethod[m].amount += orderSubtotal(o);
        byMethod[m].count += 1;
      }
    }

    return {
      gross,
      totalOrders: adminOrders.length,
      verifiedPaid,
      paidCount: paid.length,
      awaitingAmount,
      awaitingCount: awaiting.length,
      codAmount,
      codCount: codOrders.length,
      byMethod,
    };
  }, [adminOrders]);

  const recentOrders = useMemo(() => adminOrders.slice(0, 5), [adminOrders]);

  // ---- Filtered orders (Tab 2) ----
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return adminOrders.filter((o) => {
      const status = o.status ?? 'pending';
      if (statusFilter === 'awaiting' && status !== 'pending') return false;
      if (statusFilter === 'verified' && !(status === 'paid' || status === 'completed')) return false;
      if (statusFilter === 'cod' && !(o.customer.paymentMethod === 'cod' && status === 'pending')) return false;
      if (statusFilter === 'cancelled' && status !== 'cancelled') return false;
      if (methodFilter !== 'all' && o.customer.paymentMethod !== methodFilter) return false;
      if (q) {
        const hay = [
          o.orderNumber,
          o.customer.fullName,
          o.customer.contactNumber,
          o.customer.referenceNumber,
          o.customer.email,
          o.customer.ewalletAccountName,
          o.customer.bankAccountName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [adminOrders, search, statusFilter, methodFilter]);

  // ---- Auth gate ----
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] text-zinc-400">
        <div className="flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Verifying secure session…
        </div>
      </div>
    );
  }

  if (!authEmail) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-[#0B0E14] text-zinc-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Storefront
          </button>
          <span className="text-xs font-semibold tracking-tight uppercase text-zinc-500">
            Admin Console
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md p-8 bg-[#131722] rounded-2xl border border-white/10 shadow-2xl">
            <div className="text-center mb-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure Admin Access
              </span>
              <h2 className="font-display text-xl font-bold text-white mt-3">Sign in to Admin Console</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Credentials are verified server-side.
              </p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-white/10 bg-[#0B0E14] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-white/10 bg-[#0B0E14] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              {authError && (
                <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  {authError}
                </p>
              )}
              <button
                type="submit"
                disabled={signingIn}
                className="w-full min-h-[44px] px-4 rounded-xl bg-[#1D63ED] text-white text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-60"
              >
                {signingIn ? 'Verifying…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---- Dashboard ----
  const tabs: Array<{ key: typeof tab; label: string }> = [
    { key: 'revenue', label: 'Revenue & Overview' },
    { key: 'orders', label: `Orders & Receipts (${metrics.totalOrders})` },
    { key: 'catalog', label: `Catalog & Pricing (${products.length})` },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0B0E14] text-zinc-100">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0B0E14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Storefront
              </button>
              <span className="text-zinc-600">/</span>
              <span className="font-medium text-zinc-300">
                Admin Console <span className="text-zinc-500">({authEmail})</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-lg border border-white/10 bg-[#131722] text-xs font-semibold text-zinc-200 hover:border-blue-500/40 hover:text-white transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-lg border border-white/10 bg-[#131722] text-xs font-semibold text-zinc-200 hover:border-red-500/40 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-4">
            Orders, Payments &amp; Store Pricing
          </h1>

          {/* Tabs */}
          <div className="mt-5 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`min-h-[38px] px-4 rounded-lg text-xs sm:text-sm font-semibold transition-colors border ${
                  tab === t.key
                    ? 'bg-[#1D63ED] text-white border-[#1D63ED]'
                    : 'bg-[#131722] text-zinc-300 border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {tab === 'revenue' && (
          <RevenueTab
            metrics={metrics}
            recentOrders={recentOrders}
            onManageAll={() => setTab('orders')}
            onOpenOrder={setSelectedOrder}
          />
        )}
        {tab === 'orders' && (
          <OrdersTab
            orders={filteredOrders}
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            methodFilter={methodFilter}
            onMethodFilter={setMethodFilter}
            onOpenOrder={setSelectedOrder}
            onSetStatus={setOrderStatus}
          />
        )}
        {tab === 'catalog' && (
          <CatalogTab
            products={products}
            token={token}
            onSave={async (id, patch) => {
              if (token) await persistProduct(token, id, patch);
              updateProduct(id, patch);
            }}
            onToast={showToast}
          />
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-4 py-2.5 rounded-xl bg-[#131722] border border-emerald-500/40 text-sm text-emerald-300 shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Revenue & Overview tab
// ---------------------------------------------------------------------------
interface Metrics {
  gross: number;
  totalOrders: number;
  verifiedPaid: number;
  paidCount: number;
  awaitingAmount: number;
  awaitingCount: number;
  codAmount: number;
  codCount: number;
  byMethod: Record<PaymentMethod, { amount: number; count: number }>;
}

const RevenueTab: React.FC<{
  metrics: Metrics;
  recentOrders: OrderReceipt[];
  onManageAll: () => void;
  onOpenOrder: (o: OrderReceipt) => void;
}> = ({ metrics, recentOrders, onManageAll, onOpenOrder }) => {
  const methodIcons: Record<PaymentMethod, React.ReactNode> = {
    gcash: <Smartphone className="w-4 h-4 text-blue-400" />,
    maya: <CreditCard className="w-4 h-4 text-emerald-400" />,
    'bank-transfer': <Landmark className="w-4 h-4 text-purple-400" />,
    cod: <Banknote className="w-4 h-4 text-amber-400" />,
  };

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Gross Revenue"
          value={formatPhp(metrics.gross)}
          sub={`${metrics.totalOrders} total orders`}
          valueClass="text-white"
          icon={<Receipt className="w-4 h-4 text-blue-400" />}
        />
        <KpiCard
          label="Verified Paid"
          value={formatPhp(metrics.verifiedPaid)}
          sub={`${metrics.paidCount} paid orders`}
          valueClass="text-[#10B981]"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />
        <KpiCard
          label="Awaiting Verification"
          value={formatPhp(metrics.awaitingAmount)}
          sub={`${metrics.awaitingCount} receipts to verify`}
          valueClass="text-[#F59E0B]"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
        />
        <KpiCard
          label="Expected COD"
          value={formatPhp(metrics.codAmount)}
          sub={`${metrics.codCount} active COD orders`}
          valueClass="text-white"
          icon={<Wallet className="w-4 h-4 text-blue-400" />}
        />
      </div>

      {/* Revenue by payment method */}
      <div className="rounded-2xl border border-white/10 bg-[#131722] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Revenue by Payment Method</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(['gcash', 'maya', 'bank-transfer', 'cod'] as PaymentMethod[]).map((m) => {
            const d = metrics.byMethod[m];
            return (
              <div key={m} className="rounded-xl border border-white/10 bg-[#0B0E14] p-4">
                <div className="flex items-center gap-2 mb-2">
                  {methodIcons[m]}
                  <span className="text-xs font-semibold text-zinc-300">{METHOD_LABELS[m]}</span>
                </div>
                <p className="font-mono tabular-nums text-lg font-bold text-white">
                  {formatPhp(d.amount)}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{d.count} orders</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-white/10 bg-[#131722] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
          <button
            onClick={onManageAll}
            className="text-xs font-semibold text-[#1D63ED] hover:text-blue-400 transition-colors"
          >
            Manage All Orders
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Receipt className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              No customer orders recorded yet. Orders submitted at checkout will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.map((o) => {
              const status = o.status ?? 'pending';
              return (
                <button
                  key={o.orderNumber}
                  onClick={() => onOpenOrder(o)}
                  className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-white/5 rounded-lg px-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {o.orderNumber} · {o.customer.fullName}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {METHOD_LABELS[o.customer.paymentMethod]} · {o.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded border ${STATUS_STYLES[status]}`}>
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="font-mono tabular-nums text-sm font-semibold text-white">
                      {formatPhp(orderSubtotal(o))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const KpiCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  valueClass: string;
  icon: React.ReactNode;
}> = ({ label, value, sub, valueClass, icon }) => (
  <div className="rounded-2xl border border-white/10 bg-[#131722] p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{label}</span>
      <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
        {icon}
      </span>
    </div>
    <p className={`font-mono tabular-nums text-2xl font-bold ${valueClass}`}>{value}</p>
    <p className="text-[11px] text-zinc-500 mt-1">{sub}</p>
  </div>
);

// ---------------------------------------------------------------------------
// Orders & Receipts tab
// ---------------------------------------------------------------------------
const OrdersTab: React.FC<{
  orders: OrderReceipt[];
  search: string;
  onSearch: (v: string) => void;
  statusFilter: 'all' | 'awaiting' | 'verified' | 'cod' | 'cancelled';
  onStatusFilter: (v: 'all' | 'awaiting' | 'verified' | 'cod' | 'cancelled') => void;
  methodFilter: 'all' | PaymentMethod;
  onMethodFilter: (v: 'all' | PaymentMethod) => void;
  onOpenOrder: (o: OrderReceipt) => void;
  onSetStatus: (orderNumber: string, status: OrderStatus) => void;
}> = ({
  orders,
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  methodFilter,
  onMethodFilter,
  onOpenOrder,
  onSetStatus,
}) => {
  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="rounded-2xl border border-white/10 bg-[#131722] p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search order #, customer, reference #, sender..."
            className="w-full min-h-[42px] pl-9 pr-3 rounded-lg border border-white/10 bg-[#0B0E14] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value as any)}
          className="min-h-[42px] px-3 rounded-lg border border-white/10 bg-[#0B0E14] text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Payment Statuses</option>
          <option value="awaiting">Awaiting Verification</option>
          <option value="verified">Verified Paid</option>
          <option value="cod">COD Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => onMethodFilter(e.target.value as any)}
          className="min-h-[42px] px-3 rounded-lg border border-white/10 bg-[#0B0E14] text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Payment Methods</option>
          <option value="gcash">GCash</option>
          <option value="maya">Maya</option>
          <option value="bank-transfer">Land Bank Transfer</option>
          <option value="cod">Cash on Delivery</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#131722] text-center py-16 px-4">
          <Receipt className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">No orders match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const status = o.status ?? 'pending';
            return (
              <div key={o.orderNumber} className="rounded-2xl border border-white/10 bg-[#131722] p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Order core */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-white">{o.orderNumber}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${STATUS_STYLES[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="text-[11px] text-zinc-500">{o.createdAt}</span>
                    </div>
                    <p className="text-sm text-zinc-200">
                      {o.customer.fullName} · {o.customer.contactNumber}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {o.customer.address}, {o.customer.city} {o.customer.province} {o.customer.postalCode}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {o.items.map((i) => `${i.product.name} (${i.size}×${i.quantity})`).join(', ')}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {METHOD_LABELS[o.customer.paymentMethod]}
                      {o.customer.referenceNumber ? ` · Ref: ${o.customer.referenceNumber}` : ''}
                      {o.customer.ewalletAccountName ? ` · Sender: ${o.customer.ewalletAccountName}` : ''}
                      {o.customer.bankAccountName ? ` · Sender: ${o.customer.bankAccountName}` : ''}
                    </p>
                  </div>

                  {/* Total + actions */}
                  <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                    <span className="font-mono tabular-nums text-lg font-bold text-white">
                      {formatPhp(o.summary.total)}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {status !== 'paid' && status !== 'completed' && status !== 'cancelled' && (
                        <button
                          onClick={() => onSetStatus(o.orderNumber, 'paid')}
                          className="min-h-[32px] px-2.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                        >
                          Mark as Paid
                        </button>
                      )}
                      <button
                        onClick={() => onOpenOrder(o)}
                        className="min-h-[32px] px-2.5 rounded-lg text-[11px] font-semibold bg-[#1D63ED]/15 text-blue-300 border border-[#1D63ED]/40 hover:bg-[#1D63ED]/25 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Receipt &amp; Details
                      </button>
                      <select
                        value={status}
                        onChange={(e) => onSetStatus(o.orderNumber, e.target.value as OrderStatus)}
                        className="min-h-[32px] px-2 rounded-lg text-[11px] border border-white/10 bg-[#0B0E14] text-zinc-200 focus:outline-none focus:border-blue-500"
                        aria-label={`Update fulfillment for ${o.orderNumber}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed / Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Catalog & Pricing tab
// ---------------------------------------------------------------------------
const CatalogTab: React.FC<{
  products: Product[];
  token: string | null;
  onSave: (id: string, patch: ProductOverride) => Promise<void>;
  onToast: (msg: string) => void;
}> = ({ products, token, onSave, onToast }) => {
  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-blue-200/90">
          Adjust selling prices, optional compare-at strikethrough prices, promo badges, or Sold Out
          availability. Saved updates reflect across the live storefront immediately.
        </p>
      </div>

      <div className="space-y-4">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} onSave={onSave} onToast={onToast} />
        ))}
      </div>
    </div>
  );
};

const ProductRow: React.FC<{
  product: Product;
  onSave: (id: string, patch: ProductOverride) => Promise<void>;
  onToast: (msg: string) => void;
}> = ({ product, onSave, onToast }) => {
  const [price, setPrice] = useState<string>(String(product.price));
  const [compareAt, setCompareAt] = useState<string>(
    product.compareAtPrice ? String(product.compareAtPrice) : ''
  );
  const [tag, setTag] = useState<string>(product.tag ?? '');
  const [soldOut, setSoldOut] = useState<boolean>(product.soldOut ?? false);
  const [saving, setSaving] = useState(false);

  // Sync when product changes from elsewhere
  useEffect(() => {
    setPrice(String(product.price));
    setCompareAt(product.compareAtPrice ? String(product.compareAtPrice) : '');
    setTag(product.tag ?? '');
    setSoldOut(product.soldOut ?? false);
  }, [product.id, product.price, product.compareAtPrice, product.tag, product.soldOut]);

  const handleSave = async () => {
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      onToast('Enter a valid price greater than 0.');
      return;
    }
    const compareNum = compareAt.trim() === '' ? undefined : Number(compareAt);
    if (compareNum !== undefined && (!Number.isFinite(compareNum) || compareNum <= 0)) {
      onToast('Compare-at price must be a positive number or blank.');
      return;
    }
    setSaving(true);
    try {
      await onSave(product.id, {
        price: priceNum,
        compareAtPrice: compareNum,
        tag: tag.trim() || undefined,
        soldOut,
      });
      onToast(`Saved “${product.name}”. Storefront updated.`);
    } catch {
      onToast('Save failed. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#131722] p-4 sm:p-5">
      <div className="flex flex-col xl:flex-row gap-5">
        {/* Left: identity */}
        <div className="flex items-start gap-4 xl:w-[320px] shrink-0">
          <img
            src={product.images[0]?.src}
            alt={product.name}
            className="w-16 h-20 object-contain bg-[#0B0E14] border border-white/10 rounded-lg p-1 shrink-0"
          />
          <div className="min-w-0">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5">
              {product.collectionTheme}
            </span>
            <h3 className="font-semibold text-sm text-white mt-1.5 leading-snug">{product.name}</h3>
            <p className="font-mono text-[11px] text-zinc-500 mt-0.5">ID: {product.id}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Price (₱)</label>
            <input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-lg border border-white/10 bg-[#0B0E14] text-sm font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Compare-At (₱)</label>
            <input
              type="number"
              min={0}
              value={compareAt}
              onChange={(e) => setCompareAt(e.target.value)}
              placeholder="Optional"
              className="w-full min-h-[40px] px-3 rounded-lg border border-white/10 bg-[#0B0E14] text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Badge / Tag</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Best Seller"
              className="w-full min-h-[40px] px-3 rounded-lg border border-white/10 bg-[#0B0E14] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoldOut((v) => !v)}
              className={`min-h-[40px] flex-1 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                soldOut
                  ? 'bg-red-500/15 text-red-300 border-red-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
              title="Toggle stock status"
            >
              {soldOut ? 'Sold Out' : 'In Stock'}
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="xl:w-[110px] shrink-0 flex items-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full min-h-[40px] px-4 rounded-lg bg-[#1D63ED] text-white text-xs font-semibold hover:bg-blue-500 transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Order detail modal (with receipt preview)
// ---------------------------------------------------------------------------
const OrderDetailModal: React.FC<{ order: OrderReceipt; onClose: () => void }> = ({ order, onClose }) => {
  const [proofOpen, setProofOpen] = useState(false);
  const proof = (order.customer as CheckoutForm).paymentProofBase64;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#131722] rounded-2xl border border-white/10 shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Order {order.orderNumber}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Placed {order.createdAt}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Customer</p>
            <p className="text-white font-medium">{order.customer.fullName} · {order.customer.email}</p>
            <p className="text-zinc-400">
              {order.customer.address}, {order.customer.city} {order.customer.province} {order.customer.postalCode}
            </p>
            <p className="text-zinc-400">Contact: {order.customer.contactNumber}</p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Payment</p>
            <p className="text-white font-medium">{METHOD_LABELS[order.customer.paymentMethod]}</p>
            {order.customer.referenceNumber && (
              <p className="text-zinc-400 font-mono text-xs">Ref: {order.customer.referenceNumber}</p>
            )}
            {order.customer.ewalletAccountName && (
              <p className="text-zinc-400 text-xs">Sender: {order.customer.ewalletAccountName} ({order.customer.ewalletNumber})</p>
            )}
            {order.customer.bankAccountName && (
              <p className="text-zinc-400 text-xs">Sender: {order.customer.bankAccountName} · {order.customer.bankName} ({order.customer.bankAccountNumber})</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Receipt</p>
            {proof ? (
              <button onClick={() => setProofOpen(true)} className="group relative w-full">
                <img
                  src={proof}
                  alt="Payment proof"
                  className="w-full max-h-48 object-contain rounded-lg border border-white/10 bg-[#0B0E14]"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg">
                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                </span>
              </button>
            ) : (
              <p className="text-zinc-500 text-xs">No payment proof attached.</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Items</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                <span className="text-zinc-200">{item.product.name} · {item.size} × {item.quantity}</span>
                <span className="font-mono text-white">{formatPhp(item.lineTotal)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 font-bold text-white">
              <span>Total</span>
              <span className="font-mono">{formatPhp(order.summary.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {proofOpen && proof && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4" onClick={() => setProofOpen(false)}>
          <img src={proof} alt="Payment proof full" className="max-w-full max-h-full object-contain rounded-lg" />
          <button className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white" aria-label="Close receipt">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mergeOrders(server: OrderReceipt[], local: OrderReceipt[]): OrderReceipt[] {
  const map = new Map<string, OrderReceipt>();
  for (const o of [...server, ...local]) {
    if (!map.has(o.orderNumber)) map.set(o.orderNumber, o);
  }
  return Array.from(map.values());
}
