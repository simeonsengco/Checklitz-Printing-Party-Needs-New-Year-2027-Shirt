import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  Shirt,
  Truck,
} from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { formatPhp } from '../lib/store';
import { Product, ShirtSize } from '../types/store';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  product: Product;
  onBackToShop: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onQuickAdd: (product: Product, size: ShirtSize) => void;
  onAddToCart: (product: Product, size: ShirtSize, quantity: number) => void;
  onBuyNow: (product: Product, size: ShirtSize, quantity: number) => void;
  onOpenSizeGuide: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBackToShop,
  onSelectProduct,
  onQuickView,
  onQuickAdd,
  onAddToCart,
  onBuyNow,
  onOpenSizeGuide,
}) => {
  const { products } = useProducts();
  const [selectedSize, setSelectedSize] = useState<ShirtSize>('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    setImgError(false);
  }, [product.id]);

  const activeImage = product.images[activeImageIdx] ?? product.images[0];
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>

        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          2027 Collection · {product.collectionTheme}
        </span>
      </div>

      {/* Main 2-Column Contiguous PDP Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Sticky Gallery */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-4">
          <div className="relative bg-[#F3F4F6] dark:bg-[#0D1018] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 aspect-[4/5] max-h-[560px] w-full flex items-center justify-center overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.22),transparent_68%)]"
            />
            {!imgError ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage.src}
                  src={activeImage.src}
                  alt={`${product.name} — ${activeImage.label}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-[1] w-full h-full object-contain drop-shadow-[0_18px_32px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_24px_38px_rgba(0,0,0,0.65)]"
                />
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <Shirt className="w-16 h-16" />
                <span className="text-sm">{product.name}</span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border bg-white dark:bg-[#121520] transition-all ${
                    activeImageIdx === idx
                      ? 'border-[#0D3BFF] dark:border-blue-400 ring-2 ring-[#0D3BFF]/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-contain bg-[#F3F4F6] dark:bg-[#0D1018] rounded-md p-1"
                  />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Sticky Purchase Module */}
        <div className="lg:col-span-5 space-y-6 bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0D3BFF] dark:text-blue-400">
              {product.collectionTheme}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white mt-1.5 leading-tight">
              {product.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {product.subtitle}
            </p>

            <div className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white">
                {formatPhp(product.price)}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                In Stock · Ready to Ship
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {product.description}
          </p>

          {/* Color Swatch */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Color:{' '}
              <span className="font-normal text-zinc-600 dark:text-zinc-400">
                {product.colorName}
              </span>
            </span>
            <span
              className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-600 inline-block"
              style={{ backgroundColor: product.colorHex }}
              title={product.colorName}
            />
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Select Size:{' '}
                <span className="text-[#0D3BFF] dark:text-blue-400">
                  {selectedSize}
                </span>
              </span>
              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white underline underline-offset-2"
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
                  className={`min-h-[42px] rounded-lg text-xs font-semibold border transition-colors ${
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

          {/* Quantity & Action CTAs */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="min-w-[42px] min-h-[46px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-l-xl"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-mono tabular-nums font-semibold text-zinc-950 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="Increase quantity"
                  className="min-w-[42px] min-h-[46px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-r-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => !product.soldOut && onAddToCart(product, selectedSize, quantity)}
                disabled={product.soldOut}
                className="flex-1 min-h-[46px] px-5 py-3 rounded-xl text-sm font-semibold transition-colors {product.soldOut && 'bg-zinc-400 text-zinc-200 cursor-not-allowed opacity-50' || 'bg-zinc-950 dark:bg-[#0D3BFF] text-white hover:bg-[#0D3BFF] dark:hover:bg-blue-500'}"
              >
                {product.soldOut ? 'Sold Out' : `Add to Cart — ${formatPhp(product.price * quantity)}`}
              </motion.button>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => !product.soldOut && onBuyNow(product, selectedSize, quantity)}
              disabled={product.soldOut}
              className="w-full min-h-[46px] px-5 py-3 rounded-xl text-sm font-semibold transition-colors {product.soldOut && 'border border-zinc-400 text-zinc-500 dark:text-zinc-500 cursor-not-allowed opacity-50' || 'border border-zinc-950 dark:border-zinc-600 text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80'}"
            >
              {product.soldOut ? 'Sold Out' : 'Buy Now'}
            </motion.button>
          </div>

          {/* Design Highlights */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Design Highlights
            </h2>
            <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              {product.designHighlights.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#0D3BFF] dark:text-blue-400 mt-0.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Garment &amp; Print Specifications
            </h2>
            <dl className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Material</dt>
                <dd className="text-zinc-900 dark:text-zinc-100 font-medium text-right">
                  {product.fabricSpecs.material}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Fabric Weight</dt>
                <dd className="text-zinc-900 dark:text-zinc-100 font-medium text-right">
                  {product.fabricSpecs.weight}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Fit</dt>
                <dd className="text-zinc-900 dark:text-zinc-100 font-medium text-right">
                  {product.fabricSpecs.fit}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Print Process</dt>
                <dd className="text-zinc-900 dark:text-zinc-100 font-medium text-right">
                  {product.fabricSpecs.printMethod}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Care</dt>
                <dd className="text-zinc-900 dark:text-zinc-100 font-medium text-right max-w-[60%]">
                  {product.fabricSpecs.care}
                </dd>
              </div>
            </dl>
          </div>

          {/* Philippine Shipping Info */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 bg-zinc-50 dark:bg-zinc-900/70 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
              <Truck className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  Nationwide Shipping
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                  2–4 days Metro Manila · 4–7 days Provincial. Free at ₱1,500+.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-zinc-50 dark:bg-zinc-900/70 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  PH Payments
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                  GCash, Maya, Cash on Delivery, or Bank Transfer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white">
            More from the 2027 Drop
          </h2>
          <button
            type="button"
            onClick={onBackToShop}
            className="text-sm font-semibold text-[#0D3BFF] dark:text-blue-400 hover:underline"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {relatedProducts.map((rel, index) => (
            <ProductCard
              key={rel.id}
              product={rel}
              index={index}
              onSelectProduct={onSelectProduct}
              onQuickView={onQuickView}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
