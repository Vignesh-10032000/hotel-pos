import { create } from 'zustand';
import {
  CartCalculationResult,
  CartItem,
  OrderType,
  PaymentTender,
  Product,
  SingleTenderMode,
} from '../types';
import { calculateCartTotals, createCartItem, DiscountConfig } from '../domain/sales/cart';
import { createDefaultTender } from '../domain/payments/payments';

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: string;
  notes: string;
  discount: DiscountConfig | undefined;
  tenders: PaymentTender[];
  cashTenderedPaise: number;
  enableGst: boolean;

  // Computed state
  totals: CartCalculationResult;

  // Actions
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (table: string) => void;
  setNotes: (notes: string) => void;
  setDiscount: (discount?: DiscountConfig) => void;
  setEnableGst: (enable: boolean) => void;

  // Payment tenders
  addTender: (mode: SingleTenderMode, amountPaise?: number) => void;
  updateTenderAmount: (id: string, amountPaise: number) => void;
  updateTenderMode: (id: string, mode: SingleTenderMode) => void;
  removeTender: (id: string) => void;
  setCashTendered: (paise: number) => void;

  resetCart: () => void;
}

const initialTotals = calculateCartTotals([], undefined, true);

function syncTenders(tenders: PaymentTender[], grandTotalPaise: number): PaymentTender[] {
  const first = tenders[0];
  if (tenders.length === 1 && first) {
    return [
      {
        id: first.id,
        mode: first.mode,
        amountPaise: grandTotalPaise,
        reference: first.reference,
        status: first.status,
      },
    ];
  }
  return tenders;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'Dine-in',
  tableNumber: 'Table 1',
  notes: '',
  discount: undefined,
  tenders: [createDefaultTender('GPay / UPI', 0)],
  cashTenderedPaise: 0,
  enableGst: true,
  totals: initialTotals,

  addItem: (product) => {
    const { items, discount, enableGst, tenders } = get();
    const existingIndex = items.findIndex((it) => it.productId === product.id);

    let updatedItems: CartItem[];
    if (existingIndex >= 0) {
      updatedItems = items.map((it, idx) =>
        idx === existingIndex
          ? { ...it, quantity: it.quantity + 1 }
          : it
      );
    } else {
      const newItem = createCartItem(product, 1);
      updatedItems = [...items, newItem];
    }

    const totals = calculateCartTotals(updatedItems, discount, enableGst);
    const nextTenders = syncTenders(tenders, totals.grandTotalPaise);

    set({ items: updatedItems, totals, tenders: nextTenders });
  },

  updateQuantity: (productId, delta) => {
    const { items, discount, enableGst, tenders } = get();
    const updatedItems = items
      .map((it) => {
        if (it.productId === productId) {
          const newQty = it.quantity + delta;
          return newQty > 0 ? { ...it, quantity: newQty } : null;
        }
        return it;
      })
      .filter((it): it is CartItem => it !== null);

    const totals = calculateCartTotals(updatedItems, discount, enableGst);
    const nextTenders = syncTenders(tenders, totals.grandTotalPaise);

    set({ items: updatedItems, totals, tenders: nextTenders });
  },

  removeItem: (productId) => {
    const { items, discount, enableGst, tenders } = get();
    const updatedItems = items.filter((it) => it.productId !== productId);
    const totals = calculateCartTotals(updatedItems, discount, enableGst);
    const nextTenders = syncTenders(tenders, totals.grandTotalPaise);

    set({ items: updatedItems, totals, tenders: nextTenders });
  },

  setOrderType: (type) => {
    set({ orderType: type });
  },

  setTableNumber: (table) => {
    set({ tableNumber: table });
  },

  setNotes: (notes) => {
    set({ notes });
  },

  setDiscount: (discount) => {
    const { items, enableGst, tenders } = get();
    const totals = calculateCartTotals(items, discount, enableGst);
    const nextTenders = syncTenders(tenders, totals.grandTotalPaise);

    set({ discount, totals, tenders: nextTenders });
  },

  setEnableGst: (enableGst) => {
    const { items, discount, tenders } = get();
    const totals = calculateCartTotals(items, discount, enableGst);
    const nextTenders = syncTenders(tenders, totals.grandTotalPaise);

    set({ enableGst, totals, tenders: nextTenders });
  },

  addTender: (mode, amountPaise) => {
    const { tenders, totals } = get();
    const allocated = tenders.reduce((acc, t) => acc + t.amountPaise, 0);
    const remaining = Math.max(0, totals.grandTotalPaise - allocated);
    const amount = amountPaise !== undefined ? amountPaise : remaining;

    const newTender = createDefaultTender(mode, amount);
    set({ tenders: [...tenders, newTender] });
  },

  updateTenderAmount: (id, amountPaise) => {
    const { tenders } = get();
    const nextTenders = tenders.map((t) =>
      t.id === id ? { ...t, amountPaise: Math.max(0, amountPaise) } : t
    );
    set({ tenders: nextTenders });
  },

  updateTenderMode: (id, mode) => {
    const { tenders } = get();
    const nextTenders = tenders.map((t) =>
      t.id === id ? { ...t, mode } : t
    );
    set({ tenders: nextTenders });
  },

  removeTender: (id) => {
    const { tenders } = get();
    if (tenders.length <= 1) return; // Keep at least one tender
    set({ tenders: tenders.filter((t) => t.id !== id) });
  },

  setCashTendered: (cashTenderedPaise) => {
    set({ cashTenderedPaise });
  },

  resetCart: () => {
    set({
      items: [],
      notes: '',
      discount: undefined,
      tenders: [createDefaultTender('GPay / UPI', 0)],
      cashTenderedPaise: 0,
      totals: calculateCartTotals([], undefined, true),
    });
  },
}));
