import { describe, it, expect } from 'vitest';
import { formatRupees, paiseToRupees, roundHalfUp, rupeesToPaise, safePaise } from '../domain/money/money';
import { calculateGstBreakdown } from '../domain/tax/gst';
import { calculateCartTotals, createCartItem } from '../domain/sales/cart';
import { reconcilePayments, createDefaultTender } from '../domain/payments/payments';
import { createInvoiceSnapshot, formatInvoiceNumber } from '../domain/invoices/invoice';
import { Product } from '../types';

describe('1. Money Domain Math (Paise-Safe)', () => {
  it('converts between rupees and paise deterministically', () => {
    expect(rupeesToPaise(180)).toBe(18000);
    expect(rupeesToPaise(0.5)).toBe(50);
    expect(rupeesToPaise(291.54)).toBe(29154);
    expect(paiseToRupees(18000)).toBe(180);
    expect(paiseToRupees(29154)).toBe(291.54);
  });

  it('performs standard half-up rounding', () => {
    expect(roundHalfUp(10.4)).toBe(10);
    expect(roundHalfUp(10.5)).toBe(11);
    expect(roundHalfUp(10.6)).toBe(11);
    expect(roundHalfUp(-10.5)).toBe(-11);
  });

  it('formats integer paise into Indian Rupee presentation format', () => {
    expect(formatRupees(1245000)).toBe('₹12,450.00');
    expect(formatRupees(18000)).toBe('₹180.00');
    expect(formatRupees(65100)).toBe('₹651.00');
    expect(formatRupees(10000000)).toBe('₹1,00,000.00');
    expect(formatRupees(0)).toBe('₹0.00');
  });

  it('clamps invalid and negative paise securely', () => {
    expect(safePaise(-50)).toBe(0);
    expect(safePaise(NaN)).toBe(0);
    expect(safePaise(125.8)).toBe(126);
  });
});

describe('2. GST & Tax Engine', () => {
  it('calculates 5% tax-exclusive GST correctly', () => {
    // ₹620.00 = 62000 paise
    // 5% GST = 3100 paise (₹31.00)
    // CGST = 1550 paise (₹15.50), SGST = 1550 paise (₹15.50)
    const result = calculateGstBreakdown(62000, 5, false);
    expect(result.taxableAmountPaise).toBe(62000);
    expect(result.totalGstPaise).toBe(3100);
    expect(result.cgstPaise).toBe(1550);
    expect(result.sgstPaise).toBe(1550);
    expect(result.cgstPaise + result.sgstPaise).toBe(result.totalGstPaise);
  });

  it('calculates odd paise GST split without dropping a single paisa', () => {
    // 355 paise @ 5% GST = 17.75 paise -> 18 paise
    // CGST = 9 paise, SGST = 9 paise -> sum = 18 paise
    const result = calculateGstBreakdown(355, 5, false);
    expect(result.totalGstPaise).toBe(18);
    expect(result.cgstPaise).toBe(9);
    expect(result.sgstPaise).toBe(9);
    expect(result.cgstPaise + result.sgstPaise).toBe(result.totalGstPaise);

    // Another odd case: 7 paise tax -> CGST: 4, SGST: 3 (sum is 7)
    const oddResult = calculateGstBreakdown(145, 5, false);
    expect(oddResult.totalGstPaise).toBe(7);
    expect(oddResult.cgstPaise).toBe(4);
    expect(oddResult.sgstPaise).toBe(3);
    expect(oddResult.cgstPaise + oddResult.sgstPaise).toBe(oddResult.totalGstPaise);
  });

  it('calculates tax-inclusive GST breakdown accurately', () => {
    // ₹105.00 inclusive of 5% GST -> Base: ₹100.00, GST: ₹5.00
    const result = calculateGstBreakdown(10500, 5, true);
    expect(result.taxableAmountPaise).toBe(10000);
    expect(result.totalGstPaise).toBe(500);
    expect(result.cgstPaise).toBe(250);
    expect(result.sgstPaise).toBe(250);
  });

  it('handles 0% GST (e.g. Parotta, plain staples)', () => {
    const result = calculateGstBreakdown(3000, 0, false);
    expect(result.taxableAmountPaise).toBe(3000);
    expect(result.totalGstPaise).toBe(0);
    expect(result.cgstPaise).toBe(0);
    expect(result.sgstPaise).toBe(0);
  });
});

