import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, ShoppingBag, Shirt } from 'lucide-react';
import { formatPhp } from '../lib/store';
import { Product, ShirtSize } from '../types/store';

interface ProductCardProps {
  product: Product;
  index?: number;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onQuickAdd: (product: Product, size: ShirtSize) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  onSelectProduct,
  onQuickView,
  onQuickAdd,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [showBackOnHover, setShowBackOnHover] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const hasBackImage = product.images.length > 1;
  const activeImage =
    showBackOnHover && hasBackImage ? product.images[1] : product.images[0];

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.soldOut) return;
    onQuickAdd(product, 'M');
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1200);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.25),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      className="group flex flex-col bg-white dark:bg-[#121520] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl overflow-hidden transition-shadow duration-200 hover:shadow-xl dark:hover:shadow-[0_18px_40px_-16px_rgba(13,59,255,0.28)] dark:hover:border-zinc-700"
      onMouseEnter={() => hasBackImage && setShowBackOnHover(true)}
      onMouseLeave={() => hasBackImage && setShowBackOnHover(false)}
    >
      {/* Studio Image Stage */}
      <div className="relative aspect-[4/5] bg-[#F3F4F6] dark:bg-[#0D1018] overflow-hidden">
        {/* Subtle studio radial glow behind shirt in dark mode */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.22),transparent_68%)] transition-opacity duration-300 group-hover:opacity-100"
        />

        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          aria-label={`View details for ${product.name}`}
          className="relative z-[1] w-full h-full p-4 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0D3BFF]"
        >
          {!imageFailed ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage.src}
                src={activeImage.src}
                alt={`${product.name} — ${activeImage.label}`}
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                initial={{ opacity: 0.65, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.65 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Shirt className="w-12 h-12" />
              <span className="text-xs font-medium text-zinc-500 text-center px-4">
                {product.name}
              </span>
            </div>
          )}
        </button>

        {/* Quick View Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label={`Quick view ${product.name}`}
          className="absolute top-2.5 right-2.5 z-[2] min-h-[32px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/95 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 shadow-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-all duration-150 hover:bg-zinc-950 hover:text-white dark:hover:bg-[#0D3BFF] dark:hover:border-[#0D3BFF]"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick View</span>
        </button>

        {hasBackImage && (
          <span className="absolute bottom-2.5 left-2.5 sm:left-3 z-[2] text-[10px] sm:text-[11px] font-medium text-zinc-700 dark:text-zinc-200 bg-white/90 dark:bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-200/80 dark:border-zinc-700/80">
            {showBackOnHover ? 'Back Print' : 'Front + Back'}
          </span>
        )}
        {product.soldOut && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center bg-black/60 dark:bg-black/70" aria-hidden="true">
            <span className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>{product.collectionTheme}</span>
            {product.tag && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#0D3BFF] dark:text-blue-400 font-medium">
                  {product.tag}
                </span>
              </>
            )}
          </div>

          <h3 className="font-display font-semibold text-sm sm:text-base text-zinc-950 dark:text-white leading-snug line-clamp-2">
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="text-left hover:text-[#0D3BFF] dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {product.name}
            </button>
          </h3>

          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
            {product.colorName} · XS–2XL
          </p>
        </div>

        <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <span className="font-mono tabular-nums text-[15px] sm:text-base font-semibold text-zinc-950 dark:text-white">
            {formatPhp(product.price)}
          </span>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleQuickAddClick}
            disabled={product.soldOut}
            className={`w-full sm:w-auto min-h-[38px] px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3BFF] ${
              product.soldOut
                ? 'bg-zinc-400 text-zinc-200 cursor-not-allowed opacity-50'
                : addedFeedback
                ? 'bg-emerald-700 text-white'
                : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-[#0D3BFF] dark:hover:bg-blue-400 dark:hover:text-zinc-950'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.soldOut ? 'Sold Out' : addedFeedback ? 'Added (M)' : 'Add to Cart'}</span>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};
