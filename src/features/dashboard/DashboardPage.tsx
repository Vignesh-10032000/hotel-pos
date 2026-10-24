import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  ArrowUpRight,
  Receipt,
  Calendar,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { Invoice } from '../../types';
import { posRepository } from '../../data/repositories/pos-repository';
import { formatRupees } from '../../domain/money/money';
import { useSettingsStore } from '../../stores/settings-store';
import { useTranslationHelper } from '../../i18n/translations';
import { FOOD_IMAGES } from '../../data/food-assets';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useSettingsStore();
  const t = useTranslationHelper(language);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const allInvoices = await posRepository.getInvoices();
        setInvoices(allInvoices);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Filter today's invoices (includes demo base date and newly generated demo bills)
  const todayInvoices = invoices.filter((inv) => {
    const invDate = new Date(inv.createdAt).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const num = parseInt(inv.invoiceNumber.replace(/\D/g, ''), 10) || 0;
    return invDate === '2026-10-24' || invDate === todayStr || num >= 43;
  });

  const todayRevenuePaise = todayInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.totalPaise, 0);

  const thisWeekRevenuePaise = invoices
    .filter((inv) => inv.status === 'Paid')
    .slice(0, 312)
    .reduce((acc, inv) => acc + inv.totalPaise, 0);

  const recentTransactions = invoices.slice(0, 5);

  const topSellingFoods = [
    { rank: 1, name: 'Chicken Biryani', qty: 124, revenue: '₹18,600', pct: 90, img: FOOD_IMAGES.chickenBiryani },
    { rank: 2, name: 'Mutton Biryani', qty: 86, revenue: '₹18,920', pct: 68, img: FOOD_IMAGES.muttonBiryani },
    { rank: 3, name: 'Egg Biryani', qty: 52, revenue: '₹6,240', pct: 45, img: FOOD_IMAGES.eggBiryani },
    { rank: 4, name: 'Chicken 65', qty: 48, revenue: '₹4,320', pct: 40, img: FOOD_IMAGES.chicken65 },
    { rank: 5, name: 'Soft Drink', qty: 36, revenue: '₹1,080', pct: 28, img: FOOD_IMAGES.softDrink },
  ];

  const trendDays = [
    { day: 'Mon', date: '19 Oct', heightPct: 45, val: '14.2K' },
    { day: 'Tue', date: '20 Oct', heightPct: 55, val: '16.8K' },
    { day: 'Wed', date: '21 Oct', heightPct: 50, val: '15.1K' },
    { day: 'Thu', date: '22 Oct', heightPct: 62, val: '18.4K' },
    { day: 'Fri', date: '23 Oct', heightPct: 75, val: '22.6K' },
    { day: 'Sat', date: '24 Oct', heightPct: 70, val: '20.9K' },
    { day: 'Sun', date: '25 Oct', heightPct: 65, val: '19.5K' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading business overview...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Overview Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.businessOverview}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.businessOverviewSubtitle}
          </p>
        </div>

        {/* Prominent Day Close Summary Action */}
        <button
          onClick={() => navigate('/day-close')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-transform active:scale-95 shrink-0"
        >
          <Lock className="w-4 h-4" />
          <span>{t.dayClose}</span>
        </button>
      </div>

      {/* 3 Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Today's Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.todaysRevenue}
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatRupees(todayRevenuePaise || 1245000)}
              </h3>
              <div className="flex items-center space-x-1 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12% compared to yesterday</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {todayInvoices.length || 48} transactions
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: This Week */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.thisWeek}
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatRupees(thisWeekRevenuePaise || 7832000)}
              </h3>
              <div className="flex items-center space-x-1 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                <span>+8% from last week</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                312 transactions
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Orders Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.ordersToday}
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {todayInvoices.length || 48}
              </h3>
              <div className="flex items-center space-x-1 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                <span>+15% vs daily target</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Average bill: ₹259.38
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Top Sellers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.dailyRevenueTrend}
            </h3>
            <select className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>

          {/* SVG Combined Bar & Line Chart */}
          <div className="h-56 w-full flex items-end justify-between gap-4 pt-4 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 pl-1">30K</div>
            <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 pl-1">20K</div>
            <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 pl-1">10K</div>

            {trendDays.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                  {d.val}
                </span>
                <div
                  style={{ height: `${d.heightPct}%` }}
                  className="w-full max-w-[40px] bg-blue-200 dark:bg-blue-950/80 group-hover:bg-blue-500 rounded-t-lg transition-all"
                ></div>
                <div className="text-center mt-2">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{d.day}</p>
                  <p className="text-[9px] text-slate-400">{d.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.topSellingItems}
            </h3>
            <span className="text-[11px] font-medium text-slate-500">This Week</span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {topSellingFoods.map((item) => (
              <div key={item.rank} className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {item.rank}
                </span>
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{item.qty}</p>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      style={{ width: `${item.pct}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right mt-0.5">{item.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.recentTransactions}
          </h3>
          <button
            onClick={() => navigate('/sales-history')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Order Type</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {recentTransactions.map((inv) => {
                const timeString = new Date(inv.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const itemSummary = inv.items
                  .map((it) => `${it.name} × ${it.quantity}`)
                  .slice(0, 2)
                  .join(', ');

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
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
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate max-w-xs">
                      {itemSummary}
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">
                      {formatRupees(inv.totalPaise)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">
                      {timeString}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
