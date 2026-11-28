import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from '../types/store';
import { PRODUCTS as BASE_PRODUCTS } from '../data/products';

export const OVERRIDES_KEY = 'checklitz_product_overrides_v1';

export interface ProductOverride {
  price?: number;
  compareAtPrice?: number;
  tag?: string;
  soldOut?: boolean;
}

function readOverrides(): Record<string, ProductOverride> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function applyOverrides(
  base: Product[],
  overrides: Record<string, ProductOverride>
): Product[] {
  return base.map((p) => {
    const o = overrides[p.id];
    if (!o) return p;
    return {
      ...p,
      price: typeof o.price === 'number' ? o.price : p.price,
      compareAtPrice:
        typeof o.compareAtPrice === 'number' ? o.compareAtPrice : p.compareAtPrice,
      tag: typeof o.tag === 'string' ? o.tag : p.tag,
      soldOut: typeof o.soldOut === 'boolean' ? o.soldOut : p.soldOut ?? false,
    };
  });
}

interface ProductsContextValue {
  products: Product[];
  updateProduct: (id: string, updates: ProductOverride) => void;
  replaceOverrides: (all: Record<string, ProductOverride>) => void;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>({});

  useEffect(() => {
    setOverrides(readOverrides());
    const handler = () => setOverrides(readOverrides());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const products = useMemo(() => applyOverrides(BASE_PRODUCTS, overrides), [overrides]);

  const updateProduct = (id: string, updates: ProductOverride) => {
    const current = readOverrides();
    const merged = { ...current[id], ...updates };
    const next = { ...current, [id]: merged };
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
    setOverrides(next);
  };

  const replaceOverrides = (all: Record<string, ProductOverride>) => {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
    setOverrides(all);
  };

  return (
    <ProductsContext.Provider value={{ products, updateProduct, replaceOverrides }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext)!;
