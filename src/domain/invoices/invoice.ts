import { CartCalculationResult, Invoice, OrderType, PaymentTender } from '../../types';
import { reconcilePayments } from '../payments/payments';

export interface CreateInvoiceParams {
  invoicePrefix: string;
  nextNumber: number;
  orderType: OrderType;
  tableNumber?: string | undefined;
  cartResult: CartCalculationResult;
  payments: PaymentTender[];
  cashTenderedPaise?: number | undefined;
  cashierId: string;
  cashierName: string;
  notes?: string | undefined;
}

/**
 * Formats sequential invoice number: prefix + 6-digit zero padded number.
 * e.g. formatInvoiceNumber('BIR-', 42) -> 'BIR-000042'
 */
export function formatInvoiceNumber(prefix: string, sequence: number): string {
  const padded = String(Math.max(1, sequence)).padStart(6, '0');
  return `${prefix.trim()}${padded}`;
}

/**
 * Creates an immutable invoice snapshot.
 * Freezes product prices, tax rates, applied discounts, and tenders at checkout time.
 */
export function createInvoiceSnapshot(params: CreateInvoiceParams): Invoice {
  const {
    invoicePrefix,
    nextNumber,
    orderType,
    tableNumber,
    cartResult,
    payments,
    cashTenderedPaise = 0,
    cashierId,
    cashierName,
    notes,
  } = params;

  if (cartResult.items.length === 0) {
    throw new Error('Cannot create an invoice for an empty cart.');
  }

  const reconciliation = reconcilePayments(payments, cartResult.grandTotalPaise, cashTenderedPaise);
  if (!reconciliation.isValid) {
    throw new Error(reconciliation.errorMessage || 'Invalid payment allocations.');
  }

  const invoiceNumber = formatInvoiceNumber(invoicePrefix, nextNumber);
  const now = new Date().toISOString();

  // Deep clone items so that subsequent catalog mutations do not alter this snapshot
  const frozenItems = cartResult.items.map((item) => ({ ...item }));
  const frozenPayments = payments.map((p) => ({ ...p }));

  return {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    invoiceNumber,
    createdAt: now,
    orderType,
    tableNumber: orderType === 'Dine-in' ? tableNumber : undefined,
    items: frozenItems,
    subtotalPaise: cartResult.subtotalPaise,
    discountPaise: cartResult.discountPaise,
    taxableAmountPaise: cartResult.taxableAmountPaise,
    gstRate: cartResult.gstRate,
    totalGstPaise: cartResult.totalGstPaise,
    cgstPaise: cartResult.cgstPaise,
    sgstPaise: cartResult.sgstPaise,
    roundOffPaise: cartResult.roundOffPaise,
    totalPaise: cartResult.grandTotalPaise,
    payments: frozenPayments,
    paymentMethod: reconciliation.paymentMethod,
    cashTenderedPaise: reconciliation.cashTenderedPaise,
    changeDuePaise: reconciliation.changeDuePaise,
    status: 'Paid',
    notes,
    cashierId,
    cashierName,
  };
}
