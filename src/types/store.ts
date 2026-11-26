export type PageRoute =
  | 'home'
  | 'shop'
  | 'collection-2027'
  | 'product'
  | 'checkout'
  | 'about'
  | 'contact';

export type ShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL';

export type ProductCategory =
  | 'New Arrivals'
  | 'Best Sellers'
  | '2027 New Year'
  | 'Fire Goat Series'
  | 'Club Edition';

export type CollectionTheme =
  | 'Fire Goat Zodiac'
  | 'Hello 2027 & Party'
  | '2027 Club Street';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export type PriceFilter = 'all' | 'under-600' | '600-700' | 'over-700';

export type PaymentMethod = 'gcash' | 'maya' | 'cod' | 'bank-transfer';

export interface ProductImage {
  src: string;
  label: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  compareAtPrice?: number;
  categories: ProductCategory[];
  collectionTheme: CollectionTheme;
  tag?: string;
  featured: boolean;
  colorName: string;
  colorHex: string;
  sizes: ShirtSize[];
  images: ProductImage[];
  description: string;
  designHighlights: string[];
  fabricSpecs: {
    material: string;
    weight: string;
    fit: string;
    printMethod: string;
    care: string;
  };
}

export interface CartItem {
  productId: string;
  size: ShirtSize;
  quantity: number;
}

export interface CartSummary {
  itemsCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  freeShippingRemaining: number;
  qualifiesForFreeShipping: boolean;
}

export type BankProvider = 'LandBank';

export interface CheckoutForm {
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
  bankProvider?: BankProvider;
  codChangeFor?: string;
  notes: string;
}

export interface OrderReceipt {
  orderNumber: string;
  createdAt: string;
  customer: CheckoutForm;
  items: Array<{
    product: Product;
    size: ShirtSize;
    quantity: number;
    lineTotal: number;
  }>;
  summary: CartSummary;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  topic: 'Custom Printing' | 'Bulk Party Order' | 'Order Support' | 'General Inquiry';
  message: string;
}
