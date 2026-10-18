import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Award,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { Customer, SystemSettings } from '../../types/pos';
import { formatCurrency } from '../../utils/storage';

interface CustomerManagementProps {
  customers: Customer[];
  settings: SystemSettings;
  onUpdateCustomers: (customers: Customer[]) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  settings,
  onUpdateCustomers,
}) => {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState('0');
  const [creditBalance, setCreditBalance] = useState('0');

  const openAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setLoyaltyPoints('10');
    setCreditBalance('0');
    setIsFormOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address || '');
    setLoyaltyPoints(c.loyaltyPoints.toString());
    setCreditBalance(c.creditBalance.toString());
    setIsFormOpen(true);
  };

  const [notice, setNotice] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  const handleDelete = (id: string) => {
    if (id === 'cust-walkin') {
      showNotice('Default Walk-In Customer cannot be deleted.');
      return;
    }
    onUpdateCustomers(customers.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
    showNotice('Customer profile removed.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Customer = {
      id: editingCustomer ? editingCustomer.id : 'cust-' + Date.now(),
      name: name.trim(),
      phone: phone.trim() || 'N/A',
      email: email.trim() || 'N/A',
      address: address.trim(),
      loyaltyPoints: parseInt(loyaltyPoints, 10) || 0,
      creditBalance: parseFloat(creditBalance) || 0,
      totalSpent: editingCustomer ? editingCustomer.totalSpent : 0,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    if (editingCustomer) {
      onUpdateCustomers(customers.map((c) => (c.id === editingCustomer.id ? data : c)));
      showNotice(`Updated details for "${data.name}".`);
    } else {
      onUpdateCustomers([data, ...customers]);
      showNotice(`Added customer "${data.name}".`);
    }

    setIsFormOpen(false);
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <span>Customer Relationship & Loyalty Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain customer database, loyalty points ledger, credit balance, and sales history
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500 font-semibold">
          Showing <span className="font-extrabold text-slate-900">{filtered.length}</span> registered customers
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Information</th>
                <th className="p-3.5 text-center">Loyalty Points</th>
                <th className="p-3.5 text-right">Credit Balance</th>
                <th className="p-3.5 text-right">Lifetime Spent</th>
                <th className="p-3.5">Member Since</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{c.name}</span>
                      {c.id === 'cust-walkin' && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                          System Walk-In
                        </span>
                      )}
                    </p>
                    {c.address && <p className="text-[11px] text-slate-400 truncate max-w-xs">{c.address}</p>}
                  </td>
                  <td className="p-3.5 space-y-0.5 text-[11px]">
                    <p className="text-slate-800 font-mono font-bold">{c.phone}</p>
                    <p className="text-slate-400">{c.email}</p>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      {c.loyaltyPoints}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-semibold text-slate-700">
                    {formatCurrency(c.creditBalance, settings.currency)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-extrabold text-emerald-700">
                    {formatCurrency(c.totalSpent, settings.currency)}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {c.id !== 'cust-walkin' && (
                        deleteConfirmId === c.id ? (
                          <div className="flex items-center gap-1 animate-in fade-in duration-150">
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id)}
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
                            onClick={() => setDeleteConfirmId(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Loyalty Points</label>
                  <input
                    type="number"
                    value={loyaltyPoints}
                    onChange={(e) => setLoyaltyPoints(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Store Credit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={creditBalance}
                    onChange={(e) => setCreditBalance(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
