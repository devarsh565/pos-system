import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { Category, Product } from '../../types/pos';

interface CategoryManagementProps {
  categories: Category[];
  products: Product[];
  onUpdateCategories: (categories: Category[]) => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  products,
  onUpdateCategories,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('emerald');
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  const colorOptions = [
    { label: 'Emerald Green', value: 'emerald' },
    { label: 'Amber Gold', value: 'amber' },
    { label: 'Sapphire Blue', value: 'blue' },
    { label: 'Sunset Orange', value: 'orange' },
    { label: 'Rose Pink', value: 'rose' },
    { label: 'Indigo Violet', value: 'indigo' },
  ];

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    setCode('CAT-' + Math.floor(10 + Math.random() * 90));
    setColor('emerald');
    setIsFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setCode(cat.code);
    setColor(cat.color);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const hasProducts = products.some((p) => p.categoryId === id);
    if (hasProducts) {
      showNotice('Cannot delete category with active products assigned. Reassign products first.');
      return;
    }
    onUpdateCategories(categories.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
    showNotice('Category removed successfully.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Category = {
      id: editingCategory ? editingCategory.id : 'cat-' + Date.now(),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      color,
      icon: 'Package',
    };

    if (editingCategory) {
      onUpdateCategories(categories.map((c) => (c.id === editingCategory.id ? data : c)));
      showNotice(`Updated category "${data.name}".`);
    } else {
      onUpdateCategories([...categories, data]);
      showNotice(`Created category "${data.name}".`);
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
              <Layers className="w-5 h-5" />
            </div>
            <span>Category Management (Taxonomy)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize catalog groupings, category codes, and visual color cues for POS terminal
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
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

      {/* Grid of categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <div
              key={c.id}
              className="p-5 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-50 text-slate-700 font-bold border border-slate-200/80">
                    {c.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {count} products
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-2">{c.name}</h3>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-200/60 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                {deleteConfirmId === c.id ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
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
                    onClick={() => setDeleteConfirmId(c.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-200/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dairy & Frozen"
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Taxonomy Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. DRY"
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Color Theme</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                >
                  {colorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
