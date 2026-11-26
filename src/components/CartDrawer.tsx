import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD } from '../data/products';
import { formatPhp } from '../lib/store';
import { CartItem, CartSummary, Product, ShirtSize } from '../types/store';

interface CartDrawerProps {
  open: boolean;
  cart: CartItem[];
  products: Product[];
  summary: CartSummary;
  onClose: () => void;
  onUpdateQuantity: (productId: string, size: ShirtSize, nextQuantity: number) => void;
  onRemoveItem: (productId: string, size: ShirtSize) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  cart,
  products,
  summary,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const progressPercent = Math.min(
    100,
    Math.round((summary.subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="w-full max-w-md bg-white dark:bg-[#10131D] h-full flex flex-col shadow-2xl border-l border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-zinc-950 dark:text-white" />
                <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                  Your Bag ({summary.itemsCount})
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close shopping cart"
                className="min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {summary.itemsCount > 0 && (
              <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {summary.qualifiesForFreeShipping ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      You unlocked Free Nationwide Shipping!
                    </span>
                  ) : (
                    <>
                      Add{' '}
                      <span className="font-mono font-semibold text-zinc-950 dark:text-white">
                        {formatPhp(summary.freeShippingRemaining)}
                      </span>{' '}
                      more for Free Nationwide Shipping
                    </>
                  )}
                </p>
                <div className="mt-2 h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      summary.qualifiesForFreeShipping
                        ? 'bg-emerald-600'
                        : 'bg-[#0D3BFF]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Line Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-4">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                    Your shopping bag is empty
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                    Explore the 2027 New Year Collection and add your favorite shirt designs.
                  </p>
                  <button
                    type="button"
                    onClick={onContinueShopping}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors"
                  >
                    Shop 2027 Tees
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const product = productMap.get(item.productId);
                  if (!product) return null;

                  return (
                    <motion.div
                      layout
                      key={`${item.productId}-${item.size}`}
                      className="py-4 flex gap-4"
                    >
                      <div className="w-20 h-24 rounded-lg bg-[#F3F4F6] dark:bg-[#0B0D14] border border-zinc-200/80 dark:border-zinc-800 p-1.5 shrink-0 flex items-center justify-center">
                        <img
                          src={product.images[0].src}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white leading-snug line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              Size {item.size} · {product.colorName}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.productId, item.size)}
                            aria-label={`Remove ${product.name} size ${item.size}`}
                            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.productId,
                                  item.size,
                                  item.quantity - 1
                                )
                              }
                              aria-label={`Decrease quantity for ${product.name}`}
                              className="min-w-[32px] min-h-[32px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-l-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono tabular-nums font-semibold text-zinc-950 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.productId,
                                  item.size,
                                  item.quantity + 1
                                )
                              }
                              aria-label={`Increase quantity for ${product.name}`}
                              className="min-w-[32px] min-h-[32px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-r-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-mono tabular-nums text-sm font-semibold text-zinc-950 dark:text-white">
                            {formatPhp(product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Summary & Checkout Action */}
            {cart.length > 0 && (
              <div className="px-6 py-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#0C0F17] space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums font-medium text-zinc-950 dark:text-white">
                      {formatPhp(summary.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Shipping (Nationwide PH)</span>
                    <span className="font-mono tabular-nums font-medium text-zinc-950 dark:text-white">
                      {summary.shippingFee === 0
                        ? 'Free'
                        : formatPhp(summary.shippingFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-base font-bold text-zinc-950 dark:text-white">
                    <span>Estimated Total</span>
                    <span className="font-mono tabular-nums">
                      {formatPhp(summary.total)}
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={onProceedToCheckout}
                  data-testid="proceed-to-checkout-button"
                  className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
