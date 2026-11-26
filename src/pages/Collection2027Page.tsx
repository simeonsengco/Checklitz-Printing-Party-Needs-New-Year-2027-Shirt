import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { PRODUCTS } from '../data/products';
import { filterAndSortProducts } from '../lib/store';
import { CollectionTheme, Product, ShirtSize } from '../types/store';
import { ProductCard } from '../components/ProductCard';

interface Collection2027PageProps {
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onQuickAdd: (product: Product, size: ShirtSize) => void;
}

const THEMES: Array<{ id: CollectionTheme | 'All'; label: string; caption: string }> = [
  {
    id: 'All',
    label: 'All 2027 Drops',
    caption: 'Complete capsule of 7 original Checklitz 2027 shirt designs.',
  },
  {
    id: 'Fire Goat Zodiac',
    label: 'Fire Goat Zodiac',
    caption: 'Year of the Fire Goat crests, lucky lanterns, and varsity mascot prints.',
  },
  {
    id: 'Hello 2027 & Party',
    label: 'Hello 2027 & Party',
    caption: 'Fireworks, rainbow 2027 typography, disco balls, and geometric color-blocks.',
  },
  {
    id: '2027 Club Street',
    label: '2027 Club Street',
    caption: 'Dual-sided front & back neck crest tees with Y2K chrome 2027 artwork.',
  },
];

export const Collection2027Page: React.FC<Collection2027PageProps> = ({
  onSelectProduct,
  onQuickView,
  onQuickAdd,
}) => {
  const [activeTheme, setActiveTheme] = useState<CollectionTheme | 'All'>('All');

  const items = useMemo(
    () =>
      filterAndSortProducts(PRODUCTS, {
        theme: activeTheme,
        sort: 'featured',
      }),
    [activeTheme]
  );

  const currentThemeObj = THEMES.find((t) => t.id === activeTheme) ?? THEMES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Fashion-Oriented Cinematic Collection Header */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 mb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(13,59,255,0.1),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(37,99,235,0.22),transparent_70%)]"
        />

        <div className="relative z-[1] lg:col-span-7 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0D3BFF] dark:text-blue-400">
            Seasonal Capsule Release
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            2027 — NEW YEAR COLLECTION
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Designed to bring festive celebration artwork into clean, wearable silhouettes. Explore vibrant Hello 2027 typography, auspicious Year of the Fire Goat zodiac emblems, and limited dual-print 2027 Club editions on signature Royal Cobalt tees.
          </p>
        </div>

        <div className="relative z-[1] lg:col-span-5 grid grid-cols-3 gap-3">
          {[PRODUCTS[0], PRODUCTS[2], PRODUCTS[4]].map((item, idx) => (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ y: -5, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              onClick={() => onSelectProduct(item)}
              className={`bg-[#F3F4F6] dark:bg-[#0D1018] rounded-xl p-2 aspect-[4/5] flex items-center justify-center border border-zinc-200/80 dark:border-zinc-800 hover:border-[#0D3BFF] dark:hover:border-blue-400 transition-colors ${
                idx === 1 ? '-translate-y-2' : ''
              }`}
            >
              <img
                src={item.images[0].src}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.3)]"
              />
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Theme Sub-Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div
          role="group"
          aria-label="Filter 2027 collection by theme"
          className="flex flex-wrap items-center gap-2 min-w-0"
        >
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setActiveTheme(theme.id)}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                activeTheme === theme.id
                  ? 'bg-zinc-950 dark:bg-[#0D3BFF] text-white'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-500'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          {currentThemeObj.caption}
        </p>
      </div>

      {/* Collection Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {items.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onSelectProduct={onSelectProduct}
            onQuickView={onQuickView}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </div>
  );
};
