import React, { useState } from 'react';
import { Printer, Download, X, FileText, CheckCircle2 } from 'lucide-react';
import { Order, SystemSettings } from '../../types/pos';
import { formatCurrency } from '../../utils/storage';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  settings: SystemSettings;
  onNewSale?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  settings,
  onNewSale,
}) => {
  const [paperFormat, setPaperFormat] = useState<'80mm' | 'a4'>('80mm');

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.timestamp).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Control Bar (Hidden when printed) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Sale Receipt & Invoice</h3>
              <p className="text-xs text-slate-400 font-mono">Invoice: {order.invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Switcher */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setPaperFormat('80mm')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  paperFormat === '80mm'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                80mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('a4')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  paperFormat === 'a4'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Tax Invoice
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70 flex justify-center">
          {paperFormat === '80mm' ? (
            /* 80mm Thermal Slip View */
            <div className="print-container w-[320px] bg-white text-slate-900 p-6 rounded-lg shadow-lg font-mono text-[12px] leading-relaxed select-text">
              {/* Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <h2 className="text-base font-bold uppercase tracking-wide text-black">
                  {settings.businessName}
                </h2>
                <p className="text-[11px] text-slate-600">{settings.address}</p>
                <p className="text-[11px] text-slate-600">Tel: {settings.phone}</p>
                <p className="text-[11px] text-slate-600">PIN/VAT: {settings.taxId}</p>
                {settings.receiptHeader && (
                  <p className="text-[10px] text-slate-500 mt-1 whitespace-pre-line italic">
                    {settings.receiptHeader}
                  </p>
                )}
              </div>

              {/* Order Meta */}
              <div className="py-2.5 text-[11px] border-b border-dashed border-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Receipt #:</span>
                  <span className="font-bold">{order.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date/Time:</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cashier:</span>
                  <span>{order.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Store:</span>
                  <span>{order.storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Customer:</span>
                  <span>{order.customerName}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-3 border-b border-dashed border-slate-400">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600 text-left">
                      <th className="pb-1 font-semibold">Item</th>
                      <th className="pb-1 text-center font-semibold">Qty</th>
                      <th className="pb-1 text-right font-semibold">Price</th>
                      <th className="pb-1 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-1 pr-1">
                          <p className="font-medium text-slate-900 leading-tight">{item.name}</p>
                          <p className="text-[10px] text-slate-500">{item.barcode}</p>
                        </td>
                        <td className="py-1 text-center text-slate-700">{item.quantity}</td>
                        <td className="py-1 text-right tabular-nums text-slate-700">
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-1 text-right tabular-nums font-semibold text-slate-900">
                          {item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Calculation */}
              <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="tabular-nums font-mono">
                    {formatCurrency(order.subtotal, settings.currency)}
                  </span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="tabular-nums font-mono">
                      -{formatCurrency(order.discountTotal, settings.currency)}
                    </span>
                  </div>
                )}
                {settings.showTaxOnReceipt && (
                  <div className="flex justify-between text-slate-600">
                    <span>VAT / Tax ({(settings.taxRate * 100).toFixed(0)}%):</span>
                    <span className="tabular-nums font-mono">
                      {formatCurrency(order.taxTotal, settings.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-1 border-t border-slate-800 text-black">
                  <span>TOTAL:</span>
                  <span className="tabular-nums font-mono">
                    {formatCurrency(order.total, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="py-2.5 text-[11px] border-b border-dashed border-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Mode:</span>
                  <span className="font-semibold uppercase">{order.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount Tendered:</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.amountPaid, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Change Returned:</span>
                  <span className="tabular-nums font-bold">
                    {formatCurrency(order.changeAmount, settings.currency)}
                  </span>
                </div>
                {order.paymentDetails?.cardLast4 && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Card Number:</span>
                    <span>**** **** **** {order.paymentDetails.cardLast4}</span>
                  </div>
                )}
                {order.paymentDetails?.mobileTransactionId && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>M-Pesa / Mobile Txn:</span>
                    <span>{order.paymentDetails.mobileTransactionId}</span>
                  </div>
                )}
              </div>

              {/* Barcode & Footer Note */}
              <div className="pt-4 text-center space-y-2">
                {settings.showBarcodeOnReceipt && (
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-44 bg-slate-900 flex items-center justify-center p-1 rounded">
                      {/* Barcode simulation bars */}
                      <div className="flex h-full w-full items-center justify-between gap-0.5 bg-white px-2">
                        {Array.from({ length: 32 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-full ${i % 3 === 0 ? 'w-1 bg-black' : i % 5 === 0 ? 'w-1.5 bg-black' : 'w-0.5 bg-black'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] tracking-widest text-slate-600 mt-1">
                      {order.invoiceNumber}
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 whitespace-pre-line leading-tight">
                  {settings.receiptFooter}
                </p>
                <p className="text-[9px] text-slate-400">--- Powered by AuraPOS Enterprise ---</p>
              </div>
            </div>
          ) : (
            /* A4 Full Corporate Tax Invoice View */
            <div className="print-container w-full max-w-xl bg-white text-slate-900 p-8 rounded-lg shadow-lg font-sans text-xs select-text">
              {/* Corporate Invoice Header */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {settings.businessName}
                  </h1>
                  <p className="text-slate-500 text-xs mt-0.5">{settings.tradingName}</p>
                  <p className="text-slate-500 text-xs mt-1">{settings.address}</p>
                  <p className="text-slate-500 text-xs">
                    Tel: {settings.phone} · Email: {settings.email}
                  </p>
                  <p className="text-slate-500 text-xs">Tax Registration: {settings.taxId}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded text-xs uppercase tracking-wider mb-2">
                    Official Tax Invoice
                  </span>
                  <p className="text-slate-900 font-bold text-sm">#{order.invoiceNumber}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Date: {formattedDate}</p>
                  <p className="text-slate-500 text-xs">Branch: {order.storeName}</p>
                </div>
              </div>

              {/* Bill To & Cashier Meta */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Customer Details
                  </p>
                  <p className="font-semibold text-slate-900 mt-0.5">{order.customerName}</p>
                  <p className="text-slate-500 text-xs">Payment Method: {order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Issued By
                  </p>
                  <p className="font-semibold text-slate-900 mt-0.5">{order.cashierName}</p>
                  <p className="text-slate-500 text-xs">Status: Paid & Verified</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-600 uppercase">
                      <th className="pb-2">Description</th>
                      <th className="pb-2">SKU / Barcode</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="text-xs">
                        <td className="py-2.5 font-medium text-slate-900">{item.name}</td>
                        <td className="py-2.5 font-mono text-[11px] text-slate-500">{item.barcode}</td>
                        <td className="py-2.5 text-center text-slate-700">{item.quantity}</td>
                        <td className="py-2.5 text-right font-mono text-slate-700">
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                          {item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subtotal & Tax Breakdown */}
              <div className="border-t border-slate-200 pt-3 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(order.subtotal, settings.currency)}</span>
                  </div>
                  {order.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span className="font-mono">-{formatCurrency(order.discountTotal, settings.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>VAT / Tax ({(settings.taxRate * 100).toFixed(0)}%)</span>
                    <span className="font-mono">{formatCurrency(order.taxTotal, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                    <span>Grand Total</span>
                    <span className="font-mono text-emerald-700">
                      {formatCurrency(order.total, settings.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Amount Paid</span>
                    <span className="font-mono">{formatCurrency(order.amountPaid, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Change</span>
                    <span className="font-mono">{formatCurrency(order.changeAmount, settings.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Signature / Notes */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-400">
                <div>
                  <p className="font-semibold text-slate-700 text-xs">Terms & Conditions</p>
                  <p className="mt-0.5">{settings.receiptFooter}</p>
                </div>
                <div className="text-center w-40 border-t border-slate-400 pt-1">
                  <p className="text-slate-600 font-medium text-xs">Authorized Signature</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions (Hidden when printing) */}
        <div className="no-print px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Format: {paperFormat === '80mm' ? '80mm Thermal Receipt' : 'A4 Tax Invoice'}
          </span>
          <div className="flex gap-2">
            {onNewSale && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewSale();
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                Start New Sale
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
