import { describe, it, expect, beforeEach } from 'vitest';
import { DexiePOSRepository } from '../data/repositories/pos-repository';
import { createCartItem, calculateCartTotals } from '../domain/sales/cart';
import { createInvoiceSnapshot } from '../domain/invoices/invoice';
import { reconcilePayments } from '../domain/payments/payments';

describe('POS Integration & Local Persistence Workflow', () => {
  let repository: DexiePOSRepository;

  beforeEach(async () => {
    repository = new DexiePOSRepository();
    await repository.initializeSeedData(true);
  });

  it('initializes seed products and historical invoices in Dexie IndexedDB', async () => {
    const products = await repository.getProducts();
    const invoices = await repository.getInvoices();

    expect(products.length).toBeGreaterThanOrEqual(10);
    expect(invoices.length).toBeGreaterThanOrEqual(48);

    const chickenBiryani = products.find((p) => p.name === 'Chicken Biryani');
    expect(chickenBiryani).toBeDefined();
    expect(chickenBiryani?.pricePaise).toBe(18000);
  });

  it('completes full POS checkout with split payment and persists to Dexie', async () => {
    const products = await repository.getProducts();
    const biryani = products.find((p) => p.name === 'Chicken Biryani')!;
    const mutton = products.find((p) => p.name === 'Mutton Biryani')!;
    const raita = products.find((p) => p.name === 'Raita')!;

    // Replicate screenshot order:
    // 2 x Chicken Biryani (360) + 1 x Mutton (220) + 1 x Raita (40) = 620
    // + 5% GST (31) = 651
    const item1 = createCartItem(biryani, 2);
    const item2 = createCartItem(mutton, 1);
    const item3 = createCartItem(raita, 1);

    const cartResult = calculateCartTotals([item1, item2, item3]);
    expect(cartResult.grandTotalPaise).toBe(65100);

    // Split payment: GPay ₹600 (60000 paise) + Cash ₹51 (5100 paise)
    const tenders = [
      { id: 't1', mode: 'GPay / UPI' as const, amountPaise: 60000, status: 'CONFIRMED' as const },
      { id: 't2', mode: 'Cash' as const, amountPaise: 5100, status: 'CONFIRMED' as const },
    ];

    const reconciliation = reconcilePayments(tenders, cartResult.grandTotalPaise, 5100);
    expect(reconciliation.isValid).toBe(true);

    const invoice = createInvoiceSnapshot({
      invoicePrefix: 'BIR-',
      nextNumber: 43,
      orderType: 'Dine-in',
      tableNumber: 'Table 1',
      cartResult,
      payments: tenders,
      cashTenderedPaise: 5100,
      cashierId: 'usr_admin',
      cashierName: 'Store Admin',
      notes: 'Less Spicy, Extra Gravy',
    });

    const savedId = await repository.saveInvoice(invoice);
    expect(savedId).toBe(invoice.id);

    // Verify invoice is retrievable from IndexedDB
    const retrieved = await repository.getInvoiceById(savedId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.invoiceNumber).toBe('BIR-000043');
    expect(retrieved?.totalPaise).toBe(65100);
    expect(retrieved?.paymentMethod).toBe('Split Payments');
    expect(retrieved?.items.length).toBe(3);
    expect(retrieved?.notes).toBe('Less Spicy, Extra Gravy');
  });

  it('guarantees Clear Cache preserves historical transactions and products', async () => {
    const initialInvoices = await repository.getInvoices();
    const initialProducts = await repository.getProducts();

    expect(initialInvoices.length).toBeGreaterThan(0);
    expect(initialProducts.length).toBeGreaterThan(0);

    // Run safe clear cache
    await repository.clearCache();

    // Verify data remains 100% intact
    const postClearInvoices = await repository.getInvoices();
    const postClearProducts = await repository.getProducts();

    expect(postClearInvoices.length).toBe(initialInvoices.length);
    expect(postClearProducts.length).toBe(initialProducts.length);
  });

  it('reconciles Day Close session and checks cash drawer balancing', async () => {
    const session = {
      id: 'dayclose_2026-10-24',
      businessDate: '2026-10-24',
      openedAt: '2026-10-24T09:00:00Z',
      closedAt: '2026-10-24T22:30:00Z',
      openingCashPaise: 200000, // ₹2,000.00
      expectedCashPaise: 632000, // ₹6,320.00
      countedCashPaise: 632000, // ₹6,320.00
      cashVariancePaise: 0,
      totalSalesPaise: 1245000,
      cashSalesPaise: 432000,
      upiSalesPaise: 518000,
      cardSalesPaise: 295000,
      splitSalesPaise: 50000,
      refundPaise: 20000,
      invoiceCount: 48,
      closedBy: 'Store Admin',
      isClosed: true,
      notes: 'Day closed and balanced without discrepancy.',
    };

    await repository.saveDayClose(session);

    const saved = await repository.getDayClose('2026-10-24');
    expect(saved).toBeDefined();
    expect(saved?.cashVariancePaise).toBe(0);
    expect(saved?.isClosed).toBe(true);
    expect(saved?.closedBy).toBe('Store Admin');
  });
});
