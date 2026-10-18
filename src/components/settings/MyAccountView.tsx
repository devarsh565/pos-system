import React, { useState } from 'react';
import { User, KeyRound, Smartphone, LogOut, Check, ShieldCheck, Mail, Phone } from 'lucide-react';
import { User as AuthUser } from '../../types/pos';
import { Storage } from '../../utils/storage';

interface MyAccountViewProps {
  currentUser: AuthUser;
  onUpdateCurrentUser: (updatedUser: AuthUser) => void;
  onLogout: () => void;
}

export const MyAccountView: React.FC<MyAccountViewProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onLogout,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const [savedMsg, setSavedMsg] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: AuthUser = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatarUrl,
      password: newPassword.trim() ? newPassword.trim() : currentUser.password,
    };

    onUpdateCurrentUser(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const handleTerminateOtherSessions = () => {
    const currentSessionId = Storage.getCurrentSessionId();
    Storage.registerUserSession(currentUser.id, currentSessionId, 'Current Active Terminal');
    showNotice('All other device sessions have been invalidated. Only this terminal is active.');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <User className="w-5 h-5" />
            </div>
            <span>User Update Own Account & Security</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Update personal operator details, credentials, and manage single-device session lock
          </p>
        </div>

        {savedMsg && (
          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile Updated Successfully!</span>
          </div>
        )}
      </div>

      {notice && (
        <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-700 ml-2">
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-sm"
            />
            <div>
              <p className="text-xs font-bold text-slate-700">Choose Profile Avatar</p>
              <div className="flex items-center gap-2 mt-2">
                {sampleAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === url ? 'border-emerald-600 scale-110 shadow-xs' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Assigned Role</label>
              <input
                type="text"
                disabled
                value={currentUser.role.toUpperCase()}
                className="w-full px-3 py-2 text-xs font-bold uppercase bg-slate-100 border border-slate-200 rounded-xl text-emerald-800 opacity-80 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Password Security */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Security & Password</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep unchanged"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Role Security Clearance</label>
              <p className="text-xs text-slate-600 pt-2 font-mono font-medium">
                {currentUser.role === 'admin' ? 'Level 3 - Root Administrator' : 'Level 1 - Front Counter Terminal'}
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Device Security Protection */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Device Session Single-Lock</h3>
            </div>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">ENFORCED</span>
          </div>

          <p className="text-xs text-slate-400">
            To prevent fraud and maintain accounting integrity, AuraPOS restricts concurrent logins to exactly one device at a time.
          </p>

          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-800">Current Device: Authorized Browser Session</p>
              <p className="text-[10px] text-slate-400 font-mono">
                Session ID: {Storage.getCurrentSessionId().slice(0, 16)}...
              </p>
            </div>
            <button
              type="button"
              onClick={handleTerminateOtherSessions}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/80 transition-colors shadow-xs cursor-pointer"
            >
              Log Out All Other Devices
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Current User</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
};
