import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Monitor,
  Layers,
  Activity,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  LogOut,
  UserCheck,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth-store';
import { useSettingsStore } from '../stores/settings-store';
import { useTranslationHelper } from '../i18n/translations';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, setUser } = useAuthStore();
  const { language, setLanguage, theme, toggleTheme, settings, loadSettings } = useSettingsStore();
  const t = useTranslationHelper(language);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      const formattedHours = String(hours % 12 || 12).padStart(2, '0');
      setCurrentTime(`${formattedHours}:${minutes}:${seconds} ${ampm}`);

      const day = String(now.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      setCurrentDate(`${day} ${month} ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/pos')) {
      return { title: t.posTerminal, subtitle: '' };
    }
    if (path.startsWith('/products')) {
      return { title: t.products, subtitle: 'Manage food items for billing' };
    }
    if (path.startsWith('/sales-history')) {
      return { title: t.salesHistory, subtitle: 'View, search and manage all transactions' };
    }
    if (path.startsWith('/reports')) {
      return { title: t.reports, subtitle: '' };
    }
    if (path.startsWith('/settings')) {
      return { title: t.settings, subtitle: 'Manage your store, billing, users and system preferences' };
    }
    if (path.startsWith('/day-close')) {
      return { title: t.dayClose, subtitle: 'Daily settlement and payment reconciliation' };
    }
    return { title: t.dashboard, subtitle: '' };
  };

  const pageInfo = getPageInfo();

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <aside
        className={`border-r flex flex-col shrink-0 transition-all duration-200 z-30 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } ${!isSidebarOpen ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b flex items-center justify-between border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="text-xl">🍲</span>
            </div>
            {isSidebarOpen && (
              <div className="truncate">
                <h1 className="font-black text-sm tracking-tight leading-tight text-slate-900 dark:text-white uppercase">
                  {settings.storeName || 'BIRYANI POS'}
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider truncate">
                  {settings.gstin ? `GSTIN: ${settings.gstin}` : 'GSTIN: 33AABCU9603R12X'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Royal Blue Active Palette) */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`
            }
          >
            <LayoutGrid className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>{t.dashboard}</span>}
          </NavLink>

          <NavLink
            to="/pos"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`
            }
          >
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span>{t.posTerminal}</span>}
            </div>
            {isSidebarOpen && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500 text-white rounded-md uppercase tracking-wider">
                {t.live}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`
            }
          >
            <Layers className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>{t.products}</span>}
          </NavLink>

          <NavLink
            to="/sales-history"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`
            }
          >
            <Activity className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>{t.salesHistory}</span>}
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`
            }
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>{t.reports}</span>}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`
            }
          >
            <Settings className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>{t.settings}</span>}
          </NavLink>
        </nav>

        {/* Profile Section Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              {isSidebarOpen && (
                <div className="text-left truncate">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name || 'Store Admin'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Biryani POS · TN
                  </p>
                </div>
              )}
            </div>
            {isSidebarOpen && <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          </button>

          {/* Profile dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
                <p className="text-slate-500 capitalize">{user?.role || 'Owner'} Role</p>
              </div>
              <button
                onClick={() => {
                  setUser({
                    id: 'usr_karthik',
                    username: 'karthik',
                    name: 'Karthik',
                    role: 'Cashier',
                    pin: '1111',
                    isActive: true,
                  });
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Switch to Cashier (Karthik)</span>
              </button>
              <button
                onClick={() => {
                  setUser({
                    id: 'usr_admin',
                    username: 'admin',
                    name: 'Store Admin',
                    role: 'Owner',
                    pin: '1234',
                    isActive: true,
                  });
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Switch to Owner (Admin)</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header
          className={`h-16 px-6 border-b flex items-center justify-between shrink-0 z-20 ${
            theme === 'dark' ? 'bg-slate-900/90 border-slate-800 backdrop-blur' : 'bg-white/90 border-slate-200 backdrop-blur'
          }`}
        >
          {/* Page Title & Subtitle */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {pageInfo.title}
            </h2>
            {pageInfo.subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {pageInfo.subtitle}
              </p>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-transform active:scale-95"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-transform active:scale-95"
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>

            {/* Demo Console Badge */}
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>* {t.demoConsole}</span>
            </div>

            {/* GST Registered · TN Badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{t.gstRegistered}</span>
            </div>

            {/* Live Clock & Date */}
            <div className="text-right text-xs font-mono pl-1 border-l border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{currentTime || '02:26:22 pm'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{currentDate || '24 Oct 2026'}</p>
            </div>
          </div>
        </header>

        {/* Page Body with full vertical scrolling */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
