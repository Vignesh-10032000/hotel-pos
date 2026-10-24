import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { useSettingsStore } from '../../stores/settings-store';
import { useTranslationHelper } from '../../i18n/translations';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { language, setLanguage, theme, toggleTheme } = useSettingsStore();
  const t = useTranslationHelper(language);

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setErrorMessage('Invalid username or password. Use demo credentials below.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'cashier') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('1234');
      await login('admin', '1234');
    } else {
      setUsername('cashier');
      setPassword('1111');
      await login('cashier', '1111');
    }
    navigate('/dashboard');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'}`}>
      {/* Top right language / theme switch */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 shadow-sm"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-sm"
        >
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/20">
            🍲
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            BIRYANI POS
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
            GSTIN: 33AABCU9603R12X
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 mt-3 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Windows POS Terminal Demo</span>
          </div>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Password / PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or PIN"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Remember me</span>
            </label>
            <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
              Demo PIN: 1234
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing in...' : t.login}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider mb-3">
            Quick 1-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-2.5 px-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              👑 Store Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('cashier')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              🧑‍🍳 Cashier
            </button>
          </div>
        </div>

        {/* Version Footer */}
        <p className="mt-6 text-[11px] text-center text-slate-400 dark:text-slate-500">
          Biryani POS v0.1.0 · Windows Browser Demo
        </p>
      </div>
    </div>
  );
};
