import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from '../types/store';
import { PRODUCTS as BASE_PRODUCTS } from '../data/products';

export const OVERRIDES_KEY = 'checklitz_product_overrides_v1';

function readOverrides(): Record<string, { price?: number; soldOut?: boolean }> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function applyOverrides(
  base: Product[],
  overrides: Record<string, { price?: number; soldOut?: boolean }>
): Product[] {
  return base.map((p) => {
    const o = overrides[p.id];
    if (!o) return p;
    return {
      ...p,
      price: typeof o.price === 'number' ? o.price : p.price,
      soldOut: typeof o.soldOut === 'boolean' ? o.soldOut : p.soldOut ?? false,
    };
  });
}

interface ProductsContextValue {
  products: Product[];
  updateProduct: (
    id: string,
    updates: { price?: number; soldOut?: boolean }
  ) => void;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(
  undefined
);

export const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [overrides, setOverrides] = useState<Record<string, {
    price?: number;
    soldOut?: boolean;
  }>>({});

  useEffect(() => {
    setOverrides(readOverrides());
    const handler = () => setOverrides(readOverrides());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const products = useMemo(() => applyOverrides(BASE_PRODUCTS, overrides), [
    overrides,
  ]);

  const updateProduct = (
    id: string,
    updates: { price?: number; soldOut?: boolean }
  ) => {
    const current = readOverrides();
    const merged = { ...current[id], ...updates };
    const next = { ...current, [id]: merged };
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
    setOverrides(next);
  };

  return (
    <ProductsContext.Provider value={{ products, updateProduct }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext)!;