import React, { useState } from 'react';
import { Store as StoreIcon, Plus, Edit2, Trash2, X, Check, MapPin, Phone, Mail, Building } from 'lucide-react';
import { Store } from '../../types/pos';

interface StoreManagementProps {
  stores: Store[];
  onUpdateStores: (stores: Store[]) => void;
}

export const StoreManagement: React.FC<StoreManagementProps> = ({
  stores,
  onUpdateStores,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  const openAdd = () => {
    setEditingStore(null);
    setName('');
    setCode('BR-' + Math.floor(10 + Math.random() * 90));
    setAddress('');
    setPhone('');
    setEmail('');
    setTaxNumber('TX-9482019-Z');
    setIsMain(false);
    setIsFormOpen(true);
  };

  const openEdit = (s: Store) => {
    setEditingStore(s);
    setName(s.name);
    setCode(s.code);
    setAddress(s.address);
    setPhone(s.phone);
    setEmail(s.email);
    setTaxNumber(s.taxNumber);
    setIsMain(s.isMain);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (stores.length <= 1) {
      showNotice('Cannot delete the sole remaining store location.');
      return;
    }
    onUpdateStores(stores.filter((s) => s.id !== id));
    setDeleteConfirmId(null);
    showNotice('Store location removed.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updatedStores = [...stores];

    if (isMain) {
      updatedStores = updatedStores.map((s) => ({ ...s, isMain: false }));
    }

    const data: Store = {
      id: editingStore ? editingStore.id : 'store-' + Date.now(),
      name: name.trim(),
      code: code.trim(),
      address: address.trim(),
      phone: phone.trim() || 'N/A',
      email: email.trim() || 'N/A',
      taxNumber: taxNumber.trim(),
      isMain,
    };

    if (editingStore) {
      onUpdateStores(updatedStores.map((s) => (s.id === editingStore.id ? data : s)));
      showNotice(`Updated store "${data.name}".`);
    } else {
      onUpdateStores([...updatedStores, data]);
      showNotice(`Created store "${data.name}".`);
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
              <Building className="w-5 h-5" />
            </div>
            <span>Store & Multi-Branch Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure retail branch outlets, tax credentials, and headquarters flagship designation
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store</span>
        </button>
      </div>

      {notice && (
        <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-700 ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Grid of Stores */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stores.map((s) => (
          <div
            key={s.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              s.isMain
                ? 'bg-white border-emerald-500/40 shadow-[0_4px_16px_rgba(16,185,129,0.08)]'
                : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-50 text-slate-700 font-bold border border-slate-200/70">
                  {s.code}
                </span>
                {s.isMain && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 uppercase tracking-wider">
                    Flagship HQ
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{s.address}</span>
                </p>
                <p className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{s.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{s.email}</span>
                </p>
                <p className="text-[11px] font-mono text-slate-400 pt-1">Tax PIN: {s.taxNumber}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openEdit(s)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-200/60 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              {!s.isMain && (
                deleteConfirmId === s.id ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(s.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-200/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingStore ? 'Edit Store Location' : 'Register New Branch Location'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Store / Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Uptown Plaza Terminal"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="BR-01"
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Physical Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Suite 400, Market Boulevard, City"
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 789-0123"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="branch@aurapos.io"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tax Registration PIN / VAT ID</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="TX-9482019-Z"
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isMain}
                    onChange={(e) => setIsMain(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Set as Flagship Main Store (Default Terminal HQ)</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Save Store Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
