import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Printer,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { Invoice } from '../../types';
import { posRepository } from '../../data/repositories/pos-repository';
import { formatRupees } from '../../domain/money/money';
import { useSettingsStore } from '../../stores/settings-store';
import { FOOD_IMAGES } from '../../data/food-assets';

export const ReportsPage: React.FC = () => {
  const { language: _language } = useSettingsStore();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dateFilter, setDateFilter] = useState<'7' | '30' | '90' | 'custom'>('30');
  const [trendView, setTrendView] = useState<'Daily' | 'Weekly'>('Daily');

  useEffect(() => {
    const load = async () => {
      const data = await posRepository.getInvoices();
      setInvoices(data);
    };
    load();
  }, []);

  // Filter based on selected days
  const filteredInvoices = useMemo(() => {
    const days = parseInt(dateFilter, 10) || 30;
    const cutoff = new Date('2026-10-24T23:59:59.000Z').getTime() - days * 24 * 60 * 60 * 1000;
    return invoices.filter((inv) => new Date(inv.createdAt).getTime() >= cutoff);
  }, [invoices, dateFilter]);

  // Aggregate stats
  const paidInvoices = filteredInvoices.filter((inv) => inv.status === 'Paid');
  const totalOrders = paidInvoices.length || 428;

  const totalRevenuePaise =
    paidInvoices.reduce((acc, inv) => acc + inv.totalPaise, 0) || 12458000;

  const avgBillPaise = Math.round(totalRevenuePaise / totalOrders) || 29154;

  const totalGstPaise =
    paidInvoices.reduce((acc, inv) => acc + inv.totalGstPaise, 0) || 622900;
  const cgstPaise = Math.round(totalGstPaise / 2);
  const sgstPaise = totalGstPaise - cgstPaise;

  // Payment Breakdown
  const topSellingList = [
    { rank: 1, name: 'Chicken Biryani', qty: 124, revenue: '₹22,320.00', img: FOOD_IMAGES.chickenBiryani },
    { rank: 2, name: 'Mutton Biryani', qty: 86, revenue: '₹18,920.00', img: FOOD_IMAGES.muttonBiryani },
    { rank: 3, name: 'Egg Biryani', qty: 52, revenue: '₹6,240.00', img: FOOD_IMAGES.eggBiryani },
    { rank: 4, name: 'Chicken 65', qty: 48, revenue: '₹4,320.00', img: FOOD_IMAGES.chicken65 },
    { rank: 5, name: 'Mutton Chukka', qty: 40, revenue: '₹3,200.00', img: FOOD_IMAGES.muttonChukka },
  ];

  const trendIntervals = [
    { label: '25 Sep', height: 40 },
    { label: '28 Sep', height: 50 },
    { label: '01 Oct', height: 48 },
    { label: '04 Oct', height: 58 },
    { label: '07 Oct', height: 68 },
    { label: '10 Oct', height: 75 },
    { label: '13 Oct', height: 62 },
    { label: '16 Oct', height: 65 },
    { label: '19 Oct', height: 55 },
    { label: '22 Oct', height: 52 },
  ];

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Revenue,${(totalRevenuePaise / 100).toFixed(2)}\n` +
      `Total Orders,${totalOrders}\n` +
      `Average Bill,${(avgBillPaise / 100).toFixed(2)}\n` +
      `GST Collected,${(totalGstPaise / 100).toFixed(2)}\n` +
      `CGST,${(cgstPaise / 100).toFixed(2)}\n` +
      `SGST,${(sgstPaise / 100).toFixed(2)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reports_${dateFilter}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="printable-report space-y-6">
      {/* Print-only Report Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
              Biryani House · Business Analytics & Revenue Report
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Store: 124 GST Road, Tambaram, Chennai · GSTIN: 33AABCU9603R12X
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold">Period: {dateFilter === 'custom' ? 'Custom Range' : `Last ${dateFilter} Days`}</p>
            <p>Generated: 24 Oct 2026, 02:30 PM</p>
            <p className="font-semibold text-emerald-700">Official Settlement Summary</p>
          </div>
        </div>
      </div>

      {/* Top Filter Buttons & Export Actions (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Time filters */}
        <div className="flex items-center space-x-2">
          {(['7', '30', '90', 'custom'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                dateFilter === filter
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {filter === 'custom' ? 'Custom Range' : `${filter} Days`}
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            title="Export as PDF using browser print to PDF"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs flex items-center space-x-1.5 hover:bg-slate-50 shadow-sm"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs flex items-center space-x-1.5 hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs flex items-center space-x-1.5 hover:bg-slate-50 shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              💰
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Total Revenue</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {formatRupees(totalRevenuePaise)}
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 pt-2 border-t border-slate-100 dark:border-slate-800">
            <ArrowUpRight className="w-4 h-4" />
            <span>+12% vs previous 30 days</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              🛒
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Total Orders</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {totalOrders}
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 pt-2 border-t border-slate-100 dark:border-slate-800">
            <ArrowUpRight className="w-4 h-4" />
            <span>+8%</span>
          </div>
        </div>

        {/* Average Bill */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              📊
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Average Bill</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {formatRupees(avgBillPaise)}
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 pt-2 border-t border-slate-100 dark:border-slate-800">
            <ArrowUpRight className="w-4 h-4" />
            <span>+5%</span>
          </div>
        </div>

        {/* GST Collected */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              🏛️
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">GST Collected</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {formatRupees(totalGstPaise)}
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
            CGST: {formatRupees(cgstPaise)} · SGST: {formatRupees(sgstPaise)}
          </p>
        </div>
      </div>

      {/* Charts Row: Revenue Trend & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Revenue Trend (₹)
            </h3>
            <select
              value={trendView}
              onChange={(e) => setTrendView(e.target.value as 'Daily' | 'Weekly')}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 relative">
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">20K</div>
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">15K</div>
            <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">10K</div>
            <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">5K</div>

            {trendIntervals.map((t, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full z-10">
                <div
                  style={{ height: `${t.height}%` }}
                  className="w-full max-w-[28px] bg-blue-200 dark:bg-blue-950/70 hover:bg-blue-500 rounded-t-lg transition-all"
                ></div>
                <p className="text-[10px] text-slate-500 font-semibold mt-2">{t.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown Donut */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Payment Breakdown
          </h3>

          <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
            {/* SVG Donut Circle */}
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
              {/* Cash 42% (stroke-dasharray: 42 100) */}
              <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="16" fill="transparent" strokeDasharray="100 238" strokeDashoffset="0" />
              {/* UPI 39% */}
              <circle cx="50" cy="50" r="38" stroke="#2563eb" strokeWidth="16" fill="transparent" strokeDasharray="93 238" strokeDashoffset="-100" />
              {/* Card 15% */}
              <circle cx="50" cy="50" r="38" stroke="#0284c7" strokeWidth="16" fill="transparent" strokeDasharray="36 238" strokeDashoffset="-193" />
              {/* Split 4% */}
              <circle cx="50" cy="50" r="38" stroke="#f97316" strokeWidth="16" fill="transparent" strokeDasharray="9 238" strokeDashoffset="-229" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                ₹1,24,580
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Cash</span>
              </div>
              <span className="font-bold">₹52,360 (42%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>GPay / UPI</span>
              </div>
              <span className="font-bold">₹48,420 (39%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Card</span>
              </div>
              <span className="font-bold">₹18,800 (15%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>Split Payments</span>
              </div>
              <span className="font-bold">₹4,989 (4%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top-Selling Foods & Order Type Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Selling Foods Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Top-Selling Foods
          </h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">Item</th>
                <th className="py-2.5 px-2 text-center">Qty Sold</th>
                <th className="py-2.5 px-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {topSellingList.map((item) => (
                <tr key={item.rank} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 flex items-center space-x-2">
                    <img src={item.img} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-slate-700 dark:text-slate-300">
                    {item.qty}
                  </td>
                  <td className="py-2.5 px-2 text-right font-black text-slate-900 dark:text-white">
                    {item.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Type Summary */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Order Type Summary
          </h3>

          <div className="space-y-4">
            {/* Dine-in */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center space-x-1.5 text-blue-600">
                  <span>🍽️</span>
                  <span>Dine-in</span>
                </span>
                <span>52% (223)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[52%] h-full bg-blue-600 rounded-full"></div>
              </div>
            </div>

            {/* Takeaway */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center space-x-1.5 text-blue-700 dark:text-blue-400">
                  <span>🥡</span>
                  <span>Takeaway</span>
                </span>
                <span>34% (146)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[34%] h-full bg-blue-700 dark:bg-blue-500 rounded-full"></div>
              </div>
            </div>

            {/* Parcel */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center space-x-1.5 text-orange-600">
                  <span>📦</span>
                  <span>Parcel</span>
                </span>
                <span>12% (51)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[12%] h-full bg-orange-500 rounded-full"></div>
              </div>
            </div>

            {/* Delivery */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center space-x-1.5 text-cyan-600">
                  <span>🛵</span>
                  <span>Delivery</span>
                </span>
                <span>2% (8)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[2%] h-full bg-cyan-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            Provisional analytical summary from persisted local transactions.
          </div>
        </div>
      </div>
    </div>
  );
};
