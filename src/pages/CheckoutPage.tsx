import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Info,
  Landmark,
  ShieldCheck,
  Smartphone,
  Truck,
} from 'lucide-react';
import { BUSINESS_INFO, PH_PROVINCES } from '../data/products';
import {
  formatPhp,
  generateOrderNumber,
  getPaymentMethodSummary,
  validateCheckoutForm,
} from '../lib/store';
import {
  CartItem,
  CartSummary,
  CheckoutForm,
  OrderReceipt,
  PaymentMethod,
  Product,
} from '../types/store';

interface CheckoutPageProps {
  cart: CartItem[];
  products: Product[];
  summary: CartSummary;
  onBackToShop: () => void;
  onOrderComplete: (receipt: OrderReceipt) => void;
  lastOrder: OrderReceipt | null;
}

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'gcash',
    label: 'GCash',
    description: 'Send via GCash to 09934039625',
    icon: <Smartphone className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400" />,
  },
  {
    id: 'maya',
    label: 'Maya',
    description: 'Send via Maya to 09934039625',
    icon: <CreditCard className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400" />,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery (COD)',
    description: 'Pay the courier in cash when your parcel arrives',
    icon: <Truck className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400" />,
  },
  {
    id: 'bank-transfer',
    label: 'Bank Transfer (Land Bank)',
    description: 'InstaPay or PESONet transfer to Land Bank Savings Account',
    icon: <Landmark className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400" />,
  },
];

const EWALLET_NUMBER = '09934039625';

