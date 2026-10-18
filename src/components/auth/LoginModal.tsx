import React, { useState } from 'react';
import { Shield, Lock, Mail, Smartphone, AlertTriangle, ArrowRight, UserCheck, Check } from 'lucide-react';
import { User } from '../../types/pos';
import { Storage } from '../../utils/storage';

interface LoginModalProps {
  isOpen: boolean;
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  users,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Multi-Device Conflict State
  const [sessionConflictUser, setSessionConflictUser] = useState<User | null>(null);
  const [conflictDevice, setConflictDevice] = useState<string>('Active Terminal');

  if (!isOpen) return null;

  const currentSessionId = Storage.getCurrentSessionId();

  const handleAttemptLogin = (targetUser: User, passToCheck: string) => {
    setErrorMsg(null);

    // 1. Check account disabled status
    if (targetUser.status === 'disabled') {
      setErrorMsg('This account has been disabled by the Administrator. Access denied.');
      return;
    }

    // 2. Validate password
    if (targetUser.password && targetUser.password !== passToCheck) {
      setErrorMsg('Invalid email or password credentials. Please try again.');
      return;
    }

    // 3. Check multi-device concurrency restriction
    const check = Storage.checkUserActiveSession(targetUser.id, currentSessionId);
    if (check.isConflict) {
      setSessionConflictUser(targetUser);
      setConflictDevice(check.activeDevice || 'Terminal 01 - Front Desk');
      return;
    }

    // Success: register session and log in
    Storage.registerUserSession(targetUser.id, currentSessionId, 'Current Active Terminal');
    Storage.setCurrentUser(targetUser);
    onLoginSuccess(targetUser);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setErrorMsg('No user registered with this email address.');
      return;
    }
    handleAttemptLogin(user, password);
  };

  const handleForceSessionTakeover = () => {
    if (!sessionConflictUser) return;
    Storage.registerUserSession(sessionConflictUser.id, currentSessionId, 'Current Active Terminal (Takeover)');
    Storage.setCurrentUser(sessionConflictUser);
    onLoginSuccess(sessionConflictUser);
    setSessionConflictUser(null);
  };

  const quickLoginAs = (role: 'admin' | 'cashier' | 'manager') => {
    const user = users.find((u) => u.role === role && u.status === 'active');
    if (user) {
      setEmail(user.email);
      setPassword(user.password || '');
      handleAttemptLogin(user, user.password || '');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl mb-1 shadow-md shadow-emerald-500/25">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">AuraPOS Enterprise</h2>
          <p className="text-xs text-slate-400">
            Secure Terminal Access · Single-Device Enforced
          </p>
        </div>

        {/* Multi-Device Conflict Alert Dialog */}
        {sessionConflictUser ? (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>Multi-Device Lock Conflict Detected</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Account <strong className="text-slate-900">{sessionConflictUser.name}</strong> is currently active on:{' '}
              <span className="font-mono text-amber-800 font-semibold">{conflictDevice}</span>.
            </p>
            <p className="text-[11px] text-slate-500">
              Company policy prohibits concurrent multi-device logins to prevent cash drawer fraud and out-of-sync receipts.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSessionConflictUser(null)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs hover:bg-slate-100 transition-colors font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleForceSessionTakeover}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>Take Over Session</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aurapos.io"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Terminal Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-mono transition-all"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Authenticate & Open Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Switcher Buttons */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <p className="text-[11px] text-slate-400 font-bold text-center">
            Instant Demo Logins (Click to switch role):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLoginAs('admin')}
              className="p-2.5 bg-white hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 rounded-2xl text-center transition-all group cursor-pointer shadow-xs hover:shadow-sm"
            >
              <p className="text-xs font-extrabold text-purple-700 group-hover:text-purple-800">Admin</p>
              <p className="text-[10px] text-slate-400 font-medium">Full Access</p>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs('cashier')}
              className="p-2.5 bg-white hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-center transition-all group cursor-pointer shadow-xs hover:shadow-sm"
            >
              <p className="text-xs font-extrabold text-emerald-700 group-hover:text-emerald-800">Cashier</p>
              <p className="text-[10px] text-slate-400 font-medium">POS Sales</p>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs('manager')}
              className="p-2.5 bg-white hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-300 rounded-2xl text-center transition-all group cursor-pointer shadow-xs hover:shadow-sm"
            >
              <p className="text-xs font-extrabold text-sky-700 group-hover:text-sky-800">Manager</p>
              <p className="text-[10px] text-slate-400 font-medium">Store Ops</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
