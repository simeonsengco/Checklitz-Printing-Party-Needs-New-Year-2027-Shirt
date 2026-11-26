import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Pause, Play, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { formatPhp } from '../lib/store';
import { PageRoute, Product, ShirtSize } from '../types/store';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  onNavigate: (route: PageRoute) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onQuickAdd: (product: Product, size: ShirtSize) => void;
}

const HERO_SPOTLIGHT_IDS = [
  'chk-2027-007',
  'chk-2027-003',
  'chk-2027-005',
  'chk-2027-001',
];

const MARQUEE_ITEMS = [
  '2027 — NEW YEAR COLLECTION',
  'YEAR OF THE FIRE GOAT',
  '2027 CLUB STREET EDITION',
  'HIGH-DEFINITION DTF PRINTING',
  'CUSTOM PARTY & BARKADA TEES',
  'NATIONWIDE PHILIPPINE SHIPPING',
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectProduct,
  onQuickView,
  onQuickAdd,
}) => {
  const heroProducts = HERO_SPOTLIGHT_IDS.map((id) =>
    PRODUCTS.find((p) => p.id === id)
  ).filter((p): p is Product => Boolean(p));

  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const activeHeroProduct = heroProducts[activeHeroIdx] ?? PRODUCTS[0];
  const featuredProducts = PRODUCTS.filter((p) => p.featured).slice(0, 6);

  useEffect(() => {
    if (!autoCycle) return;
    const timer = window.setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % heroProducts.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [autoCycle, heroProducts.length]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-ny * 7).toFixed(2)),
      ry: Number((nx * 9).toFixed(2)),
    });
  };

  return (
    <div>
      {/* 1. Cinematic Storefront Campaign Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#08090D]">
        {/* Atmospheric Ambient Spotlight (GPU Transform/Opacity only) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-[-10%] w-[620px] h-[620px] rounded-full bg-[radial-gradient(circle,rgba(13,59,255,0.12),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(37,99,235,0.28),transparent_65%)] animate-spotlight"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-[-8%] w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(13,59,255,0.06),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.14),transparent_65%)]"
        />

        <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Copy Column */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-between py-2"
            >
              <div className="space-y-5">
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0D3BFF] dark:text-blue-400"
                >
                  Checklitz Printing &amp; Party Needs · 2027 Capsule
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.05] text-balance max-w-xl"
                >
                  Bold Graphic Tees Built for New Beginnings.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.16 }}
                  className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-lg"
                >
                  Original custom-printed streetwear and festive celebration apparel—spotlighting our 2027 Year of the Fire Goat and New Year graphic capsule.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.22 }}
                  className="pt-2 flex flex-wrap items-center gap-3"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate('shop')}
                    className="min-h-[46px] px-6 py-3 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-sm dark:shadow-[0_10px_28px_-8px_rgba(13,59,255,0.65)]"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate('collection-2027')}
                    className="min-h-[46px] px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/70 text-zinc-900 dark:text-zinc-100 text-sm font-semibold hover:border-zinc-950 dark:hover:border-white transition-colors whitespace-nowrap"
                  >
                    2027 — New Year Collection
                  </motion.button>
                </motion.div>
              </div>

              <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800/90 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-zinc-950 dark:text-white">
                    High-Def DTF
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Crisp multi-layer ink
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-950 dark:text-white">
                    Sizes XS to 2XL
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Unisex PH fit
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-950 dark:text-white">
                    Nationwide PH
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                    COD, GCash &amp; Maya
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive Kinetic Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
              className="lg:col-span-6 relative flex flex-col bg-[#F3F4F6] dark:bg-[#111522] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-7 overflow-hidden"
            >
              {/* Studio Halo Glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(13,59,255,0.14),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_48%,rgba(37,99,235,0.3),transparent_64%)]"
              />

              <div className="relative z-[1] flex items-center justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    Featured Drop · {activeHeroProduct.collectionTheme}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectProduct(activeHeroProduct)}
                    className="font-display font-bold text-base sm:text-lg text-zinc-950 dark:text-white hover:text-[#0D3BFF] dark:hover:text-blue-400 transition-colors text-left leading-snug block"
                  >
                    {activeHeroProduct.name}
                  </button>
                </div>
                <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-zinc-950 dark:text-white shrink-0">
                  {formatPhp(activeHeroProduct.price)}
                </span>
              </div>

              {/* Floating Tilt-Responsive Shirt Stage */}
              <div className="relative z-[1] flex-1 min-h-[280px] sm:min-h-[340px] flex items-center justify-center py-2 [perspective:1100px]">
                <motion.button
                  type="button"
                  onClick={() => onSelectProduct(activeHeroProduct)}
                  aria-label={`Inspect ${activeHeroProduct.name}`}
                  animate={{
                    rotateX: tilt.rx,
                    rotateY: tilt.ry,
                  }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  className="w-full h-full max-h-[360px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3BFF] rounded-xl"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeHeroProduct.id}
                      src={activeHeroProduct.images[0].src}
                      alt={activeHeroProduct.name}
                      referrerPolicy="no-referrer"
                      initial={{ opacity: 0, scale: 0.92, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: -10 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="max-h-[340px] w-auto object-contain animate-float-slow drop-shadow-[0_24px_34px_rgba(0,0,0,0.28)] dark:drop-shadow-[0_28px_42px_rgba(0,0,0,0.7)]"
                    />
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Thumbnail Selector & Cycle Controls */}
              <div className="relative z-[1] mt-4 pt-4 border-t border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {heroProducts.map((item, idx) => {
                    const isSelected = activeHeroIdx === idx;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveHeroIdx(idx);
                          setAutoCycle(false);
                        }}
                        aria-label={`Preview ${item.name}`}
                        className={`relative w-12 h-14 rounded-lg p-1 bg-white dark:bg-zinc-900 border transition-all shrink-0 overflow-hidden ${
                          isSelected
                            ? 'border-[#0D3BFF] dark:border-blue-400 ring-2 ring-[#0D3BFF]/25'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={item.images[0].src}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                        {isSelected && autoCycle && (
                          <motion.span
                            key={`progress-${activeHeroIdx}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 4.5, ease: 'linear' }}
                            className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-[#0D3BFF] dark:bg-blue-400"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAutoCycle((prev) => !prev)}
                    aria-label={autoCycle ? 'Pause hero reel' : 'Play hero reel'}
                    className="min-w-[36px] min-h-[36px] rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:border-zinc-950 dark:hover:border-white transition-colors"
                  >
                    {autoCycle ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectProduct(activeHeroProduct)}
                    className="min-h-[36px] px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-950 dark:text-white hover:border-zinc-950 dark:hover:border-white transition-colors whitespace-nowrap shrink-0"
                  >
                    View Shirt
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Kinetic Editorial Runway Strip */}
      <div
        aria-hidden="true"
        className="overflow-hidden border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-950 dark:bg-[#0D111D] text-white py-3.5 select-none"
      >
        <div className="flex w-max animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, idx) => (
            <div
              key={`${text}-${idx}`}
              className="flex items-center gap-6 px-4 text-xs font-semibold tracking-[0.16em] text-zinc-200 whitespace-nowrap"
            >
              <span>{text}</span>
              <span className="text-blue-400">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Featured Collection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0D3BFF] dark:text-blue-400">
              Featured Collection
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white mt-1">
              2027 Graphic Shirt Releases
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-950 dark:text-zinc-100 hover:text-[#0D3BFF] dark:hover:text-blue-400 transition-colors self-start sm:self-auto"
          >
            <span>Browse All {PRODUCTS.length} Designs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {featuredProducts.map((product, index) => (
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
      </section>

      {/* 3. Cinematic Spotlight: 2027 Club & Custom Printing Craft */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-zinc-950 dark:bg-[#101422] text-white rounded-2xl border border-zinc-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
        >
          <div className="lg:col-span-6 p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">
                2027 — New Year Collection
              </p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight text-balance">
                Year of the Fire Goat &amp; 2027 Club Editions
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-lg">
                From auspicious Fire Goat zodiac crests and festive countdown graphics to dual-sided Y2K chrome Club tees—every print is produced in-house at Checklitz Printing &amp; Party Needs for vivid durability.
              </p>

              <ul className="space-y-2 pt-2 text-sm text-zinc-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Front &amp; back neck crest prints on 2027 Club tees</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Available for solo wear, barkada sets, and family reunions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Custom party &amp; event printing available via inquiry</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('collection-2027')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                <span>Explore 2027 Collection</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('about')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-200 text-sm font-semibold hover:border-white hover:text-white transition-colors"
              >
                Our Print Story
              </motion.button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-zinc-900/90 dark:bg-[#0B0E18] p-6 sm:p-10 grid grid-cols-2 gap-4 items-center">
            <motion.button
              type="button"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={() => {
                const p = PRODUCTS.find((item) => item.id === 'chk-2027-005');
                if (p) onSelectProduct(p);
              }}
              className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2 hover:bg-white/10 hover:border-blue-400/50 transition-colors"
            >
              <img
                src="/assets/aistudio/tshirtMockUp-2027-005f_0492193b.png"
                alt="2027 Club New Year New Era Front Print"
                referrerPolicy="no-referrer"
                className="w-full aspect-[4/5] object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.5)]"
              />
              <span className="text-xs text-zinc-300 font-medium">
                Front Chest Print
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={() => {
                const p = PRODUCTS.find((item) => item.id === 'chk-2027-005');
                if (p) onSelectProduct(p);
              }}
              className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2 hover:bg-white/10 hover:border-blue-400/50 transition-colors"
            >
              <img
                src="/assets/aistudio/tshirtMockUp-2027-005b_5f219dbc.png"
                alt="2027 Club Fire Goat Back Neck Crest"
                referrerPolicy="no-referrer"
                className="w-full aspect-[4/5] object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.5)]"
              />
              <span className="text-xs text-zinc-300 font-medium">
                2027 Club Back Crest
              </span>
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
