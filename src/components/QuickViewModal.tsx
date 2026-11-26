import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Minus, Plus, Ruler, Shirt, X } from 'lucide-react';
import { formatPhp } from '../lib/store';
import { Product, ShirtSize } from '../types/store';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: ShirtSize, quantity: number) => void;
  onOpenFullDetails: (product: Product) => void;
  onOpenSizeGuide: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenFullDetails,
  onOpenSizeGuide,
}) => {
  const [selectedSize, setSelectedSize] = useState<ShirtSize>('M');
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setSelectedSize('M');
    setQuantity(1);
    setImageIndex(0);
    setImgError(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="relative w-full max-w-3xl bg-white dark:bg-[#121520] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute top-3 right-3 z-10 min-w-[40px] min-h-[40px] rounded-lg bg-white/95 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-950 hover:text-white dark:hover:bg-[#0D3BFF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Image Stage */}
            <div className="bg-[#F3F4F6] dark:bg-[#0D1018] p-6 flex flex-col items-center justify-center gap-4">
              <div className="w-full aspect-[4/5] flex items-center justify-center">
                {!imgError ? (
                  <img
                    src={(product.images[imageIndex] ?? product.images[0]).src}
                    alt={`${product.name} — ${(product.images[imageIndex] ?? product.images[0]).label}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.3)]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <Shirt className="w-12 h-12" />
                    <span className="text-xs">{product.name}</span>
                  </div>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="flex items-center gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setImageIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        (imageIndex < product.images.length ? imageIndex : 0) === idx
                          ? 'bg-zinc-950 dark:bg-[#0D3BFF] text-white border-zinc-950 dark:border-[#0D3BFF]'
                          : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Purchase Info */}
            <div className="p-6 sm:p-7 flex flex-col justify-between gap-5">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {product.collectionTheme} · {product.colorName}
                </p>
                <h2
                  id="quick-view-title"
                  className="font-display text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white mt-1 leading-tight"
                >
                  {product.name}
                </h2>
                <p className="font-mono tabular-nums text-xl font-bold text-zinc-950 dark:text-white mt-2">
                  {formatPhp(product.price)}
                </p>

                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Size Picker */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Size: <span className="text-[#0D3BFF] dark:text-blue-400">{selectedSize}</span>
                    </span>
                    <button
                      type="button"
                      onClick={onOpenSizeGuide}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white underline underline-offset-2"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-h-[40px] rounded-lg text-xs font-semibold border transition-colors ${
                          selectedSize === size
                            ? 'bg-zinc-950 dark:bg-[#0D3BFF] text-white border-zinc-950 dark:border-[#0D3BFF]'
                            : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-zinc-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Quantity
                  </span>
                  <div className="inline-flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="min-w-[38px] min-h-[38px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-l-lg"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-mono tabular-nums font-semibold text-zinc-950 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      aria-label="Increase quantity"
                      className="min-w-[38px] min-h-[38px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-r-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onAddToCart(product, selectedSize, quantity);
                    onClose();
                  }}
                  className="w-full min-h-[44px] px-5 py-3 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors"
                >
                  Add to Cart — {formatPhp(product.price * quantity)}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFullDetails(product);
                  }}
                  className="w-full min-h-[40px] px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:border-zinc-950 dark:hover:border-white transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>View Full Product Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
