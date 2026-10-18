import React, { useState } from 'react';
import { ShieldCheck, Key, CheckCircle, Award, Sparkles, Building2, Calendar, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SystemSettings } from '../../types/pos';

interface ActivationViewProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
}

export const ActivationView: React.FC<ActivationViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [holderInput, setHolderInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const activation = settings.oneTimeActivation;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) return;

    if (licenseKeyInput.length < 10) {
      setFeedback('Invalid license key format. Expected format: AURA-ENT-XXXX-XXXX-XXXX.');
      return;
    }

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    const updatedSettings: SystemSettings = {
      ...settings,
      oneTimeActivation: {
        isActivated: true,
        licenseKey: licenseKeyInput.trim().toUpperCase(),
        activatedAt: new Date().toISOString(),
        tier: 'Enterprise Unlimited Lifetime Tier',
        licenseHolder: holderInput.trim() || settings.businessName,
      },
    };

    onUpdateSettings(updatedSettings);
    setFeedback('System successfully activated with lifetime enterprise privileges!');
    setLicenseKeyInput('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>One-Time System License & Activation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verify digital product key and check lifetime software licensing entitlement
          </p>
        </div>
      </div>

      {/* Activation Status Banner */}
      <div className="p-6 bg-white border border-emerald-500/40 rounded-3xl shadow-[0_4px_20px_rgba(16,185,129,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Award className="w-48 h-48 text-emerald-600" />
        </div>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200 shadow-xs">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-extrabold">
              PERPETUAL ENTERPRISE LICENSE
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">System Fully Activated & Registered</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-600 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          <div>
            <p className="text-slate-400 font-semibold text-[11px]">Licensed Entity / Holder</p>
            <p className="font-bold text-slate-900 mt-0.5 text-sm">{activation.licenseHolder}</p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold text-[11px]">Subscription Tier</p>
            <p className="font-bold text-emerald-700 mt-0.5 text-sm">{activation.tier}</p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold text-[11px]">Active License Key</p>
            <p className="font-mono text-slate-800 mt-0.5 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block font-bold">
              {activation.licenseKey}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold text-[11px]">Activation Date</p>
            <p className="font-mono text-slate-800 mt-0.5 text-xs font-semibold">
              {new Date(activation.activatedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Offline Registers
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Multi-Store Branches Enabled
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Barcode Hardware Wedge Support
          </span>
        </div>
      </div>

      {/* Re-enter / Update License Key Form */}
      <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-600" />
          <span>Apply New Enterprise Activation Key</span>
        </h4>
        <p className="text-xs text-slate-400">
          If you have purchased an upgraded multi-location license or need to re-bind system entitlement:
        </p>

        <form onSubmit={handleActivate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={holderInput}
                onChange={(e) => setHolderInput(e.target.value)}
                placeholder="e.g. Aura Retail Holdings"
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">25-Character Product Key *</label>
              <input
                type="text"
                required
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                placeholder="AURA-ENT-XXXX-XXXX-XXXX"
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {feedback && (
            <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              {feedback}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
            >
              Verify & Activate Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
