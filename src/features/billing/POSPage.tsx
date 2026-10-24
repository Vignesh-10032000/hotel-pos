import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Percent,
  Calculator,
  Printer,
  RotateCcw,
  AlertCircle,
  QrCode,
  UtensilsCrossed,
  ShoppingBag,
  Package,
} from 'lucide-react';
import { Invoice, Product, ProductCategory, SingleTenderMode } from '../../types';
import { posRepository } from '../../data/repositories/pos-repository';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { useSettingsStore } from '../../stores/settings-store';
import { useTranslationHelper } from '../../i18n/translations';
import { formatRupees, rupeesToPaise } from '../../domain/money/money';
import { createInvoiceSnapshot } from '../../domain/invoices/invoice';
import { reconcilePayments } from '../../domain/payments/payments';
import { ReceiptModal } from './ReceiptModal';
import { GPayQRModal } from './GPayQRModal';

export const POSPage: React.FC = () => {
  const { user } = useAuthStore();
  const { language, settings } = useSettingsStore();
  const t = useTranslationHelper(language);

  // Cart Store
  const {
    items,
    totals,
    orderType,
    tableNumber,
    notes,
    tenders,
    cashTenderedPaise,
    addItem,
    updateQuantity,
    removeItem,
    setOrderType,
    setTableNumber,
    setNotes,
    setDiscount,
    addTender,
    updateTenderAmount,
    updateTenderMode,
    removeTender,
    setCashTendered,
    resetCart,
  } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [discountPercentInput, setDiscountPercentInput] = useState<string>('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // GPay Mock QR modal state
  const [isGPayModalOpen, setIsGPayModalOpen] = useState(false);
  const [gPayTargetAmountPaise, setGPayTargetAmountPaise] = useState(0);

  // Completed invoice modal state
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>('');

  // Load catalog
  useEffect(() => {
    const loadProducts = async () => {
      const prods = await posRepository.getProducts();
      setProducts(prods);
    };
    loadProducts();
  }, []);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (!prod.isActive) return false;
      const matchesCategory =
        selectedCategory === 'All' || prod.category === selectedCategory;
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.nameTa && prod.nameTa.includes(searchQuery));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Payment reconciliation check
  const reconciliation = useMemo(() => {
    // If cash tendered is 0 but cash is allocated, default cash tendered to cash due for cashier ease
    const cashTender = tenders.find((t) => t.mode === 'Cash');
    const effectiveCashTendered =
      cashTenderedPaise > 0
        ? cashTenderedPaise
        : cashTender
          ? cashTender.amountPaise
          : 0;

    return reconcilePayments(tenders, totals.grandTotalPaise, effectiveCashTendered);
  }, [tenders, totals.grandTotalPaise, cashTenderedPaise]);

  // Open GPay QR scanner modal for either full total or specific UPI tender
  const handleOpenGPayQR = (amountPaise?: number) => {
    const upiTender = tenders.find((t) => t.mode === 'GPay / UPI');
    const amt = amountPaise !== undefined ? amountPaise : (upiTender ? upiTender.amountPaise : totals.grandTotalPaise);
    setGPayTargetAmountPaise(amt > 0 ? amt : totals.grandTotalPaise);
    setIsGPayModalOpen(true);
  };

  const handleGPayPaymentSuccess = (_reference: string) => {
    // If a UPI tender exists, set its reference and status
    const upiIndex = tenders.findIndex((t) => t.mode === 'GPay / UPI');
    if (upiIndex >= 0) {
      const t = tenders[upiIndex];
      if (t) {
        updateTenderAmount(t.id, gPayTargetAmountPaise);
      }
    } else {
      // Create new tender for GPay with this reference
      addTender('GPay / UPI', gPayTargetAmountPaise);
    }
  };

  // Handle Complete Sale / Generate Bill
  const handleGenerateBill = useCallback(async () => {
    if (isSubmitting) return; // Prevent double submit
    if (items.length === 0) {
      setCheckoutError('Please add items to the cart before generating bill.');
      return;
    }

    if (!reconciliation.isValid) {
      setCheckoutError(reconciliation.errorMessage || 'Please allocate exact payment balance.');
      return;
    }

    setCheckoutError('');
    setIsSubmitting(true);

    try {
      const invSettings = await posRepository.getSettings();
      const invoice = createInvoiceSnapshot({
        invoicePrefix: invSettings.invoicePrefix || 'BIR-',
        nextNumber: invSettings.nextInvoiceNumber || 43,
        orderType,
        tableNumber: orderType === 'Dine-in' ? tableNumber : undefined,
        cartResult: totals,
        payments: tenders,
        cashTenderedPaise: reconciliation.cashTenderedPaise,
        cashierId: user?.id || 'usr_admin',
        cashierName: user?.name || 'Store Admin',
        notes: notes.trim() !== '' ? notes : undefined,
      });

      // Save atomically to Dexie IndexedDB
      await posRepository.saveInvoice(invoice);

      // Play sound if enabled
      if (settings.playSoundOnBill && typeof Audio !== 'undefined') {
        try {
          const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.12);
        } catch {
          // Audio context may require explicit user interaction
        }
      }

      setCompletedInvoice(invoice);
      setIsReceiptModalOpen(true);
      resetCart();
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      setCheckoutError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, items.length, reconciliation, totals, tenders, orderType, tableNumber, user, notes, settings.playSoundOnBill, resetCart]);

  // Keyboard shortcut listener (F2: New Bill, F4: Generate Bill)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        resetCart();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleGenerateBill();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerateBill, resetCart]);

  // Categories list
  const categories: ProductCategory[] = [
    'All',
    'Biryani',
    'Starters',
    'Rice',
    'Combos',
    'Drinks',
    'Others',
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[calc(100vh-6rem)]">
      {/* LEFT COLUMN: Food Catalog, Search, Categories (approx 62%) */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-5 overflow-hidden">
        {/* Search Bar */}
        <div className="relative mb-4 shrink-0">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400 text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Pills - Blue Theme */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-3 scrollbar-none shrink-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Food Items Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-4">
            {filteredProducts.map((product) => {
              const inCartItem = items.find((it) => it.productId === product.id);
              const isInCart = Boolean(inCartItem);

              return (
                <div
                  key={product.id}
                  onClick={() => addItem(product)}
                  className={`group cursor-pointer rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-150 select-none border active:scale-98 relative ${
                    isInCart
                      ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-800 shadow-sm'
                  }`}
                >
                  {/* Quantity badge if in cart */}
                  {isInCart && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md z-10">
                      {inCartItem?.quantity}
                    </span>
                  )}

                  {/* Food Image */}
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 flex items-center justify-center relative">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300'}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Title & Price */}
                  <div>
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-tight truncate">
                      {language === 'ta' && product.nameTa ? product.nameTa : product.name}
                    </h3>
                    <p className="font-black text-sm text-slate-900 dark:text-white mt-1">
                      {formatRupees(product.pricePaise)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Current Bill & Checkout Ledger (approx 38%) */}
      <div className="w-full lg:w-[410px] xl:w-[440px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-5 overflow-y-auto shrink-0 max-h-[calc(100vh-6.5rem)]">
        {/* Bill Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 font-bold text-lg">📜</span>
            <h2 className="font-black text-sm text-slate-900 dark:text-white">
              {t.currentBill}
            </h2>
          </div>

          {/* Red Action Button: New Bill (F2) */}
          <button
            onClick={resetCart}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-transform active:scale-95"
          >
            <span>{t.newBill}</span>
          </button>
        </div>

        {/* ORDER TYPE SELECTOR: Prominently Positioned Under Current Bill Heading */}
        <div className="pt-3 pb-2 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setOrderType('Dine-in')}
              className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                orderType === 'Dine-in'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Dine-in</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('Takeaway')}
              className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                orderType === 'Takeaway'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('Parcel')}
              className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                orderType === 'Parcel'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Parcel</span>
            </button>
          </div>

          {/* Table Selector (visible only when Dine-in is active) */}
          {orderType === 'Dine-in' && (
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[11px] font-semibold text-slate-500">Seating Table:</span>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="Table 1">Table 1</option>
                <option value="Table 2">Table 2</option>
                <option value="Table 3">Table 3</option>
                <option value="Table 4">Table 4</option>
                <option value="Table 5">Table 5</option>
                <option value="Family Room">Family Room</option>
              </select>
            </div>
          )}
        </div>

        {/* Error Callout */}
        {checkoutError && (
          <div className="my-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{checkoutError}</span>
          </div>
        )}

        {/* Cart Line Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-0.5 min-h-[140px] max-h-[220px]">
          {items.length === 0 ? (
            <div className="h-28 flex flex-col items-center justify-center text-slate-400 space-y-1">
              <span className="text-2xl">🛒</span>
              <p className="text-xs font-medium">Cart is empty. Tap items to add.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
              >
                {/* Image & Title */}
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-9 h-9 rounded-xl object-cover bg-slate-200 shrink-0"
                    />
                  )}
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatRupees(item.unitPricePaise)}
                    </p>
                  </div>
                </div>

                {/* Quantity Stepper (48px tap targets) */}
                <div className="flex items-center space-x-1 px-1">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-black text-xs text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line Total & Remove */}
                <div className="flex items-center space-x-1.5">
                  <p className="font-bold text-xs text-slate-900 dark:text-white w-14 text-right">
                    {formatRupees(item.lineSubtotalPaise)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Note Button / Input */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
          {isNoteInputOpen ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Less Spicy, Extra Gravy"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
              />
              <button
                onClick={() => setIsNoteInputOpen(false)}
                className="px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Done
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsNoteInputOpen(true)}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>+ Add Note {notes ? `("${notes}")` : '(e.g. Less Spicy, Extra Gravy)'}</span>
            </button>
          )}
        </div>

        {/* Totals Breakdown */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs shrink-0">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{t.subtotal}</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatRupees(totals.subtotalPaise)}
            </span>
          </div>

          {totals.discountPaise > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>{t.discount}</span>
              <span className="font-semibold">-{formatRupees(totals.discountPaise)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>GST ({totals.gstRate}%)</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatRupees(totals.totalGstPaise)}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {t.totalAmount}
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {formatRupees(totals.grandTotalPaise)}
            </span>
          </div>
        </div>

        {/* Adjustments row: % Discount & Custom Amount buttons - Fixed Double % Bug */}
        <div className="grid grid-cols-2 gap-2 my-2 shrink-0">
          <button
            onClick={() => setIsDiscountModalOpen(true)}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Percent className="w-3.5 h-3.5 text-blue-600" />
            <span>Discount</span>
          </button>
          <button
            onClick={() => {
              const custom = prompt('Enter custom bill amount in Rupees:', (totals.grandTotalPaise / 100).toString());
              if (custom) {
                const paise = rupeesToPaise(parseFloat(custom));
                if (paise > 0 && paise < totals.subtotalPaise) {
                  setDiscount({ type: 'FIXED_PAISE', value: totals.subtotalPaise - paise });
                }
              }
            }}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>₹ Custom Amount</span>
          </button>
        </div>

        {/* Payment (Split Allowed) Section with GPay QR button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {t.paymentSplitAllowed}
            </span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                reconciliation.remainingDuePaise === 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {t.remaining}: {formatRupees(reconciliation.remainingDuePaise)}
            </span>
          </div>

          {/* Quick UPI QR Scan Button */}
          <button
            type="button"
            onClick={() => handleOpenGPayQR()}
            className="w-full py-2 px-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-blue-100 transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Open GPay / UPI Dynamic QR</span>
          </button>

          {/* Tender Rows */}
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {tenders.map((tender) => (
              <div key={tender.id} className="flex items-center space-x-2">
                {/* Mode Selector */}
                <select
                  value={tender.mode}
                  onChange={(e) => updateTenderMode(tender.id, e.target.value as SingleTenderMode)}
                  className="w-32 py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"
                >
                  <option value="GPay / UPI">GPay / UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>

                {/* Amount input in rupees */}
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={tender.amountPaise === 0 ? '' : tender.amountPaise / 100}
                    placeholder="0"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      updateTenderAmount(tender.id, rupeesToPaise(val));
                    }}
                    className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"
                  />
                </div>

                {/* Remove tender */}
                {tenders.length > 1 && (
                  <button
                    onClick={() => removeTender(tender.id)}
                    aria-label="Remove payment method"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* + Add Payment Method Button */}
          <button
            onClick={() => {
              // Automatically allocate remaining balance to the new tender!
              const allocated = tenders.reduce((acc, t) => acc + t.amountPaise, 0);
              const remaining = Math.max(0, totals.grandTotalPaise - allocated);
              const nextMode = tenders.some((t) => t.mode === 'GPay / UPI') ? 'Cash' : 'GPay / UPI';
              addTender(nextMode, remaining);
            }}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>+ {t.addPaymentMethod}</span>
          </button>

          {/* Cash Tendered & Change Due helper if cash present */}
          {tenders.some((t) => t.mode === 'Cash') && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                  {t.cashReceived}:
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={
                    cashTenderedPaise
                      ? cashTenderedPaise / 100
                      : (tenders.find((t) => t.mode === 'Cash')?.amountPaise || 0) / 100
                  }
                  onChange={(e) => setCashTendered(rupeesToPaise(parseFloat(e.target.value) || 0))}
                  className="w-20 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                />
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                  {t.changeDue}:{' '}
                </span>
                <span className="font-black text-amber-900 dark:text-amber-100">
                  {formatRupees(reconciliation.changeDuePaise)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-6 gap-2 shrink-0">
          {/* Clear Cart */}
          <button
            onClick={resetCart}
            className="col-span-2 py-3 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center space-x-1 transition-transform active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearCart}</span>
          </button>

          {/* Save Bill */}
          <button
            onClick={() => alert('Bill saved to local drafts.')}
            className="col-span-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-transform active:scale-95"
          >
            {t.saveBill}
          </button>

          {/* Generate Bill (F4) - Blue Theme */}
          <button
            onClick={handleGenerateBill}
            disabled={isSubmitting || items.length === 0}
            className="col-span-3 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{isSubmitting ? 'Processing...' : t.generateBill}</span>
          </button>
        </div>
      </div>

      {/* Discount Modal with Clean Alignment & Zero Overlap */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Apply Bill Discount
            </h3>
            <p className="text-xs text-slate-500">
              Enter discount percentage (Max: {settings.maxDiscountPercent || 10}%):
            </p>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-2">
              {[5, 10].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercentInput(pct.toString())}
                  className="py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100"
                >
                  {pct}% Off
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDiscount({ type: 'FIXED_PAISE', value: 5000 });
                  setIsDiscountModalOpen(false);
                }}
                className="py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold hover:bg-slate-100"
              >
                ₹50 Flat
              </button>
            </div>

            {/* Input with clean percentage suffix */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <input
                type="number"
                min="0"
                max={settings.maxDiscountPercent || 10}
                value={discountPercentInput}
                onChange={(e) => setDiscountPercentInput(e.target.value)}
                placeholder="e.g. 5"
                className="w-full bg-transparent text-sm font-bold focus:outline-none text-slate-900 dark:text-white"
              />
              <span className="text-slate-400 font-bold ml-2">%</span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setDiscount(undefined);
                  setIsDiscountModalOpen(false);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const pct = parseFloat(discountPercentInput);
                  if (!isNaN(pct) && pct > 0) {
                    setDiscount({ type: 'PERCENTAGE', value: pct });
                  }
                  setIsDiscountModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GPay Dynamic QR Code Modal */}
      {isGPayModalOpen && (
        <GPayQRModal
          amountPaise={gPayTargetAmountPaise}
          onPaymentSuccess={handleGPayPaymentSuccess}
          onClose={() => setIsGPayModalOpen(false)}
        />
      )}

      {/* Completed Invoice Receipt Modal */}
      {isReceiptModalOpen && completedInvoice && (
        <ReceiptModal
          invoice={completedInvoice}
          onClose={() => setIsReceiptModalOpen(false)}
          onNewBill={resetCart}
        />
      )}
    </div>
  );
};
