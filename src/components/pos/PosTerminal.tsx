import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  User,
  Percent,
  Check,
  RotateCcw,
  CreditCard,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  Product,
  Category,
  Customer,
  Discount,
  CartItem,
  Order,
  SystemSettings,
  Store,
  User as AuthUser,
  PaymentMethod,
} from '../../types/pos';
import { formatCurrency } from '../../utils/storage';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { CustomerSelectModal } from './CustomerSelectModal';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';

interface PosTerminalProps {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  discounts: Discount[];
  settings: SystemSettings;
  currentStore: Store;
  currentUser: AuthUser;
  onRecordSale: (order: Order, updatedProducts: Product[]) => void;
  onAddNewCustomer: (customer: Customer) => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  products,
  categories,
  customers,
  discounts,
  settings,
  currentStore,
  currentUser,
  onRecordSale,
  onAddNewCustomer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(
    customers.find((c) => c.id === 'cust-walkin') || customers[0]
  );

  // Discount voucher
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Barcode rapid wedge input ref
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  // Filter products by active category & search query
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchBarcode = p.barcode.toLowerCase().includes(q);
      return matchName || matchSku || matchBarcode;
    }

    return true;
  });

  // Add Product to Cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1, customDiscount: 0 }];
    });
  };

  // Update Cart Item Quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove from Cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Clear Cart
  const clearCart = () => {
    setCart([]);
    setAppliedDiscount(null);
    setVoucherCode('');
    setVoucherError(null);
  };

  // Barcode Scan Handler
  const handleBarcodeScan = (scannedBarcode: string) => {
    const matched = products.find(
      (p) => p.barcode.toLowerCase() === scannedBarcode.toLowerCase() || p.sku.toLowerCase() === scannedBarcode.toLowerCase()
    );
    if (matched) {
      addToCart(matched);
      setSearchQuery('');
    } else {
      alert(`No product registered with barcode: ${scannedBarcode}`);
    }
  };

  // Apply Coupon / Discount Code
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    const found = discounts.find(
      (d) => d.code.toUpperCase() === code && d.isActive
    );

    if (!found) {
      setVoucherError('Invalid or expired discount coupon code.');
      return;
    }

    if (cartSubtotal < found.minSpend) {
      setVoucherError(
        `Minimum spend of ${formatCurrency(found.minSpend, settings.currency)} required.`
      );
      return;
    }

    setAppliedDiscount(found);
    setVoucherError(null);
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => {
    const itemTotal = item.product.sellingPrice * item.quantity - item.customDiscount;
    return sum + Math.max(0, itemTotal);
  }, 0);

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = (cartSubtotal * appliedDiscount.value) / 100;
    } else {
      discountAmount = appliedDiscount.value;
    }
    discountAmount = Math.min(discountAmount, cartSubtotal);
  }

  // Tax calculation
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const taxTotal = settings.showTaxOnReceipt ? taxableAmount * settings.taxRate : 0;
  const grandTotal = taxableAmount + taxTotal;

  // Complete Sale
  const handleCompleteSale = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    changeAmount: number,
    details?: any
  ) => {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderLineItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      barcode: item.product.barcode,
      quantity: item.quantity,
      unitPrice: item.product.sellingPrice,
      costPrice: item.product.costPrice,
      discount: item.customDiscount,
      total: item.product.sellingPrice * item.quantity - item.customDiscount,
    }));

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      invoiceNumber,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      storeId: currentStore.id,
      storeName: currentStore.name,
      items: orderLineItems,
      subtotal: cartSubtotal,
      discountTotal: discountAmount,
      taxTotal,
      total: grandTotal,
      paymentMethod,
      amountPaid,
      changeAmount,
      paymentDetails: details,
      status: 'completed',
    };

    // Decrement stock for inventory management
    const updatedProducts = products.map((p) => {
      const soldItem = cart.find((ci) => ci.product.id === p.id);
      if (soldItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - soldItem.quantity),
        };
      }
      return p;
    });

    onRecordSale(newOrder, updatedProducts);
    setCompletedOrder(newOrder);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);
    clearCart();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-5.5rem)] min-h-[600px] overflow-hidden">
      {/* LEFT: Product Catalog & Fast Sales Grid */}
      <div className="flex-1 flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {/* Top Controls: Search Bar & Barcode Scanner Trigger */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Live Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleBarcodeScan(searchQuery.trim());
                  }
                }}
                placeholder="Search products by Name, SKU, or scan Barcode (Press Enter)..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
              />
            </div>

            {/* Live Camera Scanner Button */}
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
              title="Open Barcode Scanner (Camera & Quick Test Barcodes)"
            >
              <Barcode className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid - Pure White Background */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                <ShoppingBag className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">No products match your search</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by barcode or a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.minStockAlert;
                const cartQty = cart.find((i) => i.product.id === prod.id)?.quantity || 0;
                const catObj = categories.find((c) => c.id === prod.categoryId);

                return (
                  <button
                    key={prod.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => addToCart(prod)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200/60 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200/80 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer'
                    }`}
                  >
                    {/* Top Row: Category tag & Stock indicator */}
                    <div className="flex items-center justify-between gap-1 w-full text-[10px] mb-2">
                      <span className="truncate uppercase font-mono font-bold text-slate-400 tracking-wider">
                        {prod.sku}
                      </span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                          isOutOfStock
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isLowStock
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {isOutOfStock ? 'Sold Out' : `${prod.stock} in stock`}
                      </span>
                    </div>

                    {/* Product Name */}
                    <div className="mb-2">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {prod.name}
                      </p>
                      {catObj && (
                        <span className="inline-block mt-1 text-[10px] text-slate-400 font-medium">
                          {catObj.name}
                        </span>
                      )}
                    </div>

                    {/* Price and Barcode snippet */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between w-full">
                      <div>
                        <span className="text-sm font-extrabold font-mono text-emerald-700">
                          {formatCurrency(prod.sellingPrice, settings.currency)}
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]">
                          {prod.barcode}
                        </p>
                      </div>

                      {/* Cart count badge */}
                      {cartQty > 0 ? (
                        <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-emerald-500/30">
                          {cartQty}
                        </span>
                      ) : (
                        <div className="p-1.5 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-700 border border-slate-200/60 group-hover:border-emerald-200 transition-all">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Cart & Checkout Panel */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-white border border-slate-100 rounded-2xl flex flex-col overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] shrink-0">
        {/* Cart Header with Customer Assignment */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Current Order</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-mono font-semibold text-slate-600">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Quick Customer Pill */}
          <button
            type="button"
            onClick={() => setIsCustomerModalOpen(true)}
            className="w-full p-2.5 bg-slate-50/70 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-1.5 bg-emerald-100/70 text-emerald-700 rounded-lg shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 transition-colors truncate">
                  {selectedCustomer.name}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {selectedCustomer.loyaltyPoints} loyalty points available
                </p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
              Change &rarr;
            </span>
          </button>
        </div>

        {/* Cart Item List - Pure White Background */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-600">Cart is empty</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Click on products on the left or scan a barcode to begin checkout.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = item.product.sellingPrice * item.quantity - item.customDiscount;
              return (
                <div
                  key={item.product.id}
                  className="p-3 bg-white border border-slate-100 hover:border-emerald-200 rounded-xl space-y-2 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {formatCurrency(item.product.sellingPrice, settings.currency)} each
                      </p>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-slate-900">
                      {formatCurrency(itemTotal, settings.currency)}
                    </span>
                  </div>

                  {/* Quantity and Remove Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold font-mono text-emerald-700">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Coupon Code & Totals Breakdown & Checkout Button */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-3 shrink-0">
          {/* Coupon / Voucher Code Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Coupon (e.g. FLASH20, SAVE5)..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs font-mono uppercase bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl transition-colors border border-slate-200/80 hover:border-emerald-200 cursor-pointer"
              >
                Apply
              </button>
            </div>
            {voucherError && <p className="text-[11px] text-rose-600 font-medium">{voucherError}</p>}
            {appliedDiscount && (
              <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                <span>Applied: {appliedDiscount.name}</span>
                <button
                  type="button"
                  onClick={() => setAppliedDiscount(null)}
                  className="text-slate-400 hover:text-slate-800 ml-2"
                >
                  &times;
                </button>
              </div>
            )}
          </form>

          {/* Pricing Totals Breakdown */}
          <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2 font-mono">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="tabular-nums font-semibold text-slate-800">
                {formatCurrency(cartSubtotal, settings.currency)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount</span>
                <span className="tabular-nums font-semibold">
                  -{formatCurrency(discountAmount, settings.currency)}
                </span>
              </div>
            )}
            {settings.showTaxOnReceipt && (
              <div className="flex justify-between text-slate-500">
                <span>Tax ({(settings.taxRate * 100).toFixed(0)}%)</span>
                <span className="tabular-nums font-semibold text-slate-800">
                  {formatCurrency(taxTotal, settings.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="tabular-nums text-emerald-700 font-extrabold text-lg">
                {formatCurrency(grandTotal, settings.currency)}
              </span>
            </div>
          </div>

          {/* Checkout CTA Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Process Payment ({formatCurrency(grandTotal, settings.currency)})</span>
          </button>
        </div>
      </div>

      {/* Sub-modals */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
        products={products}
      />

      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        selectedCustomerId={selectedCustomer.id}
        onSelectCustomer={(c) => setSelectedCustomer(c)}
        onAddNewCustomer={onAddNewCustomer}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={cartSubtotal}
        discountTotal={discountAmount}
        taxTotal={taxTotal}
        grandTotal={grandTotal}
        selectedCustomer={selectedCustomer}
        settings={settings}
        onCompleteSale={handleCompleteSale}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={completedOrder}
        settings={settings}
        onNewSale={() => {
          clearCart();
          setIsReceiptOpen(false);
        }}
      />
    </div>
  );
};
