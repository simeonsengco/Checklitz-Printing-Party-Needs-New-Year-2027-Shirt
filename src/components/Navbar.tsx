import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Moon, Search, ShoppingBag, Sun, X } from 'lucide-react';
import { BRAND_LOGO_URL } from '../data/products';
import { PageRoute } from '../types/store';

interface NavbarProps {
  currentRoute: PageRoute;
  cartCount: number;
  searchQuery: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNavigate: (route: PageRoute) => void;
  onSearchSubmit: (query: string) => void;
  onOpenCart: () => void;
}

const NAV_ITEMS: Array<{ route: PageRoute; label: string }> = [
  { route: 'home', label: 'Home' },
  { route: 'shop', label: 'Shop' },
  { route: 'collection-2027', label: '2027 Collection' },
  { route: 'about', label: 'About Us' },
  { route: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  cartCount,
  searchQuery,
  theme,
  onToggleTheme,
  onNavigate,
  onSearchSubmit,
  onOpenCart,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [logoError, setLogoError] = useState(false);

  const handleSearchFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(localSearch);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (route: PageRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0B0D14]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Logo */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3BFF] rounded-lg px-1.5 py-1 transition-transform duration-150 hover:scale-[1.02]"
          aria-label="Checklitz Printing & Party Needs Home"
        >
          {!logoError ? (
            <img
              src={BRAND_LOGO_URL}
              alt="Checklitz Printing & Party Needs"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-10 sm:h-11 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.22)]"
            />
          ) : (
            <span className="font-display font-bold text-lg tracking-tight text-zinc-900 dark:text-white whitespace-nowrap">
              Checklitz Printing
            </span>
          )}
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links with animated active underline */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-4 lg:gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              currentRoute === item.route ||
              (currentRoute === 'product' && item.route === 'shop');
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNavClick(item.route)}
                className={`relative text-sm font-medium whitespace-nowrap shrink-0 py-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3BFF] rounded-xs ${
                  isActive
                    ? 'text-zinc-950 dark:text-white font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#0D3BFF] dark:bg-blue-400 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme Toggle, Search & Bag */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            data-testid="theme-toggle-button"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3BFF]"
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setLocalSearch(searchQuery);
              setSearchOpen((prev) => !prev);
            }}
            aria-label="Toggle product search"
            aria-expanded={searchOpen}
            className="min-w-[40px] min-h-[40px] px-2 flex items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3BFF]"
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping cart with ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            data-testid="nav-cart-button"
            className="relative min-h-[40px] px-3.5 py-2 flex items-center gap-2 rounded-lg bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3BFF]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            <motion.span
              key={cartCount}
              initial={{ scale: 0.75 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              data-testid="cart-badge-count"
              className="font-mono tabular-nums text-xs font-semibold px-1.5 py-0.5 rounded bg-white/15 text-white"
            >
              {cartCount}
            </motion.span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Animated Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F121B] px-4 sm:px-6 lg:px-8 py-3"
          >
            <form
              onSubmit={handleSearchFormSubmit}
              className="max-w-3xl mx-auto flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search 2027 tees, Fire Goat, Hello 2027, Chrome Club..."
                autoFocus
                aria-label="Search shirts"
                className="flex-1 min-h-[40px] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-zinc-950 dark:bg-[#0D3BFF] text-white text-xs font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
              >
                Search Shop
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            aria-label="Mobile navigation"
            className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F121B] px-4 py-3 space-y-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
