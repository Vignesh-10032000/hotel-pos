export type ProductCategory =
  | 'All'
  | 'Biryani'
  | 'Starters'
  | 'Rice'
  | 'Combos'
  | 'Drinks'
  | 'Extras'
  | 'Others';

export interface Product {
  id: string;
  name: string;
  nameTa?: string | undefined;
  category: Exclude<ProductCategory, 'All'>;
  pricePaise: number; // Integer paise (e.g. 18000 = ₹180.00)
  gstRate: number; // 0, 5, 12, 18, 28
  isActive: boolean;
  image?: string | undefined;
  stock?: number | undefined;
  createdAt: string;
  updatedAt: string;
}

export type OrderType = 'Dine-in' | 'Takeaway' | 'Parcel';

export type PaymentMethod = 'Cash' | 'GPay / UPI' | 'Card' | 'Split Payments';

export type SingleTenderMode = 'Cash' | 'GPay / UPI' | 'Card';

export interface PaymentTender {
  id: string;
  mode: SingleTenderMode;
  amountPaise: number;
  reference?: string | undefined;
  status: 'CONFIRMED' | 'PENDING' | 'UNVERIFIED';
}

export interface CartItem {
  productId: string;
  name: string;
  nameTa?: string | undefined;
  unitPricePaise: number;
  quantity: number;
  gstRate: number;
  discountPaise: number;
  lineSubtotalPaise: number;
  lineGstPaise: number;
  lineTotalPaise: number;
  image?: string | undefined;
  notes?: string | undefined;
}

export interface CartCalculationResult {
  items: CartItem[];
  subtotalPaise: number;
  discountPaise: number;
  taxableAmountPaise: number;
  gstRate: number;
  totalGstPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  roundOffPaise: number;
  grandTotalPaise: number;
}

export type InvoiceStatus = 'Paid' | 'Refunded' | 'Void';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "BIR-000042"
  createdAt: string; // ISO 8601 string
  orderType: OrderType;
  tableNumber?: string | undefined;
  items: CartItem[];
  subtotalPaise: number;
  discountPaise: number;
  taxableAmountPaise: number;
  gstRate: number;
  totalGstPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  roundOffPaise: number;
  totalPaise: number;
  payments: PaymentTender[];
  paymentMethod: PaymentMethod;
  cashTenderedPaise?: number | undefined;
  changeDuePaise?: number | undefined;
  status: InvoiceStatus;
  notes?: string | undefined;
  cashierId: string;
  cashierName: string;
  refundDetails?:
    | {
        refundedAt: string;
        reason: string;
        authorizedBy: string;
        refundAmountPaise: number;
      }
    | undefined;
}

export interface DayCloseSession {
  id: string;
  businessDate: string; // YYYY-MM-DD
  openedAt: string;
  closedAt: string;
  openingCashPaise: number;
  expectedCashPaise: number;
  countedCashPaise: number;
  cashVariancePaise: number;
  totalSalesPaise: number;
  cashSalesPaise: number;
  upiSalesPaise: number;
  cardSalesPaise: number;
  splitSalesPaise: number;
  refundPaise: number;
  invoiceCount: number;
  closedBy: string;
  isClosed: boolean;
  notes?: string | undefined;
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  phoneNumber: string;
  email: string;
  gstin: string;
  state: string;
  stateCode: string;
  storeLogoUrl: string;

  // Billing & GST
  enableGst: boolean;
  priceInclusive: boolean;
  defaultGstRate: number;
  allowCustomGstRate: boolean;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  invoiceNote: string;

  // Receipt & Printing
  printerType: 'Thermal 80mm' | 'Standard A4';
  showStoreLogo: boolean;
  showStoreAddress: boolean;
  showPhoneNumber: boolean;
  showGstin: boolean;
  showGstBreakdown: boolean;
  receiptFooter: string;

  // Appearance
  language: 'en' | 'ta';
  theme: 'light' | 'dark';
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  dashboardGreeting: string;
  showDateTimeInHeader: boolean;
  playSoundOnBill: boolean;

  // Users & Security
  autoLockMinutes: number;
  requirePinForRefund: boolean;
  requirePinForDiscount: boolean;
  allowVoidBills: boolean;

  // Business Preferences
  defaultOrderType: OrderType;
  defaultPaymentMethod: SingleTenderMode;
  allowDiscount: boolean;
  maxDiscountPercent: number;
  enableSplitPayments: boolean;
  dayCloseReminderTime: string;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: 'Owner' | 'Cashier';
  pin: string;
  isActive: boolean;
}
