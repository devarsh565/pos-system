export type Role = 'admin' | 'cashier' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: 'active' | 'disabled';
  phone: string;
  avatar: string;
  storeId: string;
  lastLogin: string;
  activeSessionId?: string;
  activeDeviceName?: string;
  lastActiveTime?: number;
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  isMain: boolean;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  expirationDate: string; // YYYY-MM-DD
  supplierId: string;
  storeId: string;
  unit: string;
  taxRate: number;
  imageUrl?: string;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  loyaltyPoints: number;
  creditBalance: number;
  totalSpent: number;
  createdAt: string;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customDiscount: number; // per item fixed discount
  note?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'split';

export interface OrderLineItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  date: string;
  timestamp: number;
  cashierId: string;
  cashierName: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  items: OrderLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeAmount: number;
  paymentDetails?: {
    cardLast4?: string;
    mobileTransactionId?: string;
    splitAmounts?: {
      cash?: number;
      card?: number;
      mobile?: number;
    };
  };
  status: 'completed' | 'refunded' | 'void';
  notes?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  decimals: number;
}

export interface SystemSettings {
  businessName: string;
  tradingName: string;
  taxId: string;
  taxRate: number; // e.g. 0.16 for 16%
  email: string;
  phone: string;
  address: string;
  website: string;
  currency: Currency;
  receiptHeader: string;
  receiptFooter: string;
  showTaxOnReceipt: boolean;
  showBarcodeOnReceipt: boolean;
  enableStockAlerts: boolean;
  oneTimeActivation: {
    isActivated: boolean;
    licenseKey: string;
    activatedAt: string;
    tier: string;
    licenseHolder: string;
  };
}

export type ViewModule = 
  | 'pos'
  | 'products'
  | 'expiration'
  | 'orders'
  | 'categories'
  | 'suppliers'
  | 'stores'
  | 'discounts'
  | 'customers'
  | 'employees'
  | 'users'
  | 'reports'
  | 'my-account'
  | 'system-settings'
  | 'activation';
