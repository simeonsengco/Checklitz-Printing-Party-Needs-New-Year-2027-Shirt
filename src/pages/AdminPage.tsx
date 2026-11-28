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
const ADMIN_PASSWORD = 'CaputDraconis_1106';
const ORDER_STORAGE_KEY = 'checklitz_orders_v1';

export const AdminPage: React.FC<AdminPageProps> = ({
  onBack,
  orders: initialOrders,
  products,
  onUpdateOrderStatus,
}) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [orders, setOrders] = useState<OrderReceipt[]>(initialOrders);

  const [viewStatus, setViewStatus] = useState<OrderStatus | 'all'>('all');

  useMemo(() => {
    try {
      const raw = localStorage.getItem(ORDER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setOrders(parsed);
      }
    } catch {}
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setEmail('');
    setPassword('');
    setLoginError('');
  };

  const saveOrder = useCallback(
    (order: OrderReceipt) => {
      const next = [order, ...orders].slice(0, 500);
      setOrders(next);
      try {
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next));
      } catch {}
    },
    [orders]
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

  const filtered = orders.filter(
    (o) => viewStatus === 'all' || o.status === viewStatus
  );

  const revenue = useMemo(
    () =>
      orders.reduce((sum, o) => {
        const subtotal = o.items.reduce(
          (s, i) => s + i.product.price * i.quantity,
          0
        );
        return sum + subtotal;
      }, 0),
    [orders]
  );

  const paidCount = orders.filter((o) => o.status === 'paid').length;
  const pendingCount = orders.filter(
    (o) => o.status === 'pending' || !o.status
  ).length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const paymentMethodCounts = useMemo(
    () =>
      orders.reduce(
        (acc, o) => {
          const m = o.customer.paymentMethod;
          acc[m] = (acc[m] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    [orders]
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#08090D] text-[#111317] dark:text-zinc-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-[#0D3BFF] dark:hover:text-blue-400"
          >
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
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sengcosimeon1106@gmail.com"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                  required
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-500 font-medium">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] px-4 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors"
              >
                Sign In
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
            <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
              Admin Dashboard
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Orders · Revenue · Payments · Pricing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
            <button
              onClick={onBack}
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Return to Store
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Orders"
            value={orders.length}
            icon="📦"
            color="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50"
          />
          <StatCard
            label="Total Revenue"
            value={formatPhp(revenue)}
            icon="💰"
            color="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
          />
          <StatCard
            label="Paid"
            value={paidCount}
            icon="✅"
            color="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            icon="⏳"
            color="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
          />
        </div>

        {/* Payment method breakdown */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 mb-4">
            Orders by Payment Method
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(paymentMethodCounts).map(([method, count]) => (
              <div
                key={method}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#10131D]"
              >
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                  {method}
                </span>
                <span className="text-sm font-bold text-zinc-950 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Filter by status:
          </span>
          {['all', 'pending', 'paid', 'shipped', 'completed', 'cancelled'].map(
            (s) => (
              <button
                key={s}
                onClick={() => setViewStatus(s as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  viewStatus === s
                    ? 'bg-zinc-950 dark:bg-[#0D3BFF] text-white border-zinc-950 dark:border-[#0D3BFF]'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-500'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Orders table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#10131D]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0B0E16]">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Order #
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Customer
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Items
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-right">
                  Total
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const subtotal = order.items.reduce(
                    (s, i) => s + i.product.price * i.quantity,
                    0
                  );
                  const status = order.status || 'pending';
                  const statusColor: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
                    paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
                    shipped: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
                    completed: 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
                    cancelled: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-800/50',
                  };
                  return (
                    <tr
                      key={order.orderNumber}
                      className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                    >
                      <td className="px-4 py-3 text-xs font-mono font-medium text-zinc-900 dark:text-zinc-200">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-200">
                        {order.customer.fullName}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-400 capitalize">
                        {order.customer.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-400">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-medium text-zinc-950 dark:text-white text-right">
                        {formatPhp(subtotal)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold border ${statusColor[status] || statusColor.pending}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        {onUpdateOrderStatus && status !== 'completed' && status !== 'cancelled' && (
                          <select
                            value={status}
                            onChange={(e) =>
                              setStatus(
                                order.orderNumber,
                                e.target.value as OrderStatus
                              )
                            }
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
                        {new Date(order.createdAt).toLocaleDateString(
                          'en-PH',
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {order.status === 'paid' && (
                          <button
                            onClick={() =>
                              setStatus(order.orderNumber, 'shipped')
                            }
                            className="text-[10px] font-semibold text-[#0D3BFF] dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() =>
                              setStatus(order.orderNumber, 'completed')
                            }
                            className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          >
                            Mark Completed
                          </button>
                        )}
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
            <p className="text-zinc-500 dark:text-zinc-400">
              No orders yet. Orders will appear here once customers complete checkout.
            </p>
          </div>
        )}
      </div>
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
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <div className="text-lg font-bold text-zinc-950 dark:text-white font-mono tabular-nums">
        {value}
      </div>
    </div>
  );
}
