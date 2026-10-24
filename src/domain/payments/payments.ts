import { PaymentMethod, PaymentTender, SingleTenderMode } from '../../types';
import { safePaise } from '../money/money';

export interface PaymentReconciliationResult {
  isValid: boolean;
  totalAllocatedPaise: number;
  remainingDuePaise: number;
  cashTenderedPaise: number;
  changeDuePaise: number;
  paymentMethod: PaymentMethod;
  errorMessage?: string;
}

/**
 * Validates and reconciles payment tenders against invoice total.
 */
export function reconcilePayments(
  tenders: PaymentTender[],
  grandTotalPaise: number,
  cashTenderedPaise = 0
): PaymentReconciliationResult {
  const safeTotal = safePaise(grandTotalPaise);
  const safeCashTendered = safePaise(cashTenderedPaise);

  let totalAllocatedPaise = 0;
  let totalCashAllocatedPaise = 0;

  for (const tender of tenders) {
    const amount = safePaise(tender.amountPaise);
    totalAllocatedPaise += amount;
    if (tender.mode === 'Cash') {
      totalCashAllocatedPaise += amount;
    }
  }

  const remainingDuePaise = safeTotal - totalAllocatedPaise;

  // Calculate change due if cash tendered exceeds cash required
  let changeDuePaise = 0;
  if (totalCashAllocatedPaise > 0 && safeCashTendered > totalCashAllocatedPaise) {
    changeDuePaise = safeCashTendered - totalCashAllocatedPaise;
  }

  let paymentMethod: PaymentMethod = 'Cash';
  if (tenders.length > 1) {
    paymentMethod = 'Split Payments';
  } else if (tenders.length === 1) {
    const single = tenders[0]?.mode;
    if (single === 'GPay / UPI') paymentMethod = 'GPay / UPI';
    else if (single === 'Card') paymentMethod = 'Card';
    else paymentMethod = 'Cash';
  }

  if (safeTotal > 0 && remainingDuePaise !== 0) {
    return {
      isValid: false,
      totalAllocatedPaise,
      remainingDuePaise,
      cashTenderedPaise: safeCashTendered,
      changeDuePaise,
      paymentMethod,
      errorMessage:
        remainingDuePaise > 0
          ? `Remaining balance due: ₹${(remainingDuePaise / 100).toFixed(2)}`
          : `Overpaid by: ₹${(Math.abs(remainingDuePaise) / 100).toFixed(2)}`,
    };
  }

  // Check if cash tendered is less than allocated cash
  if (totalCashAllocatedPaise > 0 && safeCashTendered > 0 && safeCashTendered < totalCashAllocatedPaise) {
    return {
      isValid: false,
      totalAllocatedPaise,
      remainingDuePaise,
      cashTenderedPaise: safeCashTendered,
      changeDuePaise: 0,
      paymentMethod,
      errorMessage: `Cash tendered (₹${(safeCashTendered / 100).toFixed(2)}) is less than cash due (₹${(totalCashAllocatedPaise / 100).toFixed(2)})`,
    };
  }

  return {
    isValid: true,
    totalAllocatedPaise,
    remainingDuePaise: 0,
    cashTenderedPaise: safeCashTendered,
    changeDuePaise,
    paymentMethod,
  };
}

/**
 * Creates default single tender for a bill.
 */
export function createDefaultTender(mode: SingleTenderMode, amountPaise: number): PaymentTender {
  return {
    id: `tender_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    mode,
    amountPaise: safePaise(amountPaise),
    status: 'CONFIRMED',
  };
}
