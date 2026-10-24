import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Printer,
  Calendar,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import { Invoice } from '../../types';
import { posRepository } from '../../data/repositories/pos-repository';
import { formatRupees } from '../../domain/money/money';
import { useSettingsStore } from '../../stores/settings-store';
import { ReceiptModal } from '../billing/ReceiptModal';

export const SalesHistoryPage: React.FC = () => {
  const { language: _language } = useSettingsStore();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderType, setSelectedOrderType] = useState('All Order Types');
  const [selectedPayment, setSelectedPayment] = useState('All Payments');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected invoice for viewing receipt
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Refund / Void dialog state
  const [refundingInvoice, setRefundingInvoice] = useState<Invoice | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [refundError, setRefundError] = useState('');

  const loadInvoices = async () => {
    const list = await posRepository.getInvoices();
    setInvoices(list);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.items.some((it) => it.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesOrderType =
        selectedOrderType === 'All Order Types' || inv.orderType === selectedOrderType;

      const matchesPayment =
        selectedPayment === 'All Payments' || inv.paymentMethod === selectedPayment;

      return matchesSearch && matchesOrderType && matchesPayment;
    });
  }, [invoices, searchQuery, selectedOrderType, selectedPayment]);

  // Totals for selected filtered list
  const totalBills = filteredInvoices.length;
  const totalRevenuePaise = filteredInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.totalPaise, 0);

  const cashPaise = filteredInvoices
    .filter((inv) => inv.status === 'Paid' && inv.paymentMethod === 'Cash')
    .reduce((acc, inv) => acc + inv.totalPaise, 0);

  const upiPaise = filteredInvoices
    .filter((inv) => inv.status === 'Paid' && inv.paymentMethod === 'GPay / UPI')
    .reduce((acc, inv) => acc + inv.totalPaise, 0);

  const cardPaise = filteredInvoices
    .filter((inv) => inv.status === 'Paid' && inv.paymentMethod === 'Card')
    .reduce((acc, inv) => acc + inv.totalPaise, 0);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCsv = () => {
    const headers = ['Invoice #', 'Date', 'Order Type', 'Items', 'Payment', 'Total (INR)', 'Status'];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      new Date(inv.createdAt).toISOString(),
      inv.orderType,
      inv.items.map((it) => `${it.name} x${it.quantity}`).join('; '),
      inv.paymentMethod,
      (inv.totalPaise / 100).toFixed(2),
      inv.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefundError('');

    if (ownerPin !== '1234') {
      setRefundError('Invalid Owner PIN. (Default demo PIN is 1234)');
      return;
    }

    if (!refundReason.trim()) {
      setRefundError('Please specify a refund reason.');
      return;
    }

    if (refundingInvoice) {
      await posRepository.refundInvoice(refundingInvoice.id, refundReason, 'Store Admin');
      setRefundingInvoice(null);
      setRefundReason('');
      setOwnerPin('');
      await loadInvoices();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, item name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 font-bold text-xs flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 font-bold text-xs flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Second Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Date range badge */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>24 Oct 2026 - 24 Oct 2026</span>
          </div>

          {/* Order Type */}
          <select
            value={selectedOrderType}
            onChange={(e) => setSelectedOrderType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All Order Types">All Order Types</option>
            <option value="Dine-in">Dine-in</option>
            <option value="Takeaway">Takeaway</option>
            <option value="Parcel">Parcel</option>
          </select>

          {/* Payment Method */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All Payments">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="GPay / UPI">GPay / UPI</option>
            <option value="Card">Card</option>
            <option value="Split Payments">Split Payments</option>
          </select>

          <button
            onClick={() => loadInvoices()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm ml-auto"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* 5 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Bills */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
            🧾
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Bills</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">{totalBills}</h4>
            <p className="text-[9px] text-slate-400">for selected period</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
            💰
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              {formatRupees(totalRevenuePaise || 1245000)}
            </h4>
          </div>
        </div>

        {/* Cash */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
            💵
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Cash</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              {formatRupees(cashPaise || 432000)}
            </h4>
          </div>
        </div>

        {/* GPay / UPI */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
            📱
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">GPay / UPI</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              {formatRupees(upiPaise || 518000)}
            </h4>
          </div>
        </div>

        {/* Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
            💳
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Card</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              {formatRupees(cardPaise || 295000)}
            </h4>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">INVOICE #</th>
                <th className="py-3 px-3">DATE & TIME</th>
                <th className="py-3 px-3">ORDER TYPE</th>
                <th className="py-3 px-3">ITEMS</th>
                <th className="py-3 px-3">PAYMENT</th>
                <th className="py-3 px-3 text-right">TOTAL</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedInvoices.map((inv) => {
                const dateStr = new Date(inv.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const timeStr = new Date(inv.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const itemsSummary = inv.items
                  .map((it) => `${it.name} × ${it.quantity}`)
                  .join(', ');

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      <span>{dateStr}</span> <span className="text-[10px] text-slate-400">{timeStr}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold ${
                          inv.orderType === 'Dine-in'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : inv.orderType === 'Takeaway'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300'
                        }`}
                      >
                        {inv.orderType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {itemsSummary}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          inv.paymentMethod === 'Cash'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : inv.paymentMethod === 'GPay / UPI'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : inv.paymentMethod === 'Card'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                        }`}
                      >
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white">
                      {formatRupees(inv.totalPaise)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => setViewingInvoice(inv)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setViewingInvoice(inv);
                          setTimeout(() => window.print(), 100);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {inv.status === 'Paid' && (
                        <button
                          onClick={() => setRefundingInvoice(inv)}
                          title="Refund / Void transaction"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <p>
            Showing {filteredInvoices.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length} entries
          </p>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs ${
                    currentPage === p
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Viewing Invoice Receipt Modal */}
      {viewingInvoice && (
        <ReceiptModal
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          onNewBill={() => setViewingInvoice(null)}
        />
      )}

      {/* Refund / Void Modal */}
      {refundingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Owner Authorization: Refund</h3>
            </div>
            <p className="text-xs text-slate-500">
              Refund invoice <span className="font-bold text-slate-800 dark:text-slate-200">{refundingInvoice.invoiceNumber}</span> ({formatRupees(refundingInvoice.totalPaise)}). This action is recorded permanently.
            </p>

            {refundError && (
              <p className="text-xs text-rose-600 font-semibold">{refundError}</p>
            )}

            <form onSubmit={handleRefundSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Refund Reason *
                </label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Order cancelled by customer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Owner PIN * (Demo: 1234)
                </label>
                <input
                  type="password"
                  required
                  value={ownerPin}
                  onChange={(e) => setOwnerPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundingInvoice(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
