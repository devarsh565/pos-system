import React, { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle, Clock, Trash2, Tag, Search, Filter } from 'lucide-react';
import { Product, SystemSettings } from '../../types/pos';
import { formatCurrency } from '../../utils/storage';

interface ExpirationManagerProps {
  products: Product[];
  settings: SystemSettings;
  onUpdateProduct: (product: Product) => void;
  onApplyClearance: (product: Product, discountPercent: number) => void;
}

export const ExpirationManager: React.FC<ExpirationManagerProps> = ({
  products,
  settings,
  onUpdateProduct,
  onApplyClearance,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expired' | '7days' | '30days' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newExpDate, setNewExpDate] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getExpirationStatus = (expDateStr: string) => {
    const exp = new Date(expDateStr);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: `Expired ${Math.abs(diffDays)}d ago`, days: diffDays, color: 'text-rose-700 bg-rose-50 border-rose-200' };
    }
    if (diffDays <= 7) {
      return { status: '7days', label: `Expires in ${diffDays}d`, days: diffDays, color: 'text-amber-800 bg-amber-50 border-amber-200' };
    }
    if (diffDays <= 30) {
      return { status: '30days', label: `Expires in ${diffDays}d`, days: diffDays, color: 'text-sky-800 bg-sky-50 border-sky-200' };
    }
    return { status: 'safe', label: `Safe (${diffDays}d left)`, days: diffDays, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
  };

  const processedProducts = products.map((p) => {
    const expInfo = getExpirationStatus(p.expirationDate);
    return { ...p, expInfo };
  });

  const filteredProducts = processedProducts.filter((p) => {
    if (filterType === 'expired' && p.expInfo.status !== 'expired') return false;
    if (filterType === '7days' && p.expInfo.status !== '7days') return false;
    if (filterType === '30days' && p.expInfo.status !== '30days') return false;
    if (filterType === 'safe' && p.expInfo.status !== 'safe') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Counts for tabs
  const expiredCount = processedProducts.filter((p) => p.expInfo.status === 'expired').length;
  const sevenDaysCount = processedProducts.filter((p) => p.expInfo.status === '7days').length;
  const thirtyDaysCount = processedProducts.filter((p) => p.expInfo.status === '30days').length;
  const safeCount = processedProducts.filter((p) => p.expInfo.status === 'safe').length;

  const [writeOffConfirmId, setWriteOffConfirmId] = useState<string | null>(null);

  const handleWriteOff = (product: Product) => {
    onUpdateProduct({ ...product, stock: 0 });
    setWriteOffConfirmId(null);
  };

  const handleSaveExpDate = (product: Product) => {
    if (!newExpDate) return;
    onUpdateProduct({ ...product, expirationDate: newExpDate });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary KPI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-md shadow-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <span>Product Expiration & Shelf-Life Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time shelf life monitoring, clearance price markdown, and waste prevention
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-rose-100 p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-700">Expired Stock</p>
            <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">{expiredCount}</p>
            <p className="text-[11px] text-rose-500 mt-0.5">Requires disposal</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-amber-100 p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700">Expiring &le; 7 Days</p>
            <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">{sevenDaysCount}</p>
            <p className="text-[11px] text-amber-500 mt-0.5">Clearance recommended</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-sky-100 p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sky-700">Expiring &le; 30 Days</p>
            <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">{thirtyDaysCount}</p>
            <p className="text-[11px] text-sky-500 mt-0.5">Watch closely</p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700">Optimal Shelf Life</p>
            <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">{safeCount}</p>
            <p className="text-[11px] text-emerald-500 mt-0.5">Healthy inventory</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expired')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'expired'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Expired ({expiredCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('7days')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === '7days'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            &le; 7 Days ({sevenDaysCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('30days')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === '30days'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            &le; 30 Days ({thirtyDaysCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('safe')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'safe'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Optimal ({safeCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or barcode..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Expiration Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono border-b border-slate-200">
              <tr>
                <th className="p-3.5">Product Name & Barcode</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5 text-center">In Stock</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5">Expiration Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No products match the selected expiration filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{prod.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{prod.barcode}</p>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 font-medium">{prod.sku}</td>
                    <td className="p-3.5 text-center font-mono font-bold">
                      <span className={prod.stock <= prod.minStockAlert ? 'text-amber-600' : 'text-slate-800'}>
                        {prod.stock} {prod.unit}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(prod.sellingPrice, settings.currency)}
                    </td>
                    <td className="p-3.5 font-mono">
                      {editingProduct?.id === prod.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="date"
                            value={newExpDate}
                            onChange={(e) => setNewExpDate(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveExpDate(prod)}
                            className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[11px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(prod);
                            setNewExpDate(prod.expirationDate);
                          }}
                          className="hover:underline text-slate-800 font-medium flex items-center gap-1"
                          title="Click to edit date"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prod.expirationDate}</span>
                        </button>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${prod.expInfo.color}`}
                      >
                        {prod.expInfo.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {prod.expInfo.status !== 'safe' && (
                          <button
                            type="button"
                            onClick={() => onApplyClearance(prod, 30)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                            title="Mark down price by 30% for quick clearance"
                          >
                            <Tag className="w-3 h-3 text-amber-600" />
                            <span>-30% Clearance</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleWriteOff(prod)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="Write off expired or spoiled inventory"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>Write Off</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
