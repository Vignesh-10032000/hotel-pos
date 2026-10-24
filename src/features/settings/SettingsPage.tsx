import React, { useState } from 'react';
import {
  Store,
  Receipt,
  Printer,
  Palette,
  Users,
  HardDrive,
  Wifi,
  Sliders,
  Check,
  AlertTriangle,
  Download,
  Upload,
} from 'lucide-react';
import { useSettingsStore } from '../../stores/settings-store';
import { posRepository } from '../../data/repositories/pos-repository';

type SettingsTab =
  | 'store'
  | 'billing'
  | 'receipt'
  | 'appearance'
  | 'users'
  | 'maintenance'
  | 'sync'
  | 'preferences';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, language, setLanguage, theme, toggleTheme } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('store');
  const [formData, setFormData] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const handleFieldChange = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleClearCache = async () => {
    await posRepository.clearCache();
    setActionNotice('Temporary cache cleared. Invoices and product catalog preserved.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleResetDemoData = async () => {
    await posRepository.resetDemoData();
    setIsResetConfirmOpen(false);
    setActionNotice('Demo data restored to initial clean seed state.');
    setTimeout(() => {
      setActionNotice('');
      window.location.reload();
    }, 1000);
  };

  const handleBackupExport = async () => {
    const json = await posRepository.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `biryani_pos_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sub-navigation sidebar (Tabs) */}
      <div className="w-full md:w-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-sm shrink-0 self-start space-y-1">
        {[
          { id: 'store', label: 'Store Information', icon: Store },
          { id: 'billing', label: 'Billing & GST', icon: Receipt },
          { id: 'receipt', label: 'Receipt & Printing', icon: Printer },
          { id: 'appearance', label: 'Appearance', icon: Palette },
          { id: 'users', label: 'Users & Security', icon: Users },
          { id: 'maintenance', label: 'Data & Maintenance', icon: HardDrive },
          { id: 'sync', label: 'Offline & Sync', icon: Wifi },
          { id: 'preferences', label: 'Business Preferences', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Panel Content */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm overflow-y-auto min-w-0">
        {actionNotice && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* TAB 1: Store Information */}
        {activeTab === 'store' && (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Store Information</h3>
                <p className="text-xs text-slate-500">Update your store details, logo and contact information</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData(settings)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Logo */}
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-3xl shadow-sm">
                🍲
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Store Logo</p>
                <p className="text-[10px] text-slate-400">PNG, JPG (Max 2MB). Recommended size: 512x512</p>
                <div className="flex items-center space-x-2 mt-2">
                  <button type="button" className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px]">
                    Change Logo
                  </button>
                  <button type="button" className="px-3 py-1 rounded-lg border border-rose-200 text-rose-600 font-bold text-[11px]">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => handleFieldChange('storeName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Store Address *
              </label>
              <textarea
                rows={2}
                value={formData.storeAddress}
                onChange={(e) => handleFieldChange('storeAddress', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GSTIN
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => handleFieldChange('gstin', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: Billing & GST */}
        {activeTab === 'billing' && (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Billing & GST</h3>
                <p className="text-xs text-slate-500">Configure tax settings, invoice numbering and billing preferences</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                Save Changes
              </button>
            </div>

            <div className="space-y-4">
              {/* Enable GST Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable GST</p>
                  <p className="text-[10px] text-slate-400">Apply GST on bills as per applicable tax laws</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableGst}
                  onChange={(e) => handleFieldChange('enableGst', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              {/* Price Display */}
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Price Display</p>
                <div className="flex items-center space-x-6 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceDisplay"
                      checked={!formData.priceInclusive}
                      onChange={() => handleFieldChange('priceInclusive', false)}
                      className="text-blue-600"
                    />
                    <span>Prices are GST Exclusive (default)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceDisplay"
                      checked={formData.priceInclusive}
                      onChange={() => handleFieldChange('priceInclusive', true)}
                      className="text-blue-600"
                    />
                    <span>Prices are GST Inclusive</span>
                  </label>
                </div>
              </div>

              {/* Default GST Rate & Custom GST Rate toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Default GST Rate
                  </label>
                  <select
                    value={formData.defaultGstRate}
                    onChange={(e) => handleFieldChange('defaultGstRate', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  >
                    <option value={0}>0% (No GST)</option>
                    <option value={5}>5% (Default)</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Allow Custom GST Rate</p>
                    <p className="text-[10px] text-slate-400">Allow different GST rates for individual products</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allowCustomGstRate}
                    onChange={(e) => handleFieldChange('allowCustomGstRate', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
              </div>

              {/* Invoice Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={formData.invoicePrefix}
                    onChange={(e) => handleFieldChange('invoicePrefix', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Next Invoice Number
                  </label>
                  <input
                    type="number"
                    value={formData.nextInvoiceNumber}
                    onChange={(e) => handleFieldChange('nextInvoiceNumber', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Format Preview
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-700">
                    {formData.invoicePrefix}{String(formData.nextInvoiceNumber).padStart(6, '0')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Note / Footer *
                </label>
                <textarea
                  rows={2}
                  value={formData.invoiceNote}
                  onChange={(e) => handleFieldChange('invoiceNote', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: Receipt & Printing */}
        {activeTab === 'receipt' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Receipt & Printing</h3>
                <p className="text-xs text-slate-500">Configure receipt layout and printer settings</p>
              </div>
              <button
                onClick={() => handleSave()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Receipt Preview */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Receipt Preview</p>
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 font-mono text-[11px] space-y-2 max-w-xs mx-auto">
                  <div className="text-center space-y-0.5">
                    <p className="font-black text-sm text-slate-900 dark:text-white uppercase">{formData.storeName}</p>
                    <p className="text-[10px] text-slate-500">{formData.storeAddress}</p>
                    <p className="text-[10px] text-slate-500">GSTIN: {formData.gstin}</p>
                  </div>
                  <div className="flex justify-between border-t border-b border-dashed border-slate-300 dark:border-slate-700 py-1 text-[10px]">
                    <span>Invoice: BIR-000042</span>
                    <span>24 Oct 2026 02:15 PM</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Chicken Biryani x 2</span>
                      <span>₹360.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mutton Biryani x 1</span>
                      <span>₹220.00</span>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-1 space-y-0.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span>₹580.00</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>GST (5%):</span>
                      <span>₹29.00</span>
                    </div>
                    <div className="flex justify-between font-black text-xs text-slate-900 dark:text-white pt-1">
                      <span>Total:</span>
                      <span>₹609.00</span>
                    </div>
                  </div>
                  <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                    Thank you! Visit again.
                  </div>
                </div>
              </div>

              {/* Printer Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Printer Type
                  </label>
                  <select
                    value={formData.printerType}
                    onChange={(e) => handleFieldChange('printerType', e.target.value as 'Thermal 80mm' | 'Standard A4')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Thermal 80mm">Thermal Printer (80mm)</option>
                    <option value="Standard A4">Standard (A4 / Inkjet)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2 rounded-xl border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-50"
                  >
                    Test Print
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Print Sample Bill
                  </button>
                </div>

                {/* Receipt options toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Receipt Options</p>
                  {[
                    { key: 'showStoreLogo', label: 'Show Store Logo' },
                    { key: 'showStoreAddress', label: 'Show Store Address' },
                    { key: 'showPhoneNumber', label: 'Show Phone Number' },
                    { key: 'showGstin', label: 'Show GSTIN' },
                    { key: 'showGstBreakdown', label: 'Show GST Breakdown' },
                  ].map((opt) => (
                    <label key={opt.key} className="flex items-center justify-between text-xs py-1 cursor-pointer">
                      <span>{opt.label}</span>
                      <input
                        type="checkbox"
                        checked={formData[opt.key as keyof typeof formData] as boolean}
                        onChange={(e) => handleFieldChange(opt.key as keyof typeof formData, e.target.checked as never)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </label>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300">
                  <strong>[DEMO / SIMULATED]</strong> Actual Android built-in thermal printer integration (ESC/POS) will be connected after hardware inspection.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Appearance */}
        {activeTab === 'appearance' && (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h3>
                <p className="text-xs text-slate-500">Customize language, theme and display settings</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Language */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Language</label>
                <div className="flex items-center space-x-4 text-xs font-bold">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="appLanguage"
                      checked={language === 'en'}
                      onChange={() => setLanguage('en')}
                      className="text-blue-600"
                    />
                    <span>English</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="appLanguage"
                      checked={language === 'ta'}
                      onChange={() => setLanguage('ta')}
                      className="text-blue-600"
                    />
                    <span>தமிழ் (Tamil)</span>
                  </label>
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Theme</label>
                <div className="flex items-center space-x-4 text-xs font-bold">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="appTheme"
                      checked={theme === 'light'}
                      onChange={toggleTheme}
                      className="text-blue-600"
                    />
                    <span>Light Mode</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="appTheme"
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                      className="text-blue-600"
                    />
                    <span>Dark Mode</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                <input
                  type="text"
                  disabled
                  value="₹ INR (Indian Rupee)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date Format</label>
                <input
                  type="text"
                  disabled
                  value="24 Oct 2026 (DD MMM YYYY)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dashboard Greeting
              </label>
              <input
                type="text"
                value={formData.dashboardGreeting}
                onChange={(e) => handleFieldChange('dashboardGreeting', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
          </form>
        )}

        {/* TAB 5: Users & Security */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Users & Security</h3>
                <p className="text-xs text-slate-500">Manage staff accounts and access permissions</p>
              </div>
              <button
                type="button"
                onClick={() => alert('New user registration is ready for multi-terminal deployment.')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                + Add User
              </button>
            </div>

            {/* Staff list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {[
                    { name: 'Admin', role: 'Owner', status: 'Active' },
                    { name: 'Karthik', role: 'Cashier', status: 'Active' },
                    { name: 'Priya', role: 'Cashier', status: 'Active' },
                    { name: 'Mani', role: 'Cashier', status: 'Inactive' },
                  ].map((u) => (
                    <tr key={u.name}>
                      <td className="py-3 px-3 font-bold">{u.name}</td>
                      <td className="py-3 px-3">{u.role}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-blue-600 font-bold hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Security Options */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Security Options</p>
              {[
                { label: 'Auto Lock After Inactivity (10 minutes)', checked: true },
                { label: 'Require PIN for Refunds', checked: true },
                { label: 'Require PIN for Discounts', checked: true },
                { label: 'Allow Void / Delete Bills', checked: true },
              ].map((sec) => (
                <div key={sec.label} className="flex items-center justify-between text-xs py-1">
                  <span>{sec.label}</span>
                  <input type="checkbox" defaultChecked={sec.checked} className="w-4 h-4 text-blue-600 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: Data & Maintenance */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Data & Maintenance</h3>
              <p className="text-xs text-slate-500">Manage local data, cache and database backups</p>
            </div>

            {/* Cache management */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Cache Management</p>
              <p className="text-[11px] text-slate-500 leading-tight">
                Clear temporary files and cached data. <strong>This will NOT delete your sales data, products or store information.</strong>
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100"
                >
                  Clear Cache
                </button>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100"
                >
                  Refresh Product Cache
                </button>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Backup & Restore</p>
              <p className="text-[11px] text-slate-500">
                Create a full JSON export of your local IndexedDB products, historical invoices, and store configurations.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleBackupExport}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Create Backup</span>
                </button>
                <label className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer flex items-center space-x-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const text = await file.text();
                        await posRepository.importBackup(text);
                        alert('Backup restored successfully!');
                        window.location.reload();
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Reset Demo Data */}
            <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400">Reset Demo Data</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Re-seeds the demo database with original chicken biryani sales, metrics, and products. Requires confirmation.
              </p>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: Offline & Sync */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Offline & Sync</h3>
              <p className="text-xs text-slate-500">View sync status and manage offline data</p>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Sync Status: Online</p>
                <p className="text-[10px] text-emerald-600">Last synced: 24 Oct 2026 01:58 PM</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionNotice('Sync check completed: 0 pending offline bills.');
                  setTimeout(() => setActionNotice(''), 2500);
                }}
                className="ml-auto px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Sync Now
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Pending</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">0</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Failed</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">0</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Synchronized</p>
                <p className="text-lg font-black text-emerald-600">128</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <strong>[DEMO / SIMULATED ADAPTER]</strong> Local Dexie IndexedDB storage is 100% functional and persists across browser refreshes and restarts. Production Node.js + PostgreSQL synchronization adapter is scaffolded and will connect upon cloud server deployment.
            </div>
          </div>
        )}

        {/* TAB 8: Business Preferences */}
        {activeTab === 'preferences' && (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Business Preferences</h3>
                <p className="text-xs text-slate-500">Configure default settings for daily operations</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Order Type
                </label>
                <select
                  value={formData.defaultOrderType}
                  onChange={(e) => handleFieldChange('defaultOrderType', e.target.value as 'Dine-in' | 'Takeaway' | 'Parcel')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="Dine-in">Dine-in</option>
                  <option value="Takeaway">Takeaway</option>
                  <option value="Parcel">Parcel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Payment Method
                </label>
                <select
                  value={formData.defaultPaymentMethod}
                  onChange={(e) => handleFieldChange('defaultPaymentMethod', e.target.value as 'Cash' | 'GPay / UPI' | 'Card')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="GPay / UPI">GPay / UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Allow Discount</p>
                  <p className="text-[10px] text-slate-400">Cashier can apply bill discounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowDiscount}
                  onChange={(e) => handleFieldChange('allowDiscount', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maximum Discount (%)
                </label>
                <input
                  type="number"
                  value={formData.maxDiscountPercent}
                  onChange={(e) => handleFieldChange('maxDiscountPercent', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Confirmation Modal for Reset Demo Data */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Reset Demo Data Confirmation</h3>
            </div>
            <p className="text-xs text-slate-500">
              Are you sure you want to re-seed the demo database? This will restore original sample invoices and products matching the screenshots.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Yes, Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
