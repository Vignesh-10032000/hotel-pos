import React from 'react';
import { Printer, Download, CheckCircle2, X } from 'lucide-react';
import { Invoice } from '../../types';
import { formatRupees } from '../../domain/money/money';
import { useSettingsStore } from '../../stores/settings-store';

interface ReceiptModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onNewBill: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  invoice,
  onClose,
  onNewBill,
}) => {
  const { settings } = useSettingsStore();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${invoice.invoiceNumber}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(invoice.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Bar - Blue Palette */}
        <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Sale Completed Successfully</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal 80mm Receipt Body Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/50">
          <div
            id="thermal-receipt"
            className="w-full max-w-[320px] mx-auto bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-5 rounded-2xl shadow-sm text-slate-800 dark:text-slate-200 font-mono text-xs space-y-3"
          >
            {/* Store Branding */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              {settings.showStoreLogo && (
                <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-xl mb-1">
                  🍲
                </div>
              )}
              <h2 className="font-black text-sm tracking-wider uppercase text-slate-900 dark:text-white">
                {settings.storeName || 'BIRYANI POS'}
              </h2>
              {settings.showStoreAddress && (
                <p className="text-[10px] text-slate-500 leading-tight">
                  {settings.storeAddress || '123, Main Road, Pollachi, TN - 642001'}
                </p>
              )}
              {settings.showPhoneNumber && (
                <p className="text-[10px] text-slate-500">
                  Tel: {settings.phoneNumber || '98765 43210'}
                </p>
              )}
              {settings.showGstin && (
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                  GSTIN: {settings.gstin || '33AABCU9603R12X'}
                </p>
              )}
            </div>

            {/* Invoice Details */}
            <div className="flex items-center justify-between text-[11px] pb-2 border-b border-dashed border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Invoice: {invoice.invoiceNumber}
                </p>
                <p className="text-[10px] text-slate-500">
                  Type: {invoice.orderType} {invoice.tableNumber ? `(${invoice.tableNumber})` : ''}
                </p>
              </div>
              <div className="text-right">
                <p>{formattedDate}</p>
                <p className="text-[10px] text-slate-500">{formattedTime}</p>
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Price</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1 font-medium truncate max-w-[120px]">{item.name}</td>
                    <td className="py-1 text-center font-bold">{item.quantity}</td>
                    <td className="py-1 text-right text-slate-500">
                      {(item.unitPricePaise / 100).toFixed(2)}
                    </td>
                    <td className="py-1 text-right font-bold">
                      {formatRupees(item.lineSubtotalPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial summary breakdown */}
            <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-medium">{formatRupees(invoice.subtotalPaise)}</span>
              </div>
              {invoice.discountPaise > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-{formatRupees(invoice.discountPaise)}</span>
                </div>
              )}
              {settings.showGstBreakdown && invoice.totalGstPaise > 0 && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>CGST (2.5%):</span>
                    <span>{formatRupees(invoice.cgstPaise)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SGST (2.5%):</span>
                    <span>{formatRupees(invoice.sgstPaise)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-300 dark:border-slate-700 font-black text-sm text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span>{formatRupees(invoice.totalPaise)}</span>
              </div>
            </div>

            {/* Payment breakdown - explicitly lists each tender */}
            <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-[10px] space-y-1">
              <p className="font-bold text-slate-600 dark:text-slate-400">Payment Breakdown:</p>
              {invoice.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{p.mode}:</span>
                  <span className="font-semibold">{formatRupees(p.amountPaise)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-0.5 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span>Total Settled:</span>
                <span>{formatRupees(invoice.totalPaise)}</span>
              </div>
              {invoice.changeDuePaise && invoice.changeDuePaise > 0 ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Cash Tendered:</span>
                    <span>{formatRupees(invoice.cashTenderedPaise || 0)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Change Returned:</span>
                    <span>{formatRupees(invoice.changeDuePaise)}</span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer note */}
            <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 text-center text-[10px] text-slate-500 leading-tight whitespace-pre-line">
              {settings.receiptFooter || 'Thank you!\nVisit again.'}
              <p className="mt-1 text-[9px] text-blue-600 dark:text-blue-400 font-bold">
                [DEMO / SIMULATED TRANSACTION]
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-transform active:scale-95 text-blue-600 dark:text-blue-400"
            >
              <Printer className="w-4 h-4" />
              <span>Print (Win)</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={() => {
              onNewBill();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-transform active:scale-95"
          >
            New Bill (F2)
          </button>
        </div>
      </div>
    </div>
  );
};
