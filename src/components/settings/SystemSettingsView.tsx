import React, { useState } from 'react';
import { Sliders, Save, Check, Globe, DollarSign, Receipt, Building, ShieldCheck } from 'lucide-react';
import { SystemSettings, Currency } from '../../types/pos';
import { formatCurrency } from '../../utils/storage';

interface SystemSettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const CURRENCY_PRESETS: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar ($)', position: 'before', decimals: 2 },
    { code: 'EUR', symbol: '€', name: 'Euro (€)', position: 'before', decimals: 2 },
    { code: 'GBP', symbol: '£', name: 'British Pound (£)', position: 'before', decimals: 2 },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)', position: 'before', decimals: 2 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', position: 'before', decimals: 2 },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)', position: 'before', decimals: 2 },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)', position: 'before', decimals: 2 },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)', position: 'before', decimals: 2 },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)', position: 'before', decimals: 2 },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', position: 'after', decimals: 2 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)', position: 'before', decimals: 0 },
  ];

  const handleCurrencySelect = (code: string) => {
    const selected = CURRENCY_PRESETS.find((c) => c.code === code);
    if (selected) {
      setFormData({ ...formData, currency: selected });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <span>Enterprise System & Hardware Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic multi-currency, tax regulations, business profile, and receipt slip layout
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in shadow-xs">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Dynamic Multi-Currency Configuration */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dynamic Currency Configuration</h3>
              <p className="text-[11px] text-slate-400">
                Choose primary monetary unit, symbol positioning, and decimal places across POS and receipts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Select Preset Currency</label>
              <select
                value={formData.currency.code}
                onChange={(e) => handleCurrencySelect(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              >
                {CURRENCY_PRESETS.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Custom Currency Symbol</label>
              <input
                type="text"
                value={formData.currency.symbol}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currency: { ...formData.currency, symbol: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none font-bold transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Symbol Position</label>
              <select
                value={formData.currency.position}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currency: {
                      ...formData.currency,
                      position: e.target.value as 'before' | 'after',
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              >
                <option value="before">Before Amount ($100.00)</option>
                <option value="after">After Amount (100.00 $)</option>
              </select>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Live POS Currency Preview:</span>
            <span className="font-mono text-base font-extrabold text-emerald-700">
              {formatCurrency(1489.5, formData.currency)}
            </span>
          </div>
        </div>

        {/* SECTION 2: Business & Tax Profile */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80">
              <Building className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Business Identity & Tax Compliance</h3>
              <p className="text-[11px] text-slate-400">Legal business entity name, VAT registration, contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Legal Company Name *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Trading / Brand Name</label>
              <input
                type="text"
                value={formData.tradingName}
                onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tax Registration / VAT PIN</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Standard VAT Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={Math.round(formData.taxRate * 100)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxRate: (parseFloat(e.target.value) || 0) / 100,
                  })
                }
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Support Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Store Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Physical Store Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* SECTION 3: Receipt Template Layout */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Thermal 80mm & A4 Receipt Template</h3>
              <p className="text-[11px] text-slate-400">Header greetings, return policies, and barcode printing options</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Receipt Header Custom Message
              </label>
              <textarea
                rows={3}
                value={formData.receiptHeader}
                onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Receipt Footer / Policy Message
              </label>
              <textarea
                rows={3}
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={formData.showTaxOnReceipt}
                onChange={(e) => setFormData({ ...formData, showTaxOnReceipt: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>Print VAT / Tax Breakdown Line</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={formData.showBarcodeOnReceipt}
                onChange={(e) =>
                  setFormData({ ...formData, showBarcodeOnReceipt: e.target.checked })
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>Render Barcode on Thermal Receipts</span>
            </label>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
