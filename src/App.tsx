import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PRODUCTS } from './data/products';
import {
  calculateCartTotals,
  removeCartItem,
  updateCartItemQuantity,
  upsertCartItem,
} from './lib/store';
import {
  CartItem,
  OrderReceipt,
  OrderStatus,
  PageRoute,
  Product,
  ShirtSize,
} from './types/store';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { Collection2027Page } from './pages/Collection2027Page';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

const CART_STORAGE_KEY = 'checklitz_cart_v1';
const THEME_STORAGE_KEY = 'checklitz_theme';

function loadInitialCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadInitialOrders(): OrderReceipt[] {
  try {
    const raw = window.localStorage.getItem('checklitz_orders_v1');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadInitialTheme(): 'dark' | 'light' {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export default function App() {
  const [route, setRoute] = useState<PageRoute>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>(loadInitialCart);
  const [lastOrder, setLastOrder] = useState<OrderReceipt | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(loadInitialTheme);
  const [orders, setOrders] = useState<OrderReceipt[]>(loadInitialOrders);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [cart]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);
  useEffect(() => {
    try {
      window.localStorage.setItem('checklitz_orders_v1', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const cartSummary = useMemo(
    () => calculateCartTotals(cart, PRODUCTS),
    [cart]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [route, selectedProduct.id]);

  const navigate = (nextRoute: PageRoute) => {
    if (nextRoute !== 'checkout') {
      setLastOrder(null);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setRoute('product');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleAddToCart = (
    product: Product,
    size: ShirtSize,
    quantity: number = 1
  ) => {
    setCart((prev) => upsertCartItem(prev, product.id, size, quantity));
    setCartOpen(true);
  };

  const handleQuickAdd = (product: Product, size: ShirtSize) => {
    setCart((prev) => upsertCartItem(prev, product.id, size, 1));
  };

  const handleBuyNow = (
    product: Product,
    size: ShirtSize,
    quantity: number
  ) => {
    setCart((prev) => upsertCartItem(prev, product.id, size, quantity));
    setLastOrder(null);
    setCartOpen(false);
    setRoute('checkout');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleUpdateQuantity = (
    productId: string,
    size: ShirtSize,
    nextQuantity: number
  ) => {
    setCart((prev) =>
      updateCartItemQuantity(prev, productId, size, nextQuantity)
    );
  };

  const handleRemoveItem = (productId: string, size: ShirtSize) => {
    setCart((prev) => removeCartItem(prev, productId, size));
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setRoute('shop');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };


  const handleOrderComplete = (receipt: OrderReceipt) => {
    setLastOrder(receipt);
    setOrders((prev) => [receipt, ...prev].slice(0, 500));
    setCart([]);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };


  const updateOrderStatus = useCallback(
    (orderNumber: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status } : o))
      );
    },
    []
  );

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#08090D] text-[#111317] dark:text-zinc-100 transition-colors duration-200">
      <Navbar
        currentRoute={route}
        cartCount={cartSummary.itemsCount}
        searchQuery={searchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        onSearchSubmit={handleSearchSubmit}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-1">
        <AnimatePresence
          mode="wait"
          onExitComplete={() =>
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
          }
        >
          <motion.div
            key={`${route}-${route === 'product' ? selectedProduct.id : 'view'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {route === 'home' && (
              <HomePage
                onNavigate={navigate}
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
                onQuickAdd={handleQuickAdd}
              />
            )}

            {route === 'shop' && (
              <ShopPage
                initialSearch={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
                onQuickAdd={handleQuickAdd}
              />
            )}

            {route === 'collection-2027' && (
              <Collection2027Page
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
                onQuickAdd={handleQuickAdd}
              />
            )}

            {route === 'product' && (
              <ProductDetailPage
                product={selectedProduct}
                onBackToShop={() => navigate('shop')}
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
                onQuickAdd={handleQuickAdd}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onOpenSizeGuide={() => setSizeGuideOpen(true)}
              />
            )}

            {route === 'checkout' && (
              <CheckoutPage
                cart={cart}
                products={PRODUCTS}
                summary={cartSummary}
                onBackToShop={() => navigate('shop')}
                onOrderComplete={handleOrderComplete}
                lastOrder={lastOrder}
              />
            )}

            {route === 'about' && <AboutPage onNavigate={navigate} />}

            {route === 'contact' && <ContactPage />}

            {route === 'admin' && (
              <AdminPage
                onBack={() => navigate('home')}
                orders={orders}
                products={PRODUCTS}
                onUpdateOrderStatus={updateOrderStatus}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={navigate} />

      <CartDrawer
        open={cartOpen}
        cart={cart}
        products={PRODUCTS}
        summary={cartSummary}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setLastOrder(null);
          navigate('checkout');
        }}
        onContinueShopping={() => {
          setCartOpen(false);
          navigate('shop');
        }}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenFullDetails={handleSelectProduct}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}
