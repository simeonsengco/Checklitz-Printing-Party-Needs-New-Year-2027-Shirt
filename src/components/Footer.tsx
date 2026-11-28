import React from 'react';
import { BRAND_LOGO_URL, BUSINESS_INFO } from '../data/products';
import { PageRoute } from '../types/store';

interface FooterProps {
  onNavigate: (route: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-zinc-950 dark:bg-[#050609] text-zinc-300 border-t border-zinc-900 dark:border-zinc-800/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="inline-block bg-white/95 rounded-xl px-3.5 py-2">
              <img
                src={BRAND_LOGO_URL}
                alt={BUSINESS_INFO.name}
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Original graphic tees, DTF &amp; vinyl printing, rush ID &amp; document services, tarpaulins, souvenirs, and party needs in Navotas City.
            </p>
            <p className="text-xs text-zinc-500">
              Accepted Payments: GCash · Maya · Cash on Delivery · Bank Transfer
            </p>
          </div>

          {/* Shop Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">
              Storefront
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="hover:text-white transition-colors"
                >
                  Shop All Tees
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('collection-2027')}
                  className="hover:text-white transition-colors"
                >
                  2027 — New Year Collection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  About &amp; Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact &amp; Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Studio Location & Contact */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">
              Visit &amp; Contact
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              <li className="text-zinc-300 font-medium">
                {BUSINESS_INFO.landmark}
              </li>
              <li>{BUSINESS_INFO.address}</li>
              <li className="font-mono tabular-nums text-zinc-300">
                {BUSINESS_INFO.phone}
              </li>
              <li className="break-all">{BUSINESS_INFO.email}</li>
              <li>Facebook: {BUSINESS_INFO.facebook}</li>
              <li className="text-zinc-500 text-xs pt-1">
                Free nationwide shipping on shirt orders ₱1,500+.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p
            onClick={() => onNavigate('admin')}
            className="cursor-pointer hover:underline hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            © {new Date().getFullYear()} Checklitz Printing &amp; Party Needs. All rights reserved.
          </p>
          <p>Graphic Apparel · Custom Printing · Seasonal Releases</p>
        </div>
      </div>
    </footer>
  );
};
