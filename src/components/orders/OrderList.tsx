import React, { useState } from 'react';
import {
  FileText,
  Search,
  Calendar,
  Filter,
  Download,
  Printer,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { Order, SystemSettings, Store, User } from '../../types/pos';
import { formatCurrency } from '../../utils/storage';
import { ReceiptModal } from '../pos/ReceiptModal';

interface OrderListProps {
  orders: Order[];
  settings: SystemSettings;
  stores: Store[];
  users: User[];
  onUpdateOrders: (orders: Order[]) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  settings,
  stores,
  users,
  onUpdateOrders,
}) => {
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | 'month' | 'all' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedCashier, setSelectedCashier] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Receipt reprint modal
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOf7Days = startOfToday - 7 * 86400000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredOrders = orders.filter((order) => {
    const orderTime = order.timestamp || new Date(order.date).getTime();

    // Date range filter
    if (dateFilter === 'today' && orderTime < startOfToday) return false;
    if (dateFilter === 'yesterday' && (orderTime < startOfYesterday || orderTime >= startOfToday)) return false;
    if (dateFilter === '7days' && orderTime < startOf7Days) return false;
    if (dateFilter === 'month' && orderTime < startOfMonth) return false;
    if (dateFilter === 'custom') {
      if (customStart && orderTime < new Date(customStart).getTime()) return false;
      if (customEnd && orderTime > new Date(customEnd).getTime() + 86400000) return false;
    }

    // Store filter
    if (selectedStore !== 'all' && order.storeId !== selectedStore) return false;

    // Cashier filter
    if (selectedCashier !== 'all' && order.cashierId !== selectedCashier) return false;

    // Payment method filter
    if (selectedMethod !== 'all' && order.paymentMethod !== selectedMethod) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchInv = order.invoiceNumber.toLowerCase().includes(q);
      const matchCust = order.customerName.toLowerCase().includes(q);
      const matchCashier = order.cashierName.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q) || i.barcode.includes(q));
      return matchInv || matchCust || matchCashier || matchItem;
    }

    return true;
  });

  const totalFilteredSales = filteredOrders.reduce((sum, o) => sum + (o.status === 'completed' ? o.total : 0), 0);
  const totalCompletedOrders = filteredOrders.filter((o) => o.status === 'completed').length;

  const [refundConfirmId, setRefundConfirmId] = useState<string | null>(null);

  const handleRefundOrder = (orderId: string) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: 'refunded' as const } : o));
    onUpdateOrders(updated);
    setRefundConfirmId(null);
  };

  const handleExportCsv = () => {
    const headers = ['InvoiceNumber,Date,Customer,Cashier,Store,Subtotal,Discount,Tax,Total,PaymentMethod,Status'];
    const rows = filteredOrders.map((o) =>
      `"${o.invoiceNumber}","${new Date(o.timestamp).toLocaleString()}","${o.customerName}","${o.cashierName}","${o.storeName}",${o.subtotal.toFixed(2)},${o.discountTotal.toFixed(2)},${o.taxTotal.toFixed(2)},${o.total.toFixed(2)},"${o.paymentMethod}","${o.status}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aurapos_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <span>Order History & Invoices</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track sales transactions, reprint terminal receipts, filter date ranges, and manage refunds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-white hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Orders CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <p className="text-xs text-slate-400 font-semibold">Total Filtered Revenue</p>
          <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-1 tracking-tight">
            {formatCurrency(totalFilteredSales, settings.currency)}
          </p>
          <span className="inline-block mt-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
            Completed Sales
          </span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <p className="text-xs text-slate-400 font-semibold">Completed Orders</p>
          <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums tracking-tight">
            {totalCompletedOrders}
          </p>
          <span className="inline-block mt-1 text-[10px] text-slate-500 font-mono">
            transactions
          </span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <p className="text-xs text-slate-400 font-semibold">Average Order Value</p>
          <p className="text-2xl font-extrabold font-mono text-slate-800 mt-1 tracking-tight">
            {formatCurrency(totalCompletedOrders > 0 ? totalFilteredSales / totalCompletedOrders : 0, settings.currency)}
          </p>
          <span className="inline-block mt-1 text-[10px] text-slate-400 font-mono">
            per checkout
          </span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <p className="text-xs text-slate-400 font-semibold">Active Locations</p>
          <p className="text-2xl font-extrabold font-mono text-slate-800 mt-1 tracking-tight">
            {stores.length}
          </p>
          <span className="inline-block mt-1 text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/50">
            Stores Operating
          </span>
        </div>
      </div>

      {/* Date Range & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
        {/* Quick Date Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Date Range:
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7days', label: 'Last 7 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'custom', label: 'Custom Range' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDateFilter(f.id as any)}
                className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                  dateFilter === f.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice #, customer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Custom Range Picker */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 px-2.5 py-1 rounded-xl focus:border-emerald-500"
            />
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 px-2.5 py-1 rounded-xl focus:border-emerald-500"
            />
          </div>
        )}

        {/* Secondary Select Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Filter Store / Branch</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full bg-white border border-slate-200/80 text-slate-800 rounded-xl px-3 py-1.5 focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Stores</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Filter Cashier</label>
            <select
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value)}
              className="w-full bg-white border border-slate-200/80 text-slate-800 rounded-xl px-3 py-1.5 focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Cashiers</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Payment Method</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full bg-white border border-slate-200/80 text-slate-800 rounded-xl px-3 py-1.5 focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="split">Split</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date / Time</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Cashier</th>
                <th className="p-3.5">Store Branch</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {order.invoiceNumber}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(order.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-800 font-semibold">{order.customerName}</td>
                    <td className="p-3.5 text-slate-600">{order.cashierName}</td>
                    <td className="p-3.5 text-slate-600 truncate max-w-[120px]">{order.storeName}</td>
                    <td className="p-3.5 font-mono uppercase text-[11px] text-slate-600 font-medium">
                      {order.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(order.total, settings.currency)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          order.status === 'completed'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewOrder(order)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 border border-slate-200/80 hover:border-emerald-200 cursor-pointer shadow-xs"
                          title="Print Receipt (80mm & A4 formats)"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Receipt</span>
                        </button>
                        {order.status === 'completed' && (
                          refundConfirmId === order.id ? (
                            <div className="flex items-center gap-1 animate-in fade-in duration-150">
                              <button
                                type="button"
                                onClick={() => handleRefundOrder(order.id)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setRefundConfirmId(null)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setRefundConfirmId(order.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg text-[11px] transition-colors cursor-pointer"
                              title="Refund order"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reprint Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(previewOrder)}
        onClose={() => setPreviewOrder(null)}
        order={previewOrder}
        settings={settings}
      />
    </div>
  );
};
