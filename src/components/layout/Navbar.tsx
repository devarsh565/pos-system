import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, Store as StoreIcon, LogOut, User, Sparkles, Activity, Clock } from 'lucide-react';
import { User as AuthUser, Store, SystemSettings } from '../../types/pos';

interface NavbarProps {
  currentUser: AuthUser;
  stores: Store[];
  currentStore: Store;
  onSelectStore: (store: Store) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onNavigateToAccount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  stores,
  currentStore,
  onSelectStore,
  isSidebarOpen,
  onToggleSidebar,
  onLogout,
  onNavigateToAccount,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="no-print h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Zone 1: Hamburger Menu Trigger + Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-xl transition-all active:scale-95 border border-slate-100 hover:border-emerald-200"
          aria-label="Toggle Hamburger Menu"
          title="Toggle Navigation Menu"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-emerald-600" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                Aura<span className="text-emerald-600">POS</span>
              </span>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Smart Retail & Inventory</p>
          </div>
        </div>
      </div>

      {/* Zone 2: Live Status & Store Location Selector */}
      <div className="hidden md:flex items-center gap-3">
        {/* Live Terminal Beacon */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/70 border border-emerald-200/50 text-[11px] font-semibold text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono">Live Terminal · Single Session Active</span>
        </div>

        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-[11px] font-mono text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>

        {/* Store Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
          <StoreIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <select
            value={currentStore.id}
            onChange={(e) => {
              const found = stores.find((s) => s.id === e.target.value);
              if (found) onSelectStore(found);
            }}
            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id} className="bg-white text-slate-900 font-sans">
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 3: User Profile & Logout */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onNavigateToAccount}
          className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all text-left group"
          title="View profile and account settings"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-500 transition-all shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
              {currentUser.name}
            </p>
            <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wide font-mono">
              {currentUser.role}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
          title="Sign out of POS Terminal"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
