import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Layers, MapPin, Palette, ShieldCheck } from 'lucide-react';
import {
  BRAND_LOGO_URL,
  BUSINESS_INFO,
  PRODUCTS,
  SERVICE_CATEGORIES,
  SERVICES_BANNER_URL,
} from '../data/products';
import { PageRoute } from '../types/store';

interface AboutPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
      {/* Brand Story Header */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-7 sm:p-10 lg:p-12"
      >
        <div className="lg:col-span-7 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0D3BFF] dark:text-blue-400">
            About Checklitz Printing &amp; Party Needs
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-zinc-950 dark:text-white leading-tight text-balance">
            Built for Celebrations, Crafted to Wear Every Day.
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Located at {BUSINESS_INFO.address} ({BUSINESS_INFO.landmark}), {BUSINESS_INFO.name} serves both walk-in customers and nationwide apparel orders—turning milestone gatherings, barkada outings, and New Year countdowns into keepsakes built to last.
          </p>
          <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Beyond our signature 2027 graphic t-shirt drops, our full-service print studio handles DTF apparel printing, vinyl stickers, tarpaulins, custom mugs, party needs, invitations, souvenirs, rush IDs, and everyday document printing.
          </p>

          <div className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-[#0D1018] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
            <MapPin className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-950 dark:text-white">
                {BUSINESS_INFO.landmark}
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {BUSINESS_INFO.address} · {BUSINESS_INFO.phone}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('collection-2027')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
            >
              <span>See the 2027 Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-semibold hover:border-zinc-950 dark:hover:border-white transition-colors"
            >
              Inquire for Custom Services
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#F3F4F6] dark:bg-[#0D1018] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 flex flex-col items-center gap-5">
          <img
            src={BRAND_LOGO_URL}
            alt={BUSINESS_INFO.name}
            referrerPolicy="no-referrer"
            className="w-full max-w-[260px] h-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
          />
          <div className="grid grid-cols-2 gap-3 w-full">
            <img
              src={PRODUCTS[2].images[0].src}
              alt={PRODUCTS[2].name}
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/5] object-contain bg-white dark:bg-[#121520] rounded-xl p-2 border border-zinc-200/70 dark:border-zinc-800"
            />
            <img
              src={PRODUCTS[6].images[0].src}
              alt={PRODUCTS[6].name}
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/5] object-contain bg-white dark:bg-[#121520] rounded-xl p-2 border border-zinc-200/70 dark:border-zinc-800"
            />
          </div>
        </div>
      </motion.section>

      {/* Complete Studio & Party Needs Services */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0D3BFF] dark:text-blue-400">
              Full-Service Print &amp; Party Hub
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white mt-1">
              Complete Checklitz Services
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="text-sm font-semibold text-[#0D3BFF] dark:text-blue-400 hover:underline self-start sm:self-auto"
          >
            Message us for rates &amp; bulk quotes →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICE_CATEGORIES.map((group, idx) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-display text-lg font-bold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
                {group.title}
              </h3>
              <ul className="grid grid-cols-1 gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                {group.items.map((service) => (
                  <li key={service} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 shrink-0" />
                    <span className="font-medium">{service}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Official Shop Signage Reference */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45 }}
          className="bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
              Official Storefront Banner &amp; Directory
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {BUSINESS_INFO.address}
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#0D1018]">
            <img
              src={SERVICES_BANNER_URL}
              alt="Checklitz Printing and Party Needs complete services and Navotas City address banner"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* Mission, Uniqueness & Quality */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <Palette className="w-6 h-6 text-[#0D3BFF] dark:text-blue-400" />,
            title: 'Our Design Philosophy',
            body: 'Every graphic—from the auspicious Year of the Fire Goat to chrome 2027 Club emblems—is illustrated to pop against rich Royal Cobalt cotton without compromising wearable balance.',
          },
          {
            icon: <Layers className="w-6 h-6 text-[#0D3BFF] dark:text-blue-400" />,
            title: 'Print Precision & Ink Depth',
            body: 'We calibrate high-definition DTF transfers with crisp white underbases and flexible cure bonding so vibrant gradients stay sharp through repeated washes.',
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-[#0D3BFF] dark:text-blue-400" />,
            title: 'Custom & Party Printing',
            body: 'Need matching family New Year shirts, corporate team tees, tarpaulins, mugs, or birthday party giveaways? Our studio handles both single-piece drops and bulk runs.',
          },
        ].map((card, idx) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 space-y-3"
          >
            {card.icon}
            <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white">
              {card.title}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {card.body}
            </p>
          </motion.article>
        ))}
      </section>
    </div>
  );
};
