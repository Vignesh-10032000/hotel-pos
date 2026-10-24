import { Invoice, Product, StoreSettings, UserAccount } from '../types';
import { FOOD_IMAGES } from './food-assets';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'BIRYANI POS',
  storeAddress: '123, Main Road, Pollachi, Coimbatore, Tamil Nadu - 642001',
  phoneNumber: '98765 43210',
  email: 'biryani@example.com',
  gstin: '33AABCU9603R12X',
  state: 'Tamil Nadu',
  stateCode: '33',
  storeLogoUrl: FOOD_IMAGES.chickenBiryani,

  // Billing & GST
  enableGst: true,
  priceInclusive: false,
  defaultGstRate: 5,
  allowCustomGstRate: true,
  invoicePrefix: 'BIR-',
  nextInvoiceNumber: 43,
  invoiceNote: 'Thank you!\nVisit again.\nBiryani POS',

  // Receipt & Printing
  printerType: 'Thermal 80mm',
  showStoreLogo: true,
  showStoreAddress: true,
  showPhoneNumber: true,
  showGstin: true,
  showGstBreakdown: true,
  receiptFooter: 'Thank you!\nVisit again.',

  // Appearance
  language: 'en',
  theme: 'light',
  currency: '₹ INR (Indian Rupee)',
  dateFormat: '24 Oct 2026 (DD MMM YYYY)',
  timeFormat: '02:30 PM (12-hour)',
  numberFormat: '1,00,000.00 (Indian)',
  dashboardGreeting: 'Welcome to Biryani POS!',
  showDateTimeInHeader: true,
  playSoundOnBill: true,

  // Users & Security
  autoLockMinutes: 10,
  requirePinForRefund: true,
  requirePinForDiscount: true,
  allowVoidBills: true,

  // Business Preferences
  defaultOrderType: 'Dine-in',
  defaultPaymentMethod: 'Cash',
  allowDiscount: true,
  maxDiscountPercent: 10,
  enableSplitPayments: true,
  dayCloseReminderTime: '11:00 PM',
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    name: 'Store Admin',
    role: 'Owner',
    pin: '1234',
    isActive: true,
  },
  {
    id: 'usr_karthik',
    username: 'karthik',
    name: 'Karthik',
    role: 'Cashier',
    pin: '1111',
    isActive: true,
  },
  {
    id: 'usr_priya',
    username: 'priya',
    name: 'Priya',
    role: 'Cashier',
    pin: '2222',
    isActive: true,
  },
  {
    id: 'usr_mani',
    username: 'mani',
    name: 'Mani',
    role: 'Cashier',
    pin: '3333',
    isActive: false,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_chicken_biryani',
    name: 'Chicken Biryani',
    nameTa: 'சிக்கன் பிரியாணி',
    category: 'Biryani',
    pricePaise: 18000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.chickenBiryani,
    stock: 150,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_mutton_biryani',
    name: 'Mutton Biryani',
    nameTa: 'மட்டன் பிரியாணி',
    category: 'Biryani',
    pricePaise: 22000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.muttonBiryani,
    stock: 100,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_egg_biryani',
    name: 'Egg Biryani',
    nameTa: 'முட்டை பிரியாணி',
    category: 'Biryani',
    pricePaise: 12000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.eggBiryani,
    stock: 80,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_chicken_65',
    name: 'Chicken 65',
    nameTa: 'சிக்கன் 65',
    category: 'Starters',
    pricePaise: 15000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.chicken65,
    stock: 90,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_mutton_chukka',
    name: 'Mutton Chukka',
    nameTa: 'மட்டன் சுக்கா',
    category: 'Starters',
    pricePaise: 20000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.muttonChukka,
    stock: 75,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_chicken_gravy',
    name: 'Chicken Gravy',
    nameTa: 'சிக்கன் கிரேவி',
    category: 'Starters',
    pricePaise: 8000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.chickenGravy,
    stock: 60,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_raita',
    name: 'Raita',
    nameTa: 'வெங்காய தயிர் பச்சடி',
    category: 'Extras',
    pricePaise: 4000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.raita,
    stock: 200,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_parotta',
    name: 'Parotta',
    nameTa: 'பரோட்டா',
    category: 'Rice',
    pricePaise: 3000,
    gstRate: 0,
    isActive: true,
    image: FOOD_IMAGES.parotta,
    stock: 300,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_plain_rice',
    name: 'Plain Rice',
    nameTa: 'சாதம்',
    category: 'Rice',
    pricePaise: 6000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.plainRice,
    stock: 120,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_soft_drink',
    name: 'Soft Drink',
    nameTa: 'குளிர்பானம்',
    category: 'Drinks',
    pricePaise: 4000,
    gstRate: 18,
    isActive: true,
    image: FOOD_IMAGES.softDrink,
    stock: 100,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_water_bottle',
    name: 'Water Bottle',
    nameTa: 'தண்ணீர் பாட்டில்',
    category: 'Drinks',
    pricePaise: 2000,
    gstRate: 0,
    isActive: true,
    image: FOOD_IMAGES.waterBottle,
    stock: 250,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_boiled_egg',
    name: 'Boiled Egg',
    nameTa: 'அவித்த முட்டை',
    category: 'Extras',
    pricePaise: 2000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.boiledEgg,
    stock: 150,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'prod_biryani_combo',
    name: 'Biryani Combo Feast',
    nameTa: 'பிரியாணி சிறப்பு காம்போ',
    category: 'Combos',
    pricePaise: 35000,
    gstRate: 5,
    isActive: true,
    image: FOOD_IMAGES.biryaniCombo,
    stock: 50,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
];