describe('3. Cart Financial Logic & Screenshot Scenario', () => {
  const dummyBiryani: Product = {
    id: 'prod_cb',
    name: 'Chicken Biryani',
    category: 'Biryani',
    pricePaise: 18000, // ₹180.00
    gstRate: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const dummyMutton: Product = {
    id: 'prod_mb',
    name: 'Mutton Biryani',
    category: 'Biryani',
    pricePaise: 22000, // ₹220.00
    gstRate: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const dummyRaita: Product = {
    id: 'prod_raita',
    name: 'Raita',
    category: 'Extras',
    pricePaise: 4000, // ₹40.00
    gstRate: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('matches exactly POS Terminal Screenshot totals (Chicken Biryani x2, Mutton Biryani x1, Raita x1)', () => {
    // 2 x 180 = 360
    // 1 x 220 = 220
    // 1 x 40 = 40
    // Subtotal = 620.00 (62000 paise)
    // GST (5%) = 31.00 (3100 paise)
    // Total Amount = 651.00 (65100 paise)
    const item1 = createCartItem(dummyBiryani, 2);
    const item2 = createCartItem(dummyMutton, 1);
    const item3 = createCartItem(dummyRaita, 1);

    const cartResult = calculateCartTotals([item1, item2, item3]);

    expect(cartResult.subtotalPaise).toBe(62000);
    expect(cartResult.totalGstPaise).toBe(3100);
    expect(cartResult.grandTotalPaise).toBe(65100);
    expect(formatRupees(cartResult.grandTotalPaise)).toBe('₹651.00');
  });

  it('handles percentage discount correctly', () => {
    const item1 = createCartItem(dummyBiryani, 1); // 18000
    // 10% discount on 18000 = 1800 discount -> taxable = 16200
    // 5% GST on 16200 = 810 paise -> total = 17010 paise (₹170.10)
    const cartResult = calculateCartTotals([item1], { type: 'PERCENTAGE', value: 10 });
    expect(cartResult.subtotalPaise).toBe(18000);
    expect(cartResult.discountPaise).toBe(1800);
    expect(cartResult.taxableAmountPaise).toBe(16200);
    expect(cartResult.totalGstPaise).toBe(810);
    expect(cartResult.grandTotalPaise).toBe(17010);
  });

  it('handles empty cart gracefully', () => {
    const cartResult = calculateCartTotals([]);
    expect(cartResult.subtotalPaise).toBe(0);
    expect(cartResult.grandTotalPaise).toBe(0);
  });
});

describe('4. Payment Tenders & Split-Payment Reconciliation', () => {
  it('reconciles single payment mode correctly', () => {
    const tender = createDefaultTender('Cash', 65100);
    const result = reconcilePayments([tender], 65100, 70000);

    expect(result.isValid).toBe(true);
    expect(result.paymentMethod).toBe('Cash');
    expect(result.remainingDuePaise).toBe(0);
    expect(result.changeDuePaise).toBe(4900); // ₹49.00 change
  });

  it('reconciles exact split payment (matching screenshot: GPay ₹600 + Cash ₹51 for total ₹651)', () => {
    const tenders = [
      { id: '1', mode: 'GPay / UPI' as const, amountPaise: 60000, status: 'CONFIRMED' as const },
      { id: '2', mode: 'Cash' as const, amountPaise: 5100, status: 'CONFIRMED' as const },
    ];

    const result = reconcilePayments(tenders, 65100, 5100);
    expect(result.isValid).toBe(true);
    expect(result.paymentMethod).toBe('Split Payments');
    expect(result.remainingDuePaise).toBe(0);
    expect(result.changeDuePaise).toBe(0);
  });

  it('rejects incomplete split payment with exact remaining balance', () => {
    const tenders = [
      { id: '1', mode: 'GPay / UPI' as const, amountPaise: 50000, status: 'CONFIRMED' as const },
    ];

    const result = reconcilePayments(tenders, 65100);
    expect(result.isValid).toBe(false);
    expect(result.remainingDuePaise).toBe(15100); // ₹151.00 remaining
    expect(result.errorMessage).toContain('₹151.00');
  });

  it('rejects overpaid allocation', () => {
    const tenders = [
      { id: '1', mode: 'Card' as const, amountPaise: 70000, status: 'CONFIRMED' as const },
    ];
    const result = reconcilePayments(tenders, 65100);
    expect(result.isValid).toBe(false);
    expect(result.remainingDuePaise).toBe(-4900);
    expect(result.errorMessage).toContain('Overpaid');
  });
});

describe('5. Immutable Invoice Snapshots & Numbering', () => {
  it('formats sequential invoice numbers with standard prefix', () => {
    expect(formatInvoiceNumber('BIR-', 42)).toBe('BIR-000042');
    expect(formatInvoiceNumber('BIR-', 1)).toBe('BIR-000001');
    expect(formatInvoiceNumber('INV-', 1234)).toBe('INV-001234');
  });

  it('creates an immutable invoice snapshot', () => {
    const dummyProduct: Product = {
      id: 'prod_1',
      name: 'Chicken Biryani',
      category: 'Biryani',
      pricePaise: 18000,
      gstRate: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const item = createCartItem(dummyProduct, 1);
    const cartResult = calculateCartTotals([item]);
    const tenders = [createDefaultTender('Cash', cartResult.grandTotalPaise)];

    const invoice = createInvoiceSnapshot({
      invoicePrefix: 'BIR-',
      nextNumber: 42,
      orderType: 'Dine-in',
      tableNumber: 'Table 1',
      cartResult,
      payments: tenders,
      cashierId: 'usr_admin',
      cashierName: 'Store Admin',
    });

    expect(invoice.invoiceNumber).toBe('BIR-000042');
    expect(invoice.orderType).toBe('Dine-in');
    expect(invoice.tableNumber).toBe('Table 1');
    expect(invoice.totalPaise).toBe(cartResult.grandTotalPaise);
    expect(invoice.status).toBe('Paid');
    expect(invoice.items.length).toBe(1);
    expect(invoice.cashierName).toBe('Store Admin');
  });
});
