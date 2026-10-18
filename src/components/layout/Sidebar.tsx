import React from 'react';
import {
  ShoppingCart,
  Package,
  Clock,
  FileText,
  Layers,
  Truck,
  Building2,
  Tag,
  UserCheck,
  Briefcase,
  Users,
  TrendingUp,
  Sliders,
  User,
  ShieldCheck,
  X,
  ChevronRight,
} from 'lucide-react';
import { ViewModule, Role } from '../../types/pos';

interface SidebarProps {
  currentModule: ViewModule;
  onSelectModule: (module: ViewModule) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpen,
  onClose,
  userRole,
}) => {
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager' || isAdmin;

  interface NavItem {
    id: ViewModule;
    label: string;
    icon: React.ElementType;
    requiresAdmin?: boolean;
    requiresManager?: boolean;
    badge?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [
    {
      title: 'Sales Operations',
      items: [
        { id: 'pos', label: 'POS Terminal (Sales)', icon: ShoppingCart },
        { id: 'orders', label: 'Order List & Receipts', icon: FileText },
      ],
    },
    {
      title: 'Inventory & Catalog',
      items: [
        { id: 'products', label: 'Products Management', icon: Package },
        { id: 'expiration', label: 'Expiration Monitor', icon: Clock, badge: 'Alerts' },
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'suppliers', label: 'Supplier Vendors', icon: Truck },
        { id: 'stores', label: 'Store Branches', icon: Building2 },
      ],
    },
    {
      title: 'CRM & Promotions',
      items: [
        { id: 'discounts', label: 'Discounts & Codes', icon: Tag },
        { id: 'customers', label: 'Customer Accounts', icon: UserCheck },
      ],
    },
    {
      title: 'Management & Staff',
      items: [
        { id: 'employees', label: 'Employee Shifts', icon: Briefcase },
        { id: 'users', label: 'Staff Users (CRUD)', icon: Users, requiresAdmin: true, badge: 'Admin' },
        { id: 'reports', label: 'Reporting & Analytics', icon: TrendingUp },
      ],
    },
    {
      title: 'System & License',
      items: [
        { id: 'system-settings', label: 'System & Currency', icon: Sliders, requiresManager: true },
        { id: 'my-account', label: 'My Account Settings', icon: User },
        { id: 'activation', label: 'System Activation', icon: ShieldCheck, badge: 'Lifetime' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`no-print fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out shadow-[2px_0_12px_rgba(0,0,0,0.02)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between p-4 border-b border-slate-100 bg-white">
          <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            AuraPOS Navigation
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sections.map((sec, secIdx) => {
            const visibleItems = sec.items.filter((item) => {
              if (item.requiresAdmin && !isAdmin) return false;
              if (item.requiresManager && !isManager) return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={secIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {sec.title}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentModule === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectModule(item.id);
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 bg-white text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-mono font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            AuraPOS v2.6 · Single-Device Lock Active
          </div>
        </div>
      </aside>
    </>
  );
};
