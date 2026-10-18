import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, X, Check, Calendar, DollarSign, Percent } from 'lucide-react';
import { Discount, SystemSettings } from '../../types/pos';
import { formatCurrency } from '../../utils/storage';

interface DiscountManagementProps {
  discounts: Discount[];
  settings: SystemSettings;
  onUpdateDiscounts: (discounts: Discount[]) => void;
}

export const DiscountManagement: React.FC<DiscountManagementProps> = ({
  discounts,
  settings,
  onUpdateDiscounts,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('10');
  const [minSpend, setMinSpend] = useState('0');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [isActive, setIsActive] = useState(true);

  const openAdd = () => {
    setEditingDiscount(null);
    setCode('PROMO' + Math.floor(10 + Math.random() * 90));
    setName('Seasonal Special Offer');
    setType('percentage');
    setValue('15');
    setMinSpend('20');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('2026-12-31');
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEdit = (d: Discount) => {
    setEditingDiscount(d);
    setCode(d.code);
    setName(d.name);
    setType(d.type);
    setValue(d.value.toString());
    setMinSpend(d.minSpend.toString());
    setStartDate(d.startDate);
    setEndDate(d.endDate);
    setIsActive(d.isActive);
    setIsFormOpen(true);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    onUpdateDiscounts(discounts.filter((d) => d.id !== id));
    setDeleteConfirmId(null);
  };

  const handleToggleActive = (d: Discount) => {
    onUpdateDiscounts(
      discounts.map((item) => (item.id === d.id ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const discountData: Discount = {
      id: editingDiscount ? editingDiscount.id : 'disc-' + Date.now(),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      value: parseFloat(value) || 0,
      minSpend: parseFloat(minSpend) || 0,
      startDate,
      endDate,
      isActive,
      usageCount: editingDiscount ? editingDiscount.usageCount : 0,
    };

    if (editingDiscount) {
      onUpdateDiscounts(discounts.map((d) => (d.id === editingDiscount.id ? discountData : d)));
    } else {
      onUpdateDiscounts([discountData, ...discounts]);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <span>Discounts & Promotional Codes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure percentage and fixed cash voucher discounts applicable during sales processing
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promotion</span>
        </button>
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {discounts.map((d) => (
          <div
            key={d.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              d.isActive
                ? 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-emerald-300 hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-slate-50 border-slate-200/60 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                  {d.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    d.isActive
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-slate-500 bg-slate-100 border-slate-200'
                  }`}
                >
                  {d.isActive ? 'Active Promotion' : 'Disabled'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-1">{d.name}</h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex justify-between">
                  <span>Discount Value:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {d.type === 'percentage' ? `${d.value}% Off` : `${formatCurrency(d.value, settings.currency)} Flat`}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Minimum Cart Spend:</span>
                  <span className="font-mono font-medium">{formatCurrency(d.minSpend, settings.currency)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Validity Window:</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {d.startDate} &rarr; {d.endDate}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Redemptions:</span>
                  <span className="font-mono font-bold text-slate-800">{d.usageCount} times</span>
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleActive(d)}
                className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                  d.isActive
                    ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {d.isActive ? 'Disable' : 'Enable'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(d)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(d.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900">
                {editingDiscount ? 'Edit Promotion' : 'Create New Discount Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH20"
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Promotion Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Weekend Flash Sale"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Currency Amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Value ({type === 'percentage' ? '%' : '$'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Minimum Order Spend ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Save Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
