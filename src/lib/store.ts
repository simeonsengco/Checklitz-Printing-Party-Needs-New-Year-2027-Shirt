import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from '../data/products';
import {
  CartItem,
  CartSummary,
  CheckoutForm,
  CollectionTheme,
  ContactForm,
  PriceFilter,
  Product,
  ProductCategory,
  ShirtSize,
  SortOption,
} from '../types/store';

export function formatPhp(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export interface ProductFilterOptions {
  category?: ProductCategory | 'All';
  theme?: CollectionTheme | 'All';
  priceFilter?: PriceFilter;
  search?: string;
  sort?: SortOption;
}

export function filterAndSortProducts(
  products: Product[],
  options: ProductFilterOptions
): Product[] {
  const {
    category = 'All',
    theme = 'All',
    priceFilter = 'all',
    search = '',
    sort = 'featured',
  } = options;

  const normalizedQuery = search.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (category !== 'All' && !product.categories.includes(category)) {
      return false;
    }

    if (theme !== 'All' && product.collectionTheme !== theme) {
      return false;
    }

    if (priceFilter === 'under-600' && product.price >= 600) {
      return false;
    }
    if (priceFilter === '600-700' && (product.price < 600 || product.price > 700)) {
      return false;
    }
    if (priceFilter === 'over-700' && product.price <= 700) {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const searchable = [
        product.name,
        product.subtitle,
        product.description,
        product.collectionTheme,
        ...product.categories,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });

  const sorted = [...filtered];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }

  return sorted;
}

export function upsertCartItem(
  cart: CartItem[],
  productId: string,
  size: ShirtSize,
  quantityToAdd: number = 1
): CartItem[] {
  const safeAdd = Math.max(1, Math.floor(quantityToAdd));
  const existingIndex = cart.findIndex(
    (item) => item.productId === productId && item.size === size
  );

  if (existingIndex === -1) {
    return [...cart, { productId, size, quantity: safeAdd }];
  }

  return cart.map((item, idx) =>
    idx === existingIndex
      ? { ...item, quantity: Math.min(99, item.quantity + safeAdd) }
      : item
  );
}

export function updateCartItemQuantity(
  cart: CartItem[],
  productId: string,
  size: ShirtSize,
  nextQuantity: number
): CartItem[] {
  if (nextQuantity <= 0) {
    return removeCartItem(cart, productId, size);
  }
  const clamped = Math.min(99, Math.floor(nextQuantity));
  return cart.map((item) =>
    item.productId === productId && item.size === size
      ? { ...item, quantity: clamped }
      : item
  );
}

export function removeCartItem(
  cart: CartItem[],
  productId: string,
  size: ShirtSize
): CartItem[] {
  return cart.filter(
    (item) => !(item.productId === productId && item.size === size)
  );
}

export function calculateCartTotals(
  cart: CartItem[],
  products: Product[]
): CartSummary {
  const productMap = new Map(products.map((p) => [p.id, p]));
  let itemsCount = 0;
  let subtotal = 0;

  for (const item of cart) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    itemsCount += item.quantity;
    subtotal += product.price * item.quantity;
  }

  if (itemsCount === 0) {
    return {
      itemsCount: 0,
      subtotal: 0,
      shippingFee: 0,
      total: 0,
      freeShippingRemaining: FREE_SHIPPING_THRESHOLD,
      qualifiesForFreeShipping: false,
    };
  }

  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const freeShippingRemaining = qualifiesForFreeShipping
    ? 0
    : FREE_SHIPPING_THRESHOLD - subtotal;

  return {
    itemsCount,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    freeShippingRemaining,
    qualifiesForFreeShipping,
  };
}

export function validateCheckoutForm(
  form: CheckoutForm
): Partial<Record<keyof CheckoutForm, string>> {
  const errors: Partial<Record<keyof CheckoutForm, string>> = {};

  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = 'Please enter the recipient’s full name.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  const digitsOnly = form.contactNumber.replace(/[\s\-()]/g, '');
  const phMobileRegex = /^(\+?63|0)?9\d{9}$/;
  if (!phMobileRegex.test(digitsOnly)) {
    errors.contactNumber = 'Enter a valid PH mobile number (e.g. 09171234567).';
  }

  if (!form.address.trim() || form.address.trim().length < 5) {
    errors.address = 'Please enter your street address and barangay.';
  }

  if (!form.city.trim()) {
    errors.city = 'Please enter your city or municipality.';
  }

  if (!form.province.trim()) {
    errors.province = 'Please select or enter your province.';
  }

  if (!/^\d{4}$/.test(form.postalCode.trim())) {
    errors.postalCode = 'Enter a 4-digit Philippine postal code.';
  }

  const validMethods = ['gcash', 'maya', 'cod', 'bank-transfer'];
  if (!validMethods.includes(form.paymentMethod)) {
    errors.paymentMethod = 'Please select a valid payment method.';
  }

  return errors;
}

export function getPaymentMethodSummary(form: CheckoutForm): {
  title: string;
  detail: string;
} {
  switch (form.paymentMethod) {
    case 'gcash':
      return {
        title: 'GCash',
        detail: 'GCash Number: 09934039625 · Demo checkout order logged',
      };
    case 'maya':
      return {
        title: 'Maya',
        detail: 'Maya Number: 09934039625 · Demo checkout order logged',
      };
    case 'cod':
      return {
        title: 'Cash on Delivery (COD)',
        detail: form.codChangeFor
          ? `Pay courier on delivery · Change requested for ${form.codChangeFor}`
          : 'Pay exact total in cash to the courier upon delivery',
      };
    case 'bank-transfer': {
      return {
        title: 'Bank Transfer — Land Bank of the Philippines',
        detail: 'Savings Account: 0486223324 · Account Name: Simeon Sengco III',
      };
    }
  }
}

export function validateContactForm(
  form: ContactForm
): Partial<Record<keyof ContactForm, string>> {
  const errors: Partial<Record<keyof ContactForm, string>> = {};

  if (!form.name.trim()) {
    errors.name = 'Please enter your name.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!form.message.trim() || form.message.trim().length < 10) {
    errors.message = 'Please include at least a short note (10+ characters).';
  }

  return errors;
}

export function generateOrderNumber(seed?: number): string {
  const randomPart =
    seed !== undefined
      ? String(Math.abs(Math.floor(seed)) % 9000 + 1000)
      : String(Math.floor(1000 + Math.random() * 9000));
  return `CHK-2027-${randomPart}`;
}
