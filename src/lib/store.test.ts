import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCTS,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from '../data/products.ts';
import {
  calculateCartTotals,
  filterAndSortProducts,
  formatPhp,
  generateOrderNumber,
  getPaymentMethodSummary,
  removeCartItem,
  updateCartItemQuantity,
  upsertCartItem,
  validateCheckoutForm,
  validateContactForm,
} from './store.ts';
import type { CheckoutForm } from '../types/store.ts';

describe('Checklitz Storefront Pure Logic', () => {
  it('formats PHP currency without decimals cleanly', () => {
    assert.equal(formatPhp(580), '₱580');
    assert.equal(formatPhp(1500), '₱1,500');
  });

  it('filters by category, theme, price bracket, and search query', () => {
    const clubDrops = filterAndSortProducts(PRODUCTS, {
      theme: '2027 Club Street',
    });
    assert.equal(clubDrops.length, 2);
    assert.ok(clubDrops.every((p) => p.collectionTheme === '2027 Club Street'));

    const under600 = filterAndSortProducts(PRODUCTS, {
      priceFilter: 'under-600',
    });
    assert.ok(under600.length >= 2);
    assert.ok(under600.every((p) => p.price < 600));

    const searchGoat = filterAndSortProducts(PRODUCTS, {
      search: 'social club',
    });
    assert.equal(searchGoat.length, 1);
    assert.equal(searchGoat[0].id, 'chk-2027-007');
  });

  it('sorts products by price ascending and descending', () => {
    const asc = filterAndSortProducts(PRODUCTS, { sort: 'price-asc' });
    for (let i = 1; i < asc.length; i++) {
      assert.ok(asc[i].price >= asc[i - 1].price);
    }

    const desc = filterAndSortProducts(PRODUCTS, { sort: 'price-desc' });
    for (let i = 1; i < desc.length; i++) {
      assert.ok(desc[i].price <= desc[i - 1].price);
    }
  });

  it('manages cart items immutably across add, update, and remove', () => {
    let cart = upsertCartItem([], 'chk-2027-001', 'M', 1);
    assert.equal(cart.length, 1);
    assert.equal(cart[0].quantity, 1);

    // Adding same product + size increments quantity
    cart = upsertCartItem(cart, 'chk-2027-001', 'M', 2);
    assert.equal(cart.length, 1);
    assert.equal(cart[0].quantity, 3);

    // Adding same product + different size adds a separate line
    cart = upsertCartItem(cart, 'chk-2027-001', 'L', 1);
    assert.equal(cart.length, 2);

    // Updating quantity to 0 removes the item
    cart = updateCartItemQuantity(cart, 'chk-2027-001', 'M', 0);
    assert.equal(cart.length, 1);
    assert.equal(cart[0].size, 'L');

    cart = removeCartItem(cart, 'chk-2027-001', 'L');
    assert.equal(cart.length, 0);
  });

  it('calculates cart totals and free shipping threshold accurately', () => {
    const empty = calculateCartTotals([], PRODUCTS);
    assert.equal(empty.itemsCount, 0);
    assert.equal(empty.subtotal, 0);
    assert.equal(empty.shippingFee, 0);
    assert.equal(empty.total, 0);

    // Below threshold: 1 * 580 = 580 + 95 shipping
    const single = calculateCartTotals(
      [{ productId: 'chk-2027-001', size: 'M', quantity: 1 }],
      PRODUCTS
    );
    assert.equal(single.subtotal, 580);
    assert.equal(single.shippingFee, STANDARD_SHIPPING_FEE);
    assert.equal(single.total, 580 + STANDARD_SHIPPING_FEE);
    assert.equal(single.qualifiesForFreeShipping, false);
    assert.equal(single.freeShippingRemaining, FREE_SHIPPING_THRESHOLD - 580);

    // Above threshold: 3 * 580 = 1740 -> free shipping
    const bulk = calculateCartTotals(
      [{ productId: 'chk-2027-001', size: 'L', quantity: 3 }],
      PRODUCTS
    );
    assert.equal(bulk.subtotal, 1740);
    assert.equal(bulk.shippingFee, 0);
    assert.equal(bulk.total, 1740);
    assert.equal(bulk.qualifiesForFreeShipping, true);
    assert.equal(bulk.freeShippingRemaining, 0);
  });

  it('validates Philippine checkout form fields and payment method summaries cleanly', () => {
    const validForm: CheckoutForm = {
      fullName: 'Juan Dela Cruz',
      email: 'juan@example.ph',
      contactNumber: '09171234567',
      address: '123 Rizal Ave, Brgy. San Antonio',
      city: 'Makati City',
      province: 'Metro Manila (NCR)',
      postalCode: '1203',
      paymentMethod: 'gcash',
      notes: '',
    };

    assert.deepEqual(validateCheckoutForm(validForm), {});

    assert.equal(getPaymentMethodSummary(validForm).title, 'GCash');
    assert.ok(getPaymentMethodSummary(validForm).detail.includes('09934039625'));
    assert.equal(
      getPaymentMethodSummary({ ...validForm, paymentMethod: 'maya' }).title,
      'Maya'
    );
    assert.ok(
      getPaymentMethodSummary({ ...validForm, paymentMethod: 'maya' }).detail.includes('09934039625')
    );
    assert.equal(
      getPaymentMethodSummary({
        ...validForm,
        paymentMethod: 'cod',
        codChangeFor: '₱1,000',
      }).detail,
      'Pay courier on delivery · Change requested for ₱1,000'
    );
    assert.equal(
      getPaymentMethodSummary({
        ...validForm,
        paymentMethod: 'bank-transfer',
        bankProvider: 'LandBank',
      }).title,
      'Bank Transfer — Land Bank of the Philippines'
    );
    assert.equal(
      getPaymentMethodSummary({
        ...validForm,
        paymentMethod: 'bank-transfer',
        bankProvider: 'LandBank',
      }).detail,
      'Savings Account: 0486223324 · Account Name: Simeon Sengco III'
    );

    const invalidForm: CheckoutForm = {
      ...validForm,
      fullName: '',
      email: 'not-an-email',
      contactNumber: '1234',
      postalCode: '99',
    };
    const errors = validateCheckoutForm(invalidForm);
    assert.ok(errors.fullName);
    assert.ok(errors.email);
    assert.ok(errors.contactNumber);
    assert.ok(errors.postalCode);
  });

  it('validates contact inquiry form and generates deterministic order numbers', () => {
    const errors = validateContactForm({
      name: '',
      email: 'bad',
      phone: '',
      topic: 'Custom Printing',
      message: 'hi',
    });
    assert.ok(errors.name);
    assert.ok(errors.email);
    assert.ok(errors.message);

    assert.equal(generateOrderNumber(42), 'CHK-2027-1042');
  });
});
