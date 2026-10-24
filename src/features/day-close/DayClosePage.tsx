import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Printer,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { DayCloseSession, Invoice } from '../../types';
import { posRepository } from '../../data/repositories/pos-repository';
import { formatRupees, rupeesToPaise } from '../../domain/money/money';
import { useAuthStore } from '../../stores/auth-store';

export const DayClosePage: React.FC = () => {
  const { user } = useAuthStore();

  const businessDate = '2026-10-24';
  const [openingCashRupees, setOpeningCashRupees] = useState('2000.00');
  const [countedCashRupees, setCountedCashRupees] = useState('6320.00');
  const [notes, setNotes] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [existingSession, setExistingSession] = useState<DayCloseSession | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    const list = await posRepository.getInvoices();
    setInvoices(list);
    const session = await posRepository.getDayClose(businessDate);
    if (session) {
      setExistingSession(session);
      setOpeningCashRupees((session.openingCashPaise / 100).toFixed(2));
      setCountedCashRupees((session.countedCashPaise / 100).toFixed(2));
      setNotes(session.notes || '');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate day totals from today's invoices
  const todayInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt).toISOString().split('T')[0];
      return invDate === businessDate;
    });
  }, [invoices, businessDate]);

  const paidInvoices = todayInvoices.filter((inv) => inv.status === 'Paid');
  const refundedInvoices = todayInvoices.filter((inv) => inv.status === 'Refunded');

  const totalSalesPaise = paidInvoices.reduce((acc, inv) => acc + inv.totalPaise, 0);

  // Sum tender components across invoices
  let cashSalesPaise = 0;
  let upiSalesPaise = 0;
  let cardSalesPaise = 0;
  let splitSalesPaise = 0;

  for (const inv of paidInvoices) {
    if (inv.payments.length > 1) {
      splitSalesPaise += inv.totalPaise;
    }
    for (const tender of inv.payments) {
      if (tender.mode === 'Cash') cashSalesPaise += tender.amountPaise;
      else if (tender.mode === 'GPay / UPI') upiSalesPaise += tender.amountPaise;
      else if (tender.mode === 'Card') cardSalesPaise += tender.amountPaise;
    }
  }

  const refundPaise = refundedInvoices.reduce((acc, inv) => acc + inv.totalPaise, 0);

  const openingCashPaise = rupeesToPaise(parseFloat(openingCashRupees) || 0);
  const countedCashPaise = rupeesToPaise(parseFloat(countedCashRupees) || 0);

  // Expected Cash in Drawer = Opening Cash + Cash from Sales - Cash from Refunds
  const expectedCashPaise = Math.max(0, openingCashPaise + cashSalesPaise - refundPaise);
  const cashVariancePaise = countedCashPaise - expectedCashPaise;

  const handleConfirmClose = async () => {
    if (existingSession?.isClosed) {
      alert('This business day is already closed.');
      return;
    }

    setIsSubmitting(true);
    const session: DayCloseSession = {
      id: `dayclose_${businessDate}`,
      businessDate,
      openedAt: `${businessDate}T09:00:00Z`,
      closedAt: new Date().toISOString(),
      openingCashPaise,
      expectedCashPaise,
      countedCashPaise,
      cashVariancePaise,
      totalSalesPaise,
      cashSalesPaise,
      upiSalesPaise,
      cardSalesPaise,
      splitSalesPaise,
      refundPaise,
      invoiceCount: paidInvoices.length,
      closedBy: user?.name || 'Store Admin',
      isClosed: true,
      notes,
    };

    await posRepository.saveDayClose(session);
    setExistingSession(session);
    setIsSubmitting(false);
    setSuccessMessage('Day close completed and reconciled successfully!');
  };

  return (
    <div className="printable-report max-w-4xl mx-auto space-y-6">
      {/* Print-only Day Close Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-6">
        <h1 className="text-xl font-black uppercase text-slate-900">
          Biryani House · Daily Close & Cash Balancing Report
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Business Date: {businessDate} · Reconciled by: {user?.name || 'Store Admin'} · Status: {existingSession?.isClosed ? 'CLOSED & BALANCED' : 'OPEN'}
        </p>
      </div>

      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Day Close Summary
            </h2>
            {existingSession?.isClosed && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                🔒 Closed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily cash drawer balancing and financial reconciliation for {businessDate}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs flex items-center space-x-2 shadow-sm hover:bg-slate-50 self-start transition-transform active:scale-95"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          <span>Print Day Close Report</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Sales & Collection Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span>Sales & Collection Breakdown</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Business Date:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{businessDate}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Completed Orders:</span>
              <span className="font-bold">{paidInvoices.length} invoices</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Gross Sales Revenue:</span>
              <span className="font-black text-sm text-slate-900 dark:text-white">
                {formatRupees(totalSalesPaise)}
              </span>
            </div>

            <div className="flex justify-between py-1 text-emerald-600 font-semibold">
              <span>• Cash Payments:</span>
              <span>{formatRupees(cashSalesPaise)}</span>
            </div>

            <div className="flex justify-between py-1 text-blue-600 font-semibold">
              <span>• GPay / UPI Payments:</span>
              <span>{formatRupees(upiSalesPaise)}</span>
            </div>

            <div className="flex justify-between py-1 text-indigo-600 font-semibold">
              <span>• Card Payments:</span>
              <span>{formatRupees(cardSalesPaise)}</span>
            </div>

            <div className="flex justify-between py-1 text-orange-600 font-semibold">
              <span>• Split Payment Volume:</span>
              <span>{formatRupees(splitSalesPaise)}</span>
            </div>

            {refundPaise > 0 && (
              <div className="flex justify-between py-1 text-rose-600 font-semibold border-t border-slate-100 dark:border-slate-800">
                <span>Refunds / Voids:</span>
                <span>-{formatRupees(refundPaise)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Cash Drawer Balancing */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Cash Drawer Balancing</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cash Opening Balance (₹)
              </label>
              <input
                type="number"
                disabled={existingSession?.isClosed}
                value={openingCashRupees}
                onChange={(e) => setOpeningCashRupees(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expected Cash in Drawer
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white">
                {formatRupees(expectedCashPaise)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Opening (₹{openingCashRupees}) + Cash Sales ({formatRupees(cashSalesPaise)}) - Refunds ({formatRupees(refundPaise)})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Actual Cash Counted by Cashier (₹) *
              </label>
              <input
                type="number"
                disabled={existingSession?.isClosed}
                value={countedCashRupees}
                onChange={(e) => setCountedCashRupees(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Variance indicator */}
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold border ${
                cashVariancePaise === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              <span>Cash Variance:</span>
              <span className="text-sm font-black">
                {cashVariancePaise === 0
                  ? '₹0.00 (Balanced)'
                  : `${cashVariancePaise > 0 ? '+' : ''}${formatRupees(cashVariancePaise)}`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Closing Remarks / Notes
              </label>
              <input
                type="text"
                disabled={existingSession?.isClosed}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Verified by Store Admin"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {existingSession?.isClosed ? (
              <div className="text-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                Session closed at {new Date(existingSession.closedAt).toLocaleTimeString()} by {existingSession.closedBy}.
              </div>
            ) : (
              <button
                onClick={handleConfirmClose}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Balancing & Closing...' : 'Review & Confirm Day Close'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