const LANDBANK_DETAILS = {
  name: 'Land Bank of the Philippines (LandBank)',
  accountType: 'Savings Account',
  accountName: 'Simeon Sengco III',
  accountNo: '0486223324',
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  products,
  summary,
  onBackToShop,
  onOrderComplete,
  lastOrder,
}) => {
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    contactNumber: '',
    address: '',
    city: '',
    province: 'Metro Manila (NCR)',
    postalCode: '',
    paymentMethod: 'gcash',
    bankProvider: 'LandBank',
    codChangeFor: 'Exact Amount',
    notes: '',
  });
  const [copiedKey, setCopiedKey] = useState<'ewallet' | 'landbank' | null>(null);

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const productMap = new Map(products.map((p) => [p.id, p]));

  const updateField = <K extends keyof CheckoutForm>(
    key: K,
    value: CheckoutForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateCheckoutForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const orderItems = cart
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          product,
          size: item.size,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const receipt: OrderReceipt = {
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      customer: { ...form },
      items: orderItems,
      summary: { ...summary },
    };

    onOrderComplete(receipt);
  };

  // Post-Order Confirmation View
  if (lastOrder) {
    const paymentInfo = getPaymentMethodSummary(lastOrder.customer);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-7 sm:p-10 space-y-6"
        >
          <div className="flex items-start gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
                Order Confirmed (Demo Checkout)
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white mt-1">
                Order #{lastOrder.orderNumber} — Preparing Shipment
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1.5">
                Thank you, {lastOrder.customer.fullName}. A copy of this summary is ready for {lastOrder.customer.email}. No live payment was charged in this demo checkout.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Shipping Destination
              </h2>
              <p className="font-semibold text-zinc-950 dark:text-white">
                {lastOrder.customer.fullName}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                {lastOrder.customer.contactNumber}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300 mt-1">
                {lastOrder.customer.address}, {lastOrder.customer.city},{' '}
                {lastOrder.customer.province} {lastOrder.customer.postalCode}
              </p>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Payment &amp; Dispatch
              </h2>
              <p className="font-semibold text-zinc-950 dark:text-white">
                {paymentInfo.title}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {paymentInfo.detail}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300 mt-1.5">
                Placed: {lastOrder.createdAt}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                Dispatched from: {BUSINESS_INFO.address}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Need help? {BUSINESS_INFO.phone} · {BUSINESS_INFO.email}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Items Ordered
            </h2>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {lastOrder.items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="py-3 flex items-center justify-between gap-4 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0].src}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 object-contain bg-[#F3F4F6] dark:bg-[#0D1018] rounded-lg p-1"
                    />
                    <div>
                      <p className="font-semibold text-zinc-950 dark:text-white">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Size {item.size} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-zinc-950 dark:text-white">
                    {formatPhp(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  {formatPhp(lastOrder.summary.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Shipping</span>
                <span className="font-mono tabular-nums">
                  {lastOrder.summary.shippingFee === 0
                    ? 'Free'
                    : formatPhp(lastOrder.summary.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-950 dark:text-white pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums">
                  {formatPhp(lastOrder.summary.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToShop}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Empty Cart Guard
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 space-y-4">
          <h1 className="font-display text-2xl font-bold text-zinc-950 dark:text-white">
            Your cart is empty
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add at least one shirt design from our shop before checking out.
          </p>
          <button
            type="button"
            onClick={onBackToShop}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] transition-colors"
          >
            Browse Shirts
          </button>
        </div>
      </div>
    );
  }

  const handleCopy = async (value: string, key: 'ewallet' | 'landbank') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Ignore clipboard permission restrictions
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shop</span>
        </button>
        <h1 className="font-display text-3xl font-bold text-zinc-950 dark:text-white mt-2">
          Checkout
        </h1>
      </div>

      {/* Clear Demo Checkout Indicator */}
      <div
        role="note"
        className="mb-8 flex items-start gap-3 bg-blue-50 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-800/70 rounded-xl px-4 py-3 text-xs sm:text-sm text-blue-950 dark:text-blue-100"
      >
        <Info className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold">Demo Checkout Mode:</span> This storefront demonstrates the complete Philippine checkout experience (GCash, Maya, COD, and Bank Transfer) without processing real payments or charging accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Shipping & Payment Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-7 bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-8"
        >
          {/* Customer Contact */}
          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
              1. Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-fullname"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="checkout-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="juan@example.ph"
                  className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  Mobile Number (PH) *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={form.contactNumber}
                  onChange={(e) => updateField('contactNumber', e.target.value)}
                  placeholder="0917 123 4567"
                  className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                />
                {errors.contactNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.contactNumber}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
              2. Philippine Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  House / Unit No., Street &amp; Barangay *
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="48 Mabini St., Brgy. Kapitolyo"
                  className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-city"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  City / Municipality *
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Pasig City"
                  className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                />
                {errors.city && (
                  <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-province"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  Province / Region *
                </label>
                <select
                  id="checkout-province"
                  value={form.province}
                  onChange={(e) => updateField('province', e.target.value)}
                  className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white focus:outline-none focus:border-[#0D3BFF]"
                >
                  {PH_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="text-xs text-red-500 mt-1">{errors.province}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-postal"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  Postal Code *
                </label>
                <input
                  id="checkout-postal"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="1603"
                  className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono tabular-nums text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                />
                {errors.postalCode && (
                  <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-notes"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  Landmark / Delivery Note (Optional)
                </label>
                <input
                  id="checkout-notes"
                  type="text"
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Near barangay hall"
                  className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
              3. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map((option) => {
                const selected = form.paymentMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateField('paymentMethod', option.id)}
                    aria-pressed={selected}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      selected
                        ? 'border-[#0D3BFF] dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-[#0D3BFF] dark:ring-blue-400'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/60'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{option.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Payment Instructions Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={form.paymentMethod}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 p-4 text-xs sm:text-sm space-y-2.5"
              >
                {form.paymentMethod === 'gcash' && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-950 dark:text-white">
                        GCash Payment Details
                      </p>
                      <span className="text-[11px] font-semibold text-[#0D3BFF] dark:text-blue-400">
                        E-Wallet Transfer
                      </span>
                    </div>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-[#0D1018] p-3.5 text-xs text-zinc-700 dark:text-zinc-200 space-y-1.5">
                      <p>
                        Recipient:{' '}
                        <span className="font-semibold text-zinc-950 dark:text-white">
                          {BUSINESS_INFO.name}
                        </span>
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="font-mono text-sm font-bold text-zinc-950 dark:text-white">
                          GCash Number: {EWALLET_NUMBER}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopy(EWALLET_NUMBER, 'ewallet')}
                          className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:border-[#0D3BFF] dark:hover:border-blue-400 transition-colors inline-flex items-center gap-1 shrink-0"
                        >
                          {copiedKey === 'ewallet' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy No.</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Send {formatPhp(summary.total)} to {EWALLET_NUMBER} and include your Order Number in your GCash note (demo checkout).
                    </p>
                  </>
                )}

                {form.paymentMethod === 'maya' && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-950 dark:text-white">
                        Maya Payment Details
                      </p>
                      <span className="text-[11px] font-semibold text-[#0D3BFF] dark:text-blue-400">
                        Maya Wallet Transfer
                      </span>
                    </div>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-[#0D1018] p-3.5 text-xs text-zinc-700 dark:text-zinc-200 space-y-1.5">
                      <p>
                        Recipient:{' '}
                        <span className="font-semibold text-zinc-950 dark:text-white">
                          {BUSINESS_INFO.name}
                        </span>
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="font-mono text-sm font-bold text-zinc-950 dark:text-white">
                          Maya Number: {EWALLET_NUMBER}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopy(EWALLET_NUMBER, 'ewallet')}
                          className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:border-[#0D3BFF] dark:hover:border-blue-400 transition-colors inline-flex items-center gap-1 shrink-0"
                        >
                          {copiedKey === 'ewallet' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy No.</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Send {formatPhp(summary.total)} to Maya number {EWALLET_NUMBER} and attach your Order Number (demo checkout).
                    </p>
                  </>
                )}

                {form.paymentMethod === 'cod' && (
                  <>
                    <p className="font-semibold text-zinc-950 dark:text-white">
                      Cash on Delivery Verification — Amount Due:{' '}
                      <span className="font-mono">{formatPhp(summary.total)}</span>
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      Available nationwide. Let our courier know if you need change:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Exact Amount', '₱1,000 Bill', '₱2,000 Bill'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => updateField('codChangeFor', opt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            form.codChangeFor === opt
                              ? 'bg-zinc-950 dark:bg-[#0D3BFF] text-white border-zinc-950 dark:border-[#0D3BFF]'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {form.paymentMethod === 'bank-transfer' && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-950 dark:text-white">
                        Bank Transfer — InstaPay / PESONet
                      </p>
                      <span className="text-[11px] font-semibold text-[#0D3BFF] dark:text-blue-400">
                        {LANDBANK_DETAILS.accountType}
                      </span>
                    </div>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-[#0D1018] p-3.5 text-xs text-zinc-700 dark:text-zinc-200 space-y-1.5">
                      <p>
                        Bank:{' '}
                        <span className="font-semibold text-zinc-950 dark:text-white">
                          {LANDBANK_DETAILS.name}
                        </span>
                      </p>
                      <p>
                        Account Name:{' '}
                        <span className="font-semibold text-zinc-950 dark:text-white">
                          {LANDBANK_DETAILS.accountName}
                        </span>
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="font-mono text-sm font-bold text-zinc-950 dark:text-white">
                          Savings Account: {LANDBANK_DETAILS.accountNo}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopy(LANDBANK_DETAILS.accountNo, 'landbank')}
                          className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:border-[#0D3BFF] dark:hover:border-blue-400 transition-colors inline-flex items-center gap-1 shrink-0"
                        >
                          {copiedKey === 'landbank' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy No.</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Transfer {formatPhp(summary.total)} via InstaPay or PESONet and include your Order Number in the transfer remarks.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </section>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.99 }}
            data-testid="place-order-button"
            className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Place Demo Order — {formatPhp(summary.total)}</span>
          </motion.button>
        </form>

        {/* Right Order Summary */}
        <aside className="lg:col-span-5 bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 space-y-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800">
            Order Summary ({summary.itemsCount} item{summary.itemsCount === 1 ? '' : 's'})
          </h2>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[360px] overflow-y-auto pr-1">
            {cart.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) return null;
              return (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-16 rounded-lg bg-[#F3F4F6] dark:bg-[#0D1018] border border-zinc-200/80 dark:border-zinc-800 p-1 shrink-0 flex items-center justify-center">
                      <img
                        src={product.images[0].src}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-950 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Size {item.size} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-sm font-semibold text-zinc-950 dark:text-white shrink-0">
                    {formatPhp(product.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums font-medium text-zinc-950 dark:text-white">
                {formatPhp(summary.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Nationwide Shipping</span>
              <span className="font-mono tabular-nums font-medium text-zinc-950 dark:text-white">
                {summary.shippingFee === 0 ? 'Free' : formatPhp(summary.shippingFee)}
              </span>
            </div>
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-base font-bold text-zinc-950 dark:text-white">
              <span>Total Amount</span>
              <span className="font-mono tabular-nums">
                {formatPhp(summary.total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