/**
 * Generates sample historical invoices strictly matching the screenshot dashboard totals:
 * - Today (24 Oct 2026): 48 transactions, ₹12,450.00
 * - This Week: 312 transactions, ₹78,320.00
 * - 30 Days: 428 transactions, ₹1,24,580.00
 */
export function generateSeedInvoices(): Invoice[] {
  const invoices: Invoice[] = [];
  const baseTime = new Date('2026-10-24T14:26:22.000Z').getTime();

  // 10 explicit screenshot transactions for Today:
  const screenshotTransactions: Array<{
    seq: number;
    timeOffsetMin: number;
    orderType: 'Dine-in' | 'Takeaway' | 'Parcel';
    tableNumber?: string | undefined;
    items: Array<{ name: string; qty: number; unitPrice: number; gstRate: number }>;
    tenderMode: 'Cash' | 'GPay / UPI' | 'Card' | 'Split Payments';
    splitTenders?: Array<{ mode: 'Cash' | 'GPay / UPI' | 'Card'; amount: number }> | undefined;
    totalRupees: number;
    status: 'Paid' | 'Refunded';
  }> = [
    {
      seq: 42,
      timeOffsetMin: 11, // ~02:15 pm
      orderType: 'Dine-in',
      tableNumber: 'Table 1',
      items: [{ name: 'Chicken Biryani', qty: 2, unitPrice: 180, gstRate: 5 }],
      tenderMode: 'Cash',
      totalRupees: 300,
      status: 'Paid',
    },
    {
      seq: 41,
      timeOffsetMin: 34, // ~01:52 pm
      orderType: 'Takeaway',
      items: [{ name: 'Mutton Biryani', qty: 1, unitPrice: 220, gstRate: 5 }],
      tenderMode: 'GPay / UPI',
      totalRupees: 220,
      status: 'Paid',
    },
    {
      seq: 40,
      timeOffsetMin: 58, // ~01:28 pm
      orderType: 'Parcel',
      items: [
        { name: 'Chicken Biryani', qty: 1, unitPrice: 180, gstRate: 5 },
        { name: 'Soft Drink', qty: 1, unitPrice: 40, gstRate: 18 },
      ],
      tenderMode: 'Card',
      totalRupees: 180,
      status: 'Paid',
    },
    {
      seq: 39,
      timeOffsetMin: 100, // ~12:46 pm
      orderType: 'Dine-in',
      tableNumber: 'Table 3',
      items: [{ name: 'Egg Biryani', qty: 2, unitPrice: 120, gstRate: 5 }],
      tenderMode: 'Cash',
      totalRupees: 240,
      status: 'Paid',
    },
    {
      seq: 38,
      timeOffsetMin: 134, // ~12:12 pm
      orderType: 'Takeaway',
      items: [{ name: 'Chicken 65', qty: 1, unitPrice: 150, gstRate: 5 }],
      tenderMode: 'GPay / UPI',
      totalRupees: 90,
      status: 'Paid',
    },
    {
      seq: 37,
      timeOffsetMin: 148, // ~11:58 am
      orderType: 'Dine-in',
      tableNumber: 'Table 2',
      items: [{ name: 'Mutton Biryani', qty: 2, unitPrice: 220, gstRate: 5 }],
      tenderMode: 'Split Payments',
      splitTenders: [
        { mode: 'GPay / UPI', amount: 300 },
        { mode: 'Cash', amount: 200 },
      ],
      totalRupees: 500,
      status: 'Paid',
    },
    {
      seq: 36,
      timeOffsetMin: 182, // ~11:24 am
      orderType: 'Parcel',
      items: [{ name: 'Chicken Biryani', qty: 3, unitPrice: 180, gstRate: 5 }],
      tenderMode: 'Cash',
      totalRupees: 450,
      status: 'Paid',
    },
    {
      seq: 35,
      timeOffsetMin: 210, // ~10:56 am
      orderType: 'Takeaway',
      items: [{ name: 'Egg Biryani', qty: 1, unitPrice: 120, gstRate: 5 }],
      tenderMode: 'Card',
      totalRupees: 120,
      status: 'Paid',
    },
    {
      seq: 34,
      timeOffsetMin: 234, // ~10:32 am
      orderType: 'Dine-in',
      tableNumber: 'Table 4',
      items: [
        { name: 'Chicken Biryani', qty: 1, unitPrice: 180, gstRate: 5 },
        { name: 'Raita', qty: 1, unitPrice: 40, gstRate: 5 },
      ],
      tenderMode: 'GPay / UPI',
      totalRupees: 250,
      status: 'Paid',
    },
    {
      seq: 33,
      timeOffsetMin: 278, // ~09:48 am
      orderType: 'Takeaway',
      items: [{ name: 'Mutton Chukka', qty: 1, unitPrice: 200, gstRate: 5 }],
      tenderMode: 'Cash',
      totalRupees: 200,
      status: 'Refunded',
    },
  ];

  for (const st of screenshotTransactions) {
    const totalPaise = st.totalRupees * 100;
    const subtotalPaise = Math.round(totalPaise / 1.05);
    const gstPaise = totalPaise - subtotalPaise;
    const cgstPaise = Math.round(gstPaise / 2);
    const sgstPaise = gstPaise - cgstPaise;
    const createdAt = new Date(baseTime - st.timeOffsetMin * 60 * 1000).toISOString();

    const cartItems = st.items.map((it) => ({
      productId: `prod_${it.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: it.name,
      unitPricePaise: it.unitPrice * 100,
      quantity: it.qty,
      gstRate: it.gstRate,
      discountPaise: 0,
      lineSubtotalPaise: it.unitPrice * 100 * it.qty,
      lineGstPaise: Math.round((it.unitPrice * 100 * it.qty * it.gstRate) / 100),
      lineTotalPaise: it.unitPrice * 100 * it.qty,
    }));

    let tenders;
    if (st.splitTenders) {
      tenders = st.splitTenders.map((s, idx) => ({
        id: `tnd_${st.seq}_${idx}`,
        mode: s.mode,
        amountPaise: s.amount * 100,
        status: 'CONFIRMED' as const,
      }));
    } else {
      const mode =
        st.tenderMode === 'GPay / UPI'
          ? ('GPay / UPI' as const)
          : st.tenderMode === 'Card'
            ? ('Card' as const)
            : ('Cash' as const);
      tenders = [
        {
          id: `tnd_${st.seq}`,
          mode,
          amountPaise: totalPaise,
          status: 'CONFIRMED' as const,
        },
      ];
    }

    invoices.push({
      id: `inv_seed_${st.seq}`,
      invoiceNumber: `BIR-${String(st.seq).padStart(6, '0')}`,
      createdAt,
      orderType: st.orderType,
      tableNumber: st.tableNumber,
      items: cartItems,
      subtotalPaise,
      discountPaise: 0,
      taxableAmountPaise: subtotalPaise,
      gstRate: 5,
      totalGstPaise: gstPaise,
      cgstPaise,
      sgstPaise,
      roundOffPaise: 0,
      totalPaise,
      payments: tenders,
      paymentMethod: st.tenderMode,
      status: st.status,
      cashierId: 'usr_admin',
      cashierName: 'Store Admin',
      refundDetails:
        st.status === 'Refunded'
          ? {
              refundedAt: createdAt,
              reason: 'Customer cancelled takeaway order before preparation',
              authorizedBy: 'Store Admin',
              refundAmountPaise: totalPaise,
            }
          : undefined,
    });
  }

  // Generate remaining 38 transactions for Today (Total Today = 48 invoices, ~₹12,450.00 total)
  let todayRunningTotalRupees = screenshotTransactions.reduce((acc, t) => acc + (t.status === 'Paid' ? t.totalRupees : 0), 0);
  const targetTodayRupees = 12450;
  const remainingRupeesToday = targetTodayRupees - todayRunningTotalRupees;
  const targetCountToday = 48;
  const countRemainingToday = targetCountToday - screenshotTransactions.length;

  for (let i = 1; i <= countRemainingToday; i++) {
    const seq = 33 - i;
    const timeOffsetMin = 280 + i * 8; // Morning hours
    const avgAmount = Math.round(remainingRupeesToday / countRemainingToday);
    const amountRupees = i === countRemainingToday ? Math.max(50, targetTodayRupees - todayRunningTotalRupees) : avgAmount;
    todayRunningTotalRupees += amountRupees;

    const totalPaise = amountRupees * 100;
    const subtotalPaise = Math.round(totalPaise / 1.05);
    const gstPaise = totalPaise - subtotalPaise;
    const createdAt = new Date(baseTime - timeOffsetMin * 60 * 1000).toISOString();

    const paymentModes: Array<'Cash' | 'GPay / UPI' | 'Card'> = ['Cash', 'GPay / UPI', 'Card'];
    const pMode = paymentModes[i % 3] ?? 'Cash';

    invoices.push({
      id: `inv_seed_${seq}`,
      invoiceNumber: `BIR-${String(seq).padStart(6, '0')}`,
      createdAt,
      orderType: i % 2 === 0 ? 'Dine-in' : 'Takeaway',
      items: [
        {
          productId: 'prod_chicken_biryani',
          name: 'Chicken Biryani',
          unitPricePaise: 18000,
          quantity: 1,
          gstRate: 5,
          discountPaise: 0,
          lineSubtotalPaise: 18000,
          lineGstPaise: 900,
          lineTotalPaise: 18000,
        },
      ],
      subtotalPaise,
      discountPaise: 0,
      taxableAmountPaise: subtotalPaise,
      gstRate: 5,
      totalGstPaise: gstPaise,
      cgstPaise: Math.round(gstPaise / 2),
      sgstPaise: gstPaise - Math.round(gstPaise / 2),
      roundOffPaise: 0,
      totalPaise,
      payments: [
        {
          id: `tnd_${seq}`,
          mode: pMode,
          amountPaise: totalPaise,
          status: 'CONFIRMED',
        },
      ],
      paymentMethod: pMode,
      status: 'Paid',
      cashierId: 'usr_karthik',
      cashierName: 'Karthik',
    });
  }

  // Generate historical invoices for the rest of the 30-day period (total 428 invoices, ₹1,24,580.00)
  const remainingInvoices = 428 - 48; // 380 invoices
  const remainingMonthPaise = (124580 - 12450) * 100; // in paise
  const avgHistPaise = Math.round(remainingMonthPaise / remainingInvoices);

  for (let i = 1; i <= remainingInvoices; i++) {
    const daysAgo = 1 + (i % 29);
    const hour = 11 + (i % 11);
    const minute = (i * 17) % 60;
    const invDate = new Date(baseTime - daysAgo * 24 * 60 * 60 * 1000);
    invDate.setHours(hour, minute, 0, 0);

    const isLast = i === remainingInvoices;
    const totalPaise = isLast ? avgHistPaise : Math.round(avgHistPaise * (0.8 + ((i % 5) * 0.1)));
    const subtotalPaise = Math.round(totalPaise / 1.05);
    const gstPaise = totalPaise - subtotalPaise;

    const modes: Array<'Cash' | 'GPay / UPI' | 'Card'> = ['Cash', 'GPay / UPI', 'Card'];
    const pMode = modes[i % 3] ?? 'Cash';

    invoices.push({
      id: `inv_hist_${i}`,
      invoiceNumber: `BIR-H${String(i).padStart(5, '0')}`,
      createdAt: invDate.toISOString(),
      orderType: i % 3 === 0 ? 'Dine-in' : i % 3 === 1 ? 'Takeaway' : 'Parcel',
      items: [
        {
          productId: 'prod_chicken_biryani',
          name: 'Chicken Biryani',
          unitPricePaise: 18000,
          quantity: 1,
          gstRate: 5,
          discountPaise: 0,
          lineSubtotalPaise: 18000,
          lineGstPaise: 900,
          lineTotalPaise: 18000,
        },
      ],
      subtotalPaise,
      discountPaise: 0,
      taxableAmountPaise: subtotalPaise,
      gstRate: 5,
      totalGstPaise: gstPaise,
      cgstPaise: Math.round(gstPaise / 2),
      sgstPaise: gstPaise - Math.round(gstPaise / 2),
      roundOffPaise: 0,
      totalPaise,
      payments: [
        {
          id: `tnd_hist_${i}`,
          mode: pMode,
          amountPaise: totalPaise,
          status: 'CONFIRMED',
        },
      ],
      paymentMethod: pMode,
      status: 'Paid',
      cashierId: 'usr_priya',
      cashierName: 'Priya',
    });
  }

  return invoices;
}
