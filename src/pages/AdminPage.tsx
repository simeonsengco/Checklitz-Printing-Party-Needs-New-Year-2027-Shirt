import React, { useCallback, useMemo, useState } from 'react';
import { formatPhp } from '../lib/store';
import {
  CartItem,
  CheckoutForm,
  OrderReceipt,
  OrderStatus,
  Product,
} from '../types/store';

interface AdminPageProps {
  onBack: () => void;
  orders: OrderReceipt[];
  products: Product[];
  onUpdateOrderStatus?: (orderNumber: string, status: OrderStatus) => void;
}

const ADMIN_EMAIL = 'sengcosimeon1106@gmail.com';
const ORDER_STORAGE_KEY = 'checklitz_orders_v1';
const PASSWORD_STORAGE_KEY = 'checklitz_admin_hash_v1';

function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  return crypto.subtle.digest('SHA-256', data).then((digest) => {
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  });
}

function loadStoredHash(): { salt: string; hash: string } | null {
  try {
    const raw = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.salt && parsed.hash) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveStoredHash(salt: string, hash: string) {
  try {
    localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify({ salt, hash }));
  } catch {}
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onBack,
  orders: initialOrders,
  products,
  onUpdateOrderStatus,
}) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [orders, setOrders] = useState<OrderReceipt[]>(initialOrders);
  const [viewStatus, setViewStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderReceipt | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const grossRevenue = useMemo(
    () =>
      orders.reduce((sum, o) => {
        const subtotal = o.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
        return sum + subtotal;
      }, 0),
    [orders]
  );

  const paidRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'paid' || o.status === 'completed')
        .reduce((sum, o) => {
          const subtotal = o.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
          return sum + subtotal;
        }, 0),
    [orders]
  );

  const pendingRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'pending' || !o.status)
        .reduce((sum, o) => {
          const subtotal = o.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
          return sum + subtotal;
        }, 0),
    [orders]
  );

  const codRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.customer.paymentMethod === 'cod')
        .reduce((sum, o) => {
          const subtotal = o.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
          return sum + subtotal;
        }, 0),
    [orders]
  );

  const revenueByMethod = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const o of orders) {
      const m = o.customer.paymentMethod;
      const subtotal = o.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
      acc[m] = (acc[m] || 0) + subtotal;
    }
    return acc;
  }, [orders]);

  const paymentMethodCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const o of orders) {
      const m = o.customer.paymentMethod;
      acc[m] = (acc[m] || 0) + 1;
    }
    return acc;
  }, [orders]);

  const paidCount = orders.filter(
    (o) => o.status === 'paid' || o.status === 'completed'
  ).length;
  const pendingCount = orders.filter(
    (o) => o.status === 'pending' || !o.status
  ).length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const filtered = orders.filter((o) => viewStatus === 'all' || o.status === viewStatus);
  const filteredGross = useMemo(
    () =>
      filtered.reduce((sum, o) => {
        const subtotal = o.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
        return sum + subtotal;
      }, 0),
    [filtered]
  );
  const filteredPaid = useMemo(
    () =>
      filtered
        .filter((o) => o.status === 'paid' || o.status === 'completed')
        .reduce((sum, o) => {
          const subtotal = o.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
          return sum + subtotal;
        }, 0),
    [filtered]
  );

  const setStatus = useCallback(
    (orderNumber: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status } : o))
      );
      if (onUpdateOrderStatus) onUpdateOrderStatus(orderNumber, status);
    },
    [onUpdateOrderStatus]
  );

  const openOrderDetail = (order: OrderReceipt) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };
  const closeOrderDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const stored = loadStoredHash();
    if (!showPasswordSetup && stored) {
      const hash = await hashPassword(password, stored.salt);
      if (hash === stored.hash) {
        setAuthenticated(true);
        setLoginError('');
        return;
      }
      setLoginError('Invalid email or password.');
      return;
    }
    // First-time setup
    if (password.trim().length < 4) {
      setLoginError('Password must be at least 4 characters.');
      return;
    }
    const salt = Math.random().toString(36).substring(2, 21);
    const hash = await hashPassword(password, salt);
    saveStoredHash(salt, hash);
    setAuthenticated(true);
    setShowPasswordSetup(false);
    setLoginError('');
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword('');
    setLoginError('');
    setShowPasswordSetup(false);
  };

  const setProductPriceAndSoldOut = (
    productId: string,
    price: number,
    soldOut: boolean
  ) => {
    try {
      const raw = localStorage.getItem('checklitz_product_overrides_v1');
      const overrides = raw ? JSON.parse(raw) : {};
      overrides[productId] = { ...(overrides[productId] || {}), price, soldOut };
      localStorage.setItem('checklitz_product_overrides_v1', JSON.stringify(overrides));
    } catch {}
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#08090D] text-[#111317] dark:text-zinc-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-[#0D3BFF] dark:hover:text-blue-400">
            ← Back to store
          </button>
          <span className="text-xs font-semibold text-zinc-950 dark:text-white tracking-tight uppercase">
            Admin Portal
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md p-8 bg-white dark:bg-[#10131D] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/20 px-3 py-1 text-xs font-semibold text-[#0D3BFF] dark:text-blue-400">
                🔒 Admin Access
              </span>
              <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white mt-2">Admin Sign In</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Restricted to Checklitz Printing &amp; Party Needs administrators.
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">Email Address</label>
                <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sengcosimeon1106@gmail.com" className="w-full min-h-[44px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]" required />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">Password</label>
                <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full min-h-[44px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]" required />
              </div>
              {loginError && <p className="text-xs text-red-500 font-medium">{loginError}</p>}
              <button type="submit" className="w-full min-h-[44px] px-4 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors">
                {showPasswordSetup ? 'Set Password' : 'Sign In'}
              </button>
              <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-400 mt-4">
                Example: sengcosimeon1106@gmail.com / CaputDraconis_1106
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#08090D] text-zinc-950 dark:text-zinc-100">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0B0E16]">
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">Admin Dashboard</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Orders · Revenue · Payments · Pricing</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">Sign Out</button>
            <button onClick={onBack} className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Return to Store</button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Orders" value={orders.length} icon="📦" color="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50" />
          <StatCard label="Gross Revenue" value={formatPhp(grossRevenue)} icon="💰" color="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50" />
          <StatCard label="Paid Revenue" value={formatPhp(paidRevenue)} icon="✅" color="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50" />
          <StatCard label="Pending Revenue" value={formatPhp(pendingRevenue)} icon="⏳" color="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="COD Revenue" value={formatPhp(codRevenue)} icon="💵" color="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" />
          <StatCard label="Orders by Payment" value={Object.keys(paymentMethodCounts).length} icon="💳" color="bg-zinc-50 dark:bg-zinc-950/20 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800/50" />
          <StatCard label="Paid Orders" value={paidCount} icon="✅" color="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50" />
          <StatCard label="Pending Orders" value={pendingCount} icon="⏳" color="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" />
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 mb-4">Revenue by Payment Method</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(revenueByMethod).map(([method, revenue]) => (
              <div key={method} className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#10131D]">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">{method}</span>
                <span className="text-sm font-bold text-zinc-950 dark:text-white">{formatPhp(revenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 mb-4">Order Count by Payment Method</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(paymentMethodCounts).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#10131D]">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">{method}</span>
                <span className="text-sm font-bold text-zinc-950 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 mb-4">Order Status Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#10131D] text-center">
              <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase">All</p>
              <p className="text-lg font-bold text-zinc-950 dark:text-white font-mono">{orders.length}</p>
            </div>
            <div className="px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 text-center">
              <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Pending</p>
              <p className="text-lg font-bold text-zinc-950 dark:text-white font-mono">{pendingCount}</p>
            </div>
            <div className="px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Paid</p>
              <p className="text-lg font-bold text-zinc-950 dark:text-white font-mono">{paidCount}</p>
            </div>
            <div className="px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 text-center">
              <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase">Shipped</p>
              <p className="text-lg font-bold text-zinc-950 dark:text-white font-mono">{shippedCount}</p>
            </div>
            <div className="px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Completed</p>
              <p className="text-lg font-bold text-zinc-950 dark:text-white font-mono">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">Orders</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Status:</span>
            {['all', 'pending', 'paid', 'shipped', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setViewStatus(s as OrderStatus | 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  viewStatus === s
                    ? 'bg-zinc-950 dark:bg-[#0D3BFF] text-white border-zinc-950 dark:border-[#0D3BFF]'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-500'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#10131D]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0B0E16]">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Order #</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Payment Method</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Items</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-right">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400">No orders found.</td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const subtotal = order.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
                  const status = order.status || 'pending';
                  const statusColor: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
                    paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
                    shipped: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
                    completed: 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
                    cancelled: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-800/50',
                  };
                  const statusShort: Record<string, string> = {
                    pending: 'Pending',
                    paid: 'Paid',
                    shipped: 'Shipped',
                    completed: 'Completed',
                    cancelled: 'Cancelled',
                  };
                  return (
                    <tr key={order.orderNumber} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                      <td className="px-4 py-3 text-xs font-mono font-medium text-zinc-900 dark:text-zinc-200">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-200">{order.customer.fullName}</td>
                      <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-400 capitalize">{order.customer.paymentMethod}</td>
                      <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                      <td className="px-4 py-3 text-sm font-mono font-medium text-zinc-950 dark:text-white text-right">{formatPhp(subtotal)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold border ${statusColor[status] || statusColor.pending}`}>
                          {statusShort[status]}
                        </span>
                        {onUpdateOrderStatus && status !== 'completed' && status !== 'cancelled' && (
                          <select
                            value={status}
                            onChange={(e) => setStatus(order.orderNumber, e.target.value as OrderStatus)}
                            className="mt-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-[#0D3BFF]"
                            aria-label={`Update status for ${order.orderNumber}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openOrderDetail(order)} className="text-[10px] font-semibold text-[#0D3BFF] dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400">No orders yet. Orders will appear here once customers complete checkout.</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#10131D] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-950 dark:text-white">Order {selectedOrder.orderNumber}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Placed {new Date(selectedOrder.createdAt).toLocaleString('en-PH')}</p>
              </div>
              <button onClick={closeOrderDetail} className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Customer</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                  {selectedOrder.customer.fullName} · {selectedOrder.customer.email}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  {selectedOrder.customer.address}, {selectedOrder.customer.city} {selectedOrder.customer.province} {selectedOrder.customer.postalCode}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">Contact: {selectedOrder.customer.contactNumber}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Payment Method</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium capitalize">
                  {selectedOrder.customer.paymentMethod}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Payment Details</p>
                {selectedOrder.customer.paymentMethod === 'gcash' && (
                  <p className="text-zinc-900 dark:text-zinc-100">
                    Recipient: {selectedOrder.customer.fullName} · GCash Number: {selectedOrder.customer.ewalletNumber || '—'}
                  </p>
                )}
                {selectedOrder.customer.paymentMethod === 'maya' && (
                  <p className="text-zinc-900 dark:text-zinc-100">
                    Recipient: {selectedOrder.customer.fullName} · Maya Number: {selectedOrder.customer.ewalletNumber || '—'}
                  </p>
                )}
                {selectedOrder.customer.paymentMethod === 'bank-transfer' && (
                  <p className="text-zinc-900 dark:text-zinc-100">
                    Bank Account: {selectedOrder.customer.bankAccountNumber || '—'} · {selectedOrder.customer.bankAccountName || '—'} · {selectedOrder.customer.bankName || '—'}
                  </p>
                )}
                {selectedOrder.customer.paymentMethod === 'cod' && (
                  <p className="text-zinc-900 dark:text-zinc-100">
                    Cash on Delivery · Amount Due: {formatPhp(selectedOrder.summary.total)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Reference / Transaction Number</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-mono">{selectedOrder.customer.referenceNumber || '—'}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Receipt</p>
                {selectedOrder.customer.paymentProofBase64 ? (
                  <img src={selectedOrder.customer.paymentProofBase64} alt="Payment proof" className="w-full max-h-56 object-contain rounded-lg border border-zinc-200 dark:border-zinc-700" />
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs">No payment proof attached.</p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Items</p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {item.product.name} · Size {item.size} × {item.quantity}
                    </span>
                    <span className="font-mono text-zinc-950 dark:text-white">{formatPhp(item.lineTotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 font-bold text-zinc-950 dark:text-white">
                  <span>Total</span>
                  <span className="font-mono">{formatPhp(selectedOrder.summary.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`px-5 py-4 rounded-xl border ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">{label}</span>
      </div>
      <div className="text-lg font-bold text-zinc-950 dark:text-white font-mono tabular-nums">{value}</div>
    </div>
  );
}
