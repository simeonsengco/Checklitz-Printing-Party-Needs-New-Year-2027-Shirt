import React, { useMemo, useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { filterAndSortProducts } from '../lib/store';
import {
  PriceFilter,
  Product,
  ProductCategory,
  ShirtSize,
  SortOption,
} from '../types/store';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  initialSearch?: string;
  onSearchChange: (q: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onQuickAdd: (product: Product, size: ShirtSize) => void;
}

const CATEGORIES: Array<ProductCategory | 'All'> = [
  'All',
  '2027 New Year',
  'Fire Goat Series',
  'Club Edition',
  'Best Sellers',
  'New Arrivals',
];

export const ShopPage: React.FC<ShopPageProps> = ({
  initialSearch = '',
  onSearchChange,
  onSelectProduct,
  onQuickView,
  onQuickAdd,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(PRODUCTS, {
        category: selectedCategory,
        priceFilter,
        search: initialSearch,
        sort: sortOption,
      }),
    [selectedCategory, priceFilter, initialSearch, sortOption]
  );

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    priceFilter !== 'all' ||
    initialSearch.trim().length > 0 ||
    sortOption !== 'featured';

  const resetFilters = () => {
    setSelectedCategory('All');
    setPriceFilter('all');
    setSortOption('featured');
    onSearchChange('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Page Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0D3BFF] dark:text-blue-400">
            Full Catalog
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white mt-1">
            Shop Graphic Apparel
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5">
            Every design is printed to crisp detail by Checklitz Printing &amp; Party Needs.
          </p>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
          Showing {filteredProducts.length} of {PRODUCTS.length} designs
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* Category Filter Combo Box — matches Price/Select style */}
          <div className="w-full xl:w-auto shrink-0">
            <div className="relative">
              <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | 'All')}
                className="min-h-[40px] w-full xl:w-48 appearance-none cursor-pointer pl-3 pr-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#0D3BFF] whitespace-nowrap"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search, Price, Sort Controls — single aligned row on sm+ */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
            <div className="relative flex-1 sm:w-56 lg:w-60">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={initialSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search designs..."
                aria-label="Filter catalog by keyword"
                className="w-full min-h-[40px] pl-9 pr-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-zinc-500 dark:text-zinc-400 hidden sm:block shrink-0" />
              <div className="relative flex-1 min-w-[120px]">
                <select
                  aria-label="Filter by price range"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
                  className="min-h-[40px] w-full appearance-none cursor-pointer pl-3 pr-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#0D3BFF] whitespace-nowrap"
                >
                  <option value="all">All Prices</option>
                  <option value="under-600">Under ₱600</option>
                  <option value="600-700">₱600 – ₱700</option>
                  <option value="over-700">Over ₱700</option>
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative flex-1 min-w-[120px]">
                <select
                  aria-label="Sort products"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="min-h-[40px] w-full appearance-none cursor-pointer pl-3 pr-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#0D3BFF] whitespace-nowrap"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-900 px-3.5 py-2 rounded-lg border border-transparent dark:border-zinc-800">
            <span>
              Active filters applied{initialSearch.trim() ? ` for "${initialSearch.trim()}"` : ''}
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-semibold text-zinc-950 dark:text-white hover:text-[#0D3BFF] dark:hover:text-blue-400"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <p className="font-display text-lg font-bold text-zinc-950 dark:text-white">
            No matching shirts found
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            Try clearing your search keyword or switching category filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] transition-colors"
          >
            Show All Designs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product, index) => (
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
      )}
    </div>
  );
};
