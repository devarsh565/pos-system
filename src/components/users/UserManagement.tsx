import React, { useState } from 'react';
import {
  Users,
  Plus,
  Shield,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  X,
  Check,
  Lock,
  Smartphone,
  RotateCcw,
} from 'lucide-react';
import { User, Role, Store } from '../../types/pos';
import { Storage } from '../../utils/storage';

interface UserManagementProps {
  users: User[];
  stores: Store[];
  currentUser: User;
  onUpdateUsers: (users: User[]) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  stores,
  currentUser,
  onUpdateUsers,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('cashier');
  const [status, setStatus] = useState<'active' | 'disabled'>('active');
  const [phone, setPhone] = useState('');
  const [storeId, setStoreId] = useState(stores[0]?.id || 'store-1');

  const openAddUser = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('secret123');
    setRole('cashier');
    setStatus('active');
    setPhone('+1 (555) 000-0000');
    setStoreId(stores[0]?.id || 'store-1');
    setIsFormOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password || '');
    setRole(user.role);
    setStatus(user.status);
    setPhone(user.phone);
    setStoreId(user.storeId || stores[0]?.id || 'store-1');
    setIsFormOpen(true);
  };

  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showNotice = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotice({ text, type });
    setTimeout(() => {
      setNotice((cur) => (cur?.text === text ? null : cur));
    }, 3500);
  };

  const handleToggleStatus = (targetUser: User) => {
    if (targetUser.id === currentUser.id) {
      showNotice('You cannot disable your own active administrator account.', 'error');
      return;
    }

    const newStatus: 'active' | 'disabled' = targetUser.status === 'active' ? 'disabled' : 'active';
    const updated = users.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u));
    onUpdateUsers(updated);
    showNotice(`Account "${targetUser.name}" has been ${newStatus}.`, 'success');
  };

  const handleResetDeviceSession = (userId: string) => {
    Storage.terminateUserSession(userId);
    showNotice('Active multi-device session lock cleared. User can now sign in on any terminal.', 'success');
  };

  const handleDeleteUser = (targetUser: User) => {
    if (targetUser.id === currentUser.id) {
      showNotice('Cannot delete your own currently signed-in account.', 'error');
      return;
    }
    onUpdateUsers(users.filter((u) => u.id !== targetUser.id));
    setDeleteConfirmId(null);
    showNotice(`User "${targetUser.name}" has been removed.`, 'info');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const userData: User = {
      id: editingUser ? editingUser.id : 'user-' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password || 'pass123',
      role,
      status,
      phone: phone.trim(),
      avatar: editingUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      storeId,
      lastLogin: editingUser?.lastLogin || new Date().toISOString(),
    };

    if (editingUser) {
      onUpdateUsers(users.map((u) => (u.id === editingUser.id ? userData : u)));
      showNotice(`Updated details for "${userData.name}".`, 'success');
    } else {
      onUpdateUsers([userData, ...users]);
      showNotice(`Added new staff member "${userData.name}".`, 'success');
    }

    setIsFormOpen(false);
  };

  const activeSessions = Storage.getActiveSessions();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <span>Staff & User Access Control (Administrator Panel)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Add team members, assign Cashier / Manager / Administrator roles, and prevent multi-device logins
          </p>
        </div>

        <button
          type="button"
          onClick={openAddUser}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between border animate-in fade-in ${
            notice.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-50 text-slate-800 border-slate-200'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-700 ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3.5">User Profile</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Store Branch</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Active Session Lock</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => {
                const store = stores.find((s) => s.id === u.storeId);
                const session = activeSessions[u.id];
                const isSessionActive = Boolean(session && Date.now() - session.lastActive < 10 * 60 * 1000);

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{u.name}</span>
                            {u.id === currentUser.id && (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">(You)</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'manager'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{store?.name || 'All Stores'}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                            u.status === 'active'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-rose-700 bg-rose-50 border-rose-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {u.status === 'active' ? 'Active' : 'Disabled'}
                        </span>

                        {/* Enable/Disable Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 text-[10px] rounded-lg font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {isSessionActive ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 font-mono font-semibold">
                            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                            {session?.deviceName || 'Active Terminal'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleResetDeviceSession(u.id)}
                            className="p-1 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Reset multi-device session lock"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">No active device lock</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditUser(u)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser.id && (
                          deleteConfirmId === u.id ? (
                            <div className="flex items-center gap-1 animate-in fade-in duration-150">
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(u.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Edit User Profile' : 'Add New User Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Green"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@aurapos.io"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Password</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  >
                    <option value="cashier">Cashier (POS & Sales)</option>
                    <option value="manager">Manager (Store Oversight)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'disabled')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  >
                    <option value="active">Active (Can Login)</option>
                    <option value="disabled">Disabled (Login Blocked)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Assigned Store Branch</label>
                  <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
