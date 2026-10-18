/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User as AuthUser,
  Store,
  Category,
  Supplier,
  Product,
  Customer,
  Discount,
  Order,
  SystemSettings,
  ViewModule,
} from './types/pos';
import { Storage } from './utils/storage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PosTerminal } from './components/pos/PosTerminal';
import { OrderList } from './components/orders/OrderList';
import { ProductManagement } from './components/products/ProductManagement';
import { ExpirationManager } from './components/products/ExpirationManager';
import { DiscountManagement } from './components/discounts/DiscountManagement';
import { CustomerManagement } from './components/customers/CustomerManagement';
import { SupplierManagement } from './components/suppliers/SupplierManagement';
import { StoreManagement } from './components/stores/StoreManagement';
import { CategoryManagement } from './components/categories/CategoryManagement';
import { EmployeeManagement } from './components/employees/EmployeeManagement';
import { UserManagement } from './components/users/UserManagement';
import { AnalyticsDashboard } from './components/reports/AnalyticsDashboard';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { MyAccountView } from './components/settings/MyAccountView';
import { ActivationView } from './components/settings/ActivationView';
import { LoginModal } from './components/auth/LoginModal';

export default function App() {
  // Load state from local storage or defaults
  const [users, setUsers] = useState<AuthUser[]>(() => Storage.getUsers());
  const [stores, setStores] = useState<Store[]>(() => Storage.getStores());
  const [categories, setCategories] = useState<Category[]>(() => Storage.getCategories());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => Storage.getSuppliers());
  const [products, setProducts] = useState<Product[]>(() => Storage.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(() => Storage.getCustomers());
  const [discounts, setDiscounts] = useState<Discount[]>(() => Storage.getDiscounts());
  const [orders, setOrders] = useState<Order[]>(() => Storage.getOrders());
  const [settings, setSettings] = useState<SystemSettings>(() => Storage.getSettings());

  // Active User & Active Store
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const existing = Storage.getCurrentUser();
    if (existing) return existing;
    // Default to admin for immediate exploration
    const defaultAdmin = Storage.getUsers()[0];
    Storage.setCurrentUser(defaultAdmin);
    Storage.registerUserSession(defaultAdmin.id, Storage.getCurrentSessionId(), 'Primary Terminal');
    return defaultAdmin;
  });

  const [currentStore, setCurrentStore] = useState<Store>(() => {
    return stores.find((s) => s.isMain) || stores[0];
  });

  // Navigation & UI States
  const [currentModule, setCurrentModule] = useState<ViewModule>('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  // Sync to storage on state changes
  const handleUpdateUsers = (newUsers: AuthUser[]) => {
    setUsers(newUsers);
    Storage.saveUsers(newUsers);
    // If current user was updated, sync
    if (currentUser) {
      const updatedCurrent = newUsers.find((u) => u.id === currentUser.id);
      if (updatedCurrent) {
        setCurrentUser(updatedCurrent);
        Storage.setCurrentUser(updatedCurrent);
      }
    }
  };

  const handleUpdateStores = (newStores: Store[]) => {
    setStores(newStores);
    Storage.saveStores(newStores);
    if (!newStores.some((s) => s.id === currentStore.id)) {
      setCurrentStore(newStores[0]);
    }
  };

  const handleUpdateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    Storage.saveCategories(newCategories);
  };

  const handleUpdateSuppliers = (newSuppliers: Supplier[]) => {
    setSuppliers(newSuppliers);
    Storage.saveSuppliers(newSuppliers);
  };

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    Storage.saveProducts(newProducts);
  };

  const handleUpdateCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    Storage.saveCustomers(newCustomers);
  };

  const handleUpdateDiscounts = (newDiscounts: Discount[]) => {
    setDiscounts(newDiscounts);
    Storage.saveDiscounts(newDiscounts);
  };

  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    Storage.saveOrders(newOrders);
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    Storage.saveSettings(newSettings);
  };

  const handleRecordSale = (newOrder: Order, updatedProducts: Product[]) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    Storage.saveOrders(updatedOrders);

    setProducts(updatedProducts);
    Storage.saveProducts(updatedProducts);

    // Update customer loyalty points & total spent if applicable
    if (newOrder.customerId) {
      const updatedCustomers = customers.map((c) => {
        if (c.id === newOrder.customerId) {
          const bonusPoints = Math.floor(newOrder.total);
          return {
            ...c,
            loyaltyPoints: c.loyaltyPoints + bonusPoints,
            totalSpent: c.totalSpent + newOrder.total,
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
      Storage.saveCustomers(updatedCustomers);
    }
  };

  const handleApplyClearance = (prod: Product, discountPercent: number) => {
    const newPrice = Number((prod.sellingPrice * (1 - discountPercent / 100)).toFixed(2));
    const updated = products.map((p) =>
      p.id === prod.id
        ? {
            ...p,
            sellingPrice: newPrice,
            description: `${p.description || ''} [${discountPercent}% Off Clearance Markdown]`.trim(),
          }
        : p
    );
    handleUpdateProducts(updated);
    showToast(`Marked down "${prod.name}" to ${settings.currency.symbol}${newPrice.toFixed(2)} (-${discountPercent}%)`);
  };

  const handleLogout = () => {
    if (currentUser) {
      Storage.terminateUserSession(currentUser.id);
    }
    Storage.setCurrentUser(null);
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
  };

  // Guard against non-admin visiting users tab
  useEffect(() => {
    if (currentModule === 'users' && currentUser?.role !== 'admin') {
      setCurrentModule('pos');
    }
  }, [currentModule, currentUser]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Bar with Hamburger Toggle */}
      {currentUser && (
        <Navbar
          currentUser={currentUser}
          stores={stores}
          currentStore={currentStore}
          onSelectStore={(st) => setCurrentStore(st)}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onLogout={handleLogout}
          onNavigateToAccount={() => setCurrentModule('my-account')}
        />
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Responsive Hamburger Sidebar */}
        {currentUser && (
          <Sidebar
            currentModule={currentModule}
            onSelectModule={(mod) => setCurrentModule(mod)}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            userRole={currentUser.role}
          />
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white">
          {currentUser && currentModule === 'pos' && (
            <PosTerminal
              products={products}
              categories={categories}
              customers={customers}
              discounts={discounts}
              settings={settings}
              currentStore={currentStore}
              currentUser={currentUser}
              onRecordSale={handleRecordSale}
              onAddNewCustomer={(newC) => handleUpdateCustomers([...customers, newC])}
            />
          )}

          {currentUser && currentModule === 'orders' && (
            <OrderList
              orders={orders}
              settings={settings}
              stores={stores}
              users={users}
              onUpdateOrders={handleUpdateOrders}
            />
          )}

          {currentUser && currentModule === 'products' && (
            <ProductManagement
              products={products}
              categories={categories}
              stores={stores}
              suppliers={suppliers}
              settings={settings}
              onUpdateProducts={handleUpdateProducts}
              onNavigateToExpiration={() => setCurrentModule('expiration')}
            />
          )}

          {currentUser && currentModule === 'expiration' && (
            <ExpirationManager
              products={products}
              settings={settings}
              onUpdateProduct={(up) =>
                handleUpdateProducts(products.map((p) => (p.id === up.id ? up : p)))
              }
              onApplyClearance={handleApplyClearance}
            />
          )}

          {currentUser && currentModule === 'discounts' && (
            <DiscountManagement
              discounts={discounts}
              settings={settings}
              onUpdateDiscounts={handleUpdateDiscounts}
            />
          )}

          {currentUser && currentModule === 'customers' && (
            <CustomerManagement
              customers={customers}
              settings={settings}
              onUpdateCustomers={handleUpdateCustomers}
            />
          )}

          {currentUser && currentModule === 'suppliers' && (
            <SupplierManagement
              suppliers={suppliers}
              onUpdateSuppliers={handleUpdateSuppliers}
            />
          )}

          {currentUser && currentModule === 'stores' && (
            <StoreManagement
              stores={stores}
              onUpdateStores={handleUpdateStores}
            />
          )}

          {currentUser && currentModule === 'categories' && (
            <CategoryManagement
              categories={categories}
              products={products}
              onUpdateCategories={handleUpdateCategories}
            />
          )}

          {currentUser && currentModule === 'employees' && (
            <EmployeeManagement
              users={users}
              orders={orders}
              settings={settings}
            />
          )}

          {currentUser && currentModule === 'users' && (
            <UserManagement
              users={users}
              stores={stores}
              currentUser={currentUser}
              onUpdateUsers={handleUpdateUsers}
            />
          )}

          {currentUser && currentModule === 'reports' && (
            <AnalyticsDashboard
              orders={orders}
              products={products}
              categories={categories}
              settings={settings}
            />
          )}

          {currentUser && currentModule === 'system-settings' && (
            <SystemSettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentUser && currentModule === 'my-account' && (
            <MyAccountView
              currentUser={currentUser}
              onUpdateCurrentUser={(up) => {
                setCurrentUser(up);
                handleUpdateUsers(users.map((u) => (u.id === up.id ? up : u)));
              }}
              onLogout={handleLogout}
            />
          )}

          {currentUser && currentModule === 'activation' && (
            <ActivationView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            &times;
          </button>
        </div>
      )}

      {/* Authentication Modal */}
      <LoginModal
        isOpen={!currentUser || isLoginModalOpen}
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
