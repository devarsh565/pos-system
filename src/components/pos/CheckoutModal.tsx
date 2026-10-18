import React, { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Split, Check, X, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod, SystemSettings, Customer } from '../../types/pos';
import { formatCurrency } from '../../utils/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  selectedCustomer: Customer | null;
  settings: SystemSettings;
  onCompleteSale: (
    method: PaymentMethod,
    amountPaid: number,
    changeAmount: number,
    details?: { cardLast4?: string; mobileTransactionId?: string; splitAmounts?: { cash?: number; card?: number; mobile?: number } }
  ) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  discountTotal,
  taxTotal,
  grandTotal,
  selectedCustomer,
  settings,
  onCompleteSale,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(Math.ceil(grandTotal));
  const [cardLast4, setCardLast4] = useState<string>('4242');
  const [mobileTxn, setMobileTxn] = useState<string>('MP-981240A');
  const [splitCash, setSplitCash] = useState<number>(Math.floor(grandTotal / 2));
  const [splitCard, setSplitCard] = useState<number>(Math.ceil(grandTotal / 2));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const changeDue = Math.max(0, cashTendered - grandTotal);
  const isCashInsufficient = method === 'cash' && cashTendered < grandTotal;
  const isSplitInsufficient = method === 'split' && splitCash + splitCard < grandTotal;

  const quickBills = [10, 20, 50, 100];

  const handleFinish = () => {
    if (isCashInsufficient || isSplitInsufficient) return;

    setIsProcessing(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsProcessing(false);
      let details: any = {};
      let amountPaid = grandTotal;
      let change = 0;

      if (method === 'cash') {
        amountPaid = cashTendered;
        change = changeDue;
      } else if (method === 'card') {
        details = { cardLast4 };
      } else if (method === 'mobile_money') {
        details = { mobileTransactionId: mobileTxn };
      } else if (method === 'split') {
        details = {
          splitAmounts: { cash: splitCash, card: splitCard },
        };
        amountPaid = splitCash + splitCard;
      }

      onCompleteSale(method, amountPaid, change, details);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment & Tender</h3>
            <p className="text-xs text-slate-500">
              Customer: <span className="text-emerald-700 font-bold">{selectedCustomer?.name || 'Walk-In'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Banner */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Amount Payable</p>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
                {formatCurrency(grandTotal, settings.currency)}
              </p>
            </div>
            <div className="text-right text-xs space-y-0.5 text-slate-500 font-mono">
              <p>Subtotal: {formatCurrency(subtotal, settings.currency)}</p>
              {discountTotal > 0 && (
                <p className="text-emerald-700 font-medium">Discount: -{formatCurrency(discountTotal, settings.currency)}</p>
              )}
              {taxTotal > 0 && (
                <p>Tax ({(settings.taxRate * 100).toFixed(0)}%): {formatCurrency(taxTotal, settings.currency)}</p>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Payment Method:
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'cash'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'card'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('mobile_money')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'mobile_money'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('split')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'split'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Split className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Split</span>
              </button>
            </div>
          </div>

          {/* Conditional Mode Inputs */}
          {method === 'cash' && (
            <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Cash Tendered / Received:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">
                    {settings.currency.symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 text-lg font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCashTendered(grandTotal)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-emerald-700 text-xs font-mono font-bold rounded-lg transition-colors border border-slate-200 shadow-xs"
                >
                  Exact ({formatCurrency(grandTotal, settings.currency)})
                </button>
                {quickBills.map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setCashTendered(bill)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-mono font-semibold rounded-lg transition-colors border border-slate-200 shadow-xs"
                  >
                    +${bill}
                  </button>
                ))}
              </div>

              {/* Change Calculation Box */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Change Due to Customer</p>
                  <p className={`text-xl font-bold font-mono ${changeDue > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                    {formatCurrency(changeDue, settings.currency)}
                  </p>
                </div>
                {isCashInsufficient && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Insufficient amount tendered</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <p className="text-xs text-slate-700 font-semibold">EMV Terminal / POS Card Reader</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Card Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Auth Status</label>
                  <div className="px-3 py-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Approved by Pinpad
                  </div>
                </div>
              </div>
            </div>
          )}

          {method === 'mobile_money' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <p className="text-xs text-slate-700 font-semibold">Mobile Money / M-Pesa / QR Transfer</p>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Mobile Transaction Reference #</label>
                <input
                  type="text"
                  value={mobileTxn}
                  onChange={(e) => setMobileTxn(e.target.value)}
                  placeholder="e.g. MPESA-QJ8299A1"
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          )}

          {method === 'split' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <p className="text-xs text-slate-700 font-semibold">Split Tender Configuration</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Cash Portion ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={splitCash}
                    onChange={(e) => setSplitCash(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Card / Digital Portion ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={splitCard}
                    onChange={(e) => setSplitCard(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
              <div className="text-[11px] flex justify-between text-slate-500 pt-1 font-mono font-medium">
                <span>Sum Tendered: ${Number(splitCash + splitCard).toFixed(2)}</span>
                <span className={isSplitInsufficient ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                  Target: ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isCashInsufficient || isSplitInsufficient || isProcessing}
            onClick={handleFinish}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Transaction...' : 'Complete & Generate Receipt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
