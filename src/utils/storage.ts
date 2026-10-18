import {
  User,
  Store,
  Category,
  Supplier,
  Product,
  Customer,
  Discount,
  Order,
  SystemSettings,
  Currency,
} from '../types/pos';

const STORAGE_KEYS = {
  USERS: 'aurapos_users_v2',
  CURRENT_USER: 'aurapos_current_user_v2',
  CURRENT_SESSION: 'aurapos_current_session_v2',
  STORES: 'aurapos_stores_v2',
  CATEGORIES: 'aurapos_categories_v2',
  SUPPLIERS: 'aurapos_suppliers_v2',
  PRODUCTS: 'aurapos_products_v2',
  CUSTOMERS: 'aurapos_customers_v2',
  DISCOUNTS: 'aurapos_discounts_v2',
  ORDERS: 'aurapos_orders_v2',
  SETTINGS: 'aurapos_settings_v2',
  ACTIVE_SESSIONS: 'aurapos_active_sessions_v2',
};

// Initial Seed Data
const INITIAL_CURRENCY: Currency = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  position: 'before',
  decimals: 2,
};

const INITIAL_SETTINGS: SystemSettings = {
  businessName: 'AuraPOS Retail & Supermarket',
  tradingName: 'Aura Mart Enterprise',
  taxId: 'TX-9482019-Z',
  taxRate: 0.16, // 16% VAT
  email: 'support@aurapos.io',
  phone: '+1 (555) 234-8900',
  address: '742 Evergreen Plaza, Suite 400, Metro City',
  website: 'https://auramart.enterprise',
  currency: INITIAL_CURRENCY,
  receiptHeader: 'WELCOME TO AURAPOS ENTERPRISE\nCustomer Satisfaction Is Our Priority',
  receiptFooter: 'Thank you for shopping with us!\nGoods once sold can be returned within 7 days with original receipt.',
  showTaxOnReceipt: true,
  showBarcodeOnReceipt: true,
  enableStockAlerts: true,
  oneTimeActivation: {
    isActivated: true,
    licenseKey: 'AURA-ENT-2026-9842-8819-KEY',
    activatedAt: '2026-01-15T09:00:00.000Z',
    tier: 'Enterprise Unlimited Lifetime',
    licenseHolder: 'Aura Mart Holdings Ltd',
  },
};

const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Aura Flagship Supercenter',
    code: 'HQ-01',
    address: '742 Evergreen Plaza, Metro City',
    phone: '+1 (555) 234-8901',
    email: 'hq@auramart.enterprise',
    taxNumber: 'TX-9482019-Z',
    isMain: true,
  },
  {
    id: 'store-2',
    name: 'Downtown Express Branch',
    code: 'DT-02',
    address: '108 Commercial St, Metro City',
    phone: '+1 (555) 234-8902',
    email: 'downtown@auramart.enterprise',
    taxNumber: 'TX-9482019-Z',
    isMain: false,
  },
  {
    id: 'store-3',
    name: 'Airport Terminal Kiosk',
    code: 'AP-03',
    address: 'Terminal 2 Concourse B, International Airport',
    phone: '+1 (555) 234-8903',
    email: 'airport@auramart.enterprise',
    taxNumber: 'TX-9482019-Z',
    isMain: false,
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Alexander Ross',
    email: 'admin@aurapos.io',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    phone: '+1 (555) 888-0001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    storeId: 'store-1',
    lastLogin: '2026-10-18T06:30:00.000Z',
  },
  {
    id: 'user-cashier',
    name: 'Beatrice Vance',
    email: 'cashier@aurapos.io',
    password: 'cash123',
    role: 'cashier',
    status: 'active',
    phone: '+1 (555) 888-0002',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    storeId: 'store-1',
    lastLogin: '2026-10-18T05:45:00.000Z',
  },
  {
    id: 'user-manager',
    name: 'Marcus Sterling',
    email: 'manager@aurapos.io',
    password: 'mgr123',
    role: 'manager',
    status: 'active',
    phone: '+1 (555) 888-0003',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    storeId: 'store-2',
    lastLogin: '2026-10-17T18:20:00.000Z',
  },
  {
    id: 'user-clerk',
    name: 'Chloe Lin',
    email: 'clerk@aurapos.io',
    password: 'clerk123',
    role: 'cashier',
    status: 'disabled', // Demonstrates disabled account feature
    phone: '+1 (555) 888-0004',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    storeId: 'store-1',
    lastLogin: '2026-09-12T14:10:00.000Z',
  },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Beverages', code: 'BEV', color: 'emerald', icon: 'Coffee' },
  { id: 'cat-2', name: 'Bakery & Pastry', code: 'BAK', color: 'amber', icon: 'Croissant' },
  { id: 'cat-3', name: 'Fresh Grocery', code: 'GRO', color: 'blue', icon: 'Apple' },
  { id: 'cat-4', name: 'Pantry & Grains', code: 'PAN', color: 'orange', icon: 'Package' },
  { id: 'cat-5', name: 'Health & Personal Care', code: 'HPC', color: 'rose', icon: 'HeartPulse' },
  { id: 'cat-6', name: 'Tech & Electronics', code: 'ELE', color: 'indigo', icon: 'Smartphone' },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Summit Beverage Distributors',
    contactPerson: 'David K. O’Neill',
    phone: '+1 (555) 441-2090',
    email: 'orders@summitbev.com',
    address: '400 Industrial Way, Warehouse District',
    status: 'active',
  },
  {
    id: 'sup-2',
    name: 'Artisan Bakers Guild',
    contactPerson: 'Elena Rossi',
    phone: '+1 (555) 441-3321',
    email: 'deliveries@artisanbakery.com',
    address: '88 Millstone Rd, Grain Park',
    status: 'active',
  },
  {
    id: 'sup-3',
    name: 'Greenfield Organic Farms',
    contactPerson: 'Samson Patel',
    phone: '+1 (555) 441-9870',
    email: 'harvest@greenfieldproduce.com',
    address: '12 Valley Route, Agri-Corridor',
    status: 'active',
  },
  {
    id: 'sup-4',
    name: 'NovaTech Supply Corp',
    contactPerson: 'Rachel Zhang',
    phone: '+1 (555) 441-5544',
    email: 'b2b@novatechsupply.com',
    address: '900 Silicon Way, Tech Park',
    status: 'active',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Organic Cold Brew Coffee 330ml',
    sku: 'BEV-CB-001',
    barcode: '012000000133',
    categoryId: 'cat-1',
    costPrice: 1.80,
    sellingPrice: 3.99,
    stock: 48,
    minStockAlert: 15,
    expirationDate: '2026-11-20', // Safe
    supplierId: 'sup-1',
    storeId: 'store-1',
    unit: 'bottle',
    taxRate: 0.16,
    description: 'Steeped for 18 hours with single-origin Ethiopian beans.',
  },
  {
    id: 'prod-2',
    name: 'Sparkling Mineral Water 500ml',
    sku: 'BEV-SP-002',
    barcode: '049000042566',
    categoryId: 'cat-1',
    costPrice: 0.65,
    sellingPrice: 1.75,
    stock: 120,
    minStockAlert: 24,
    expirationDate: '2027-05-15',
    supplierId: 'sup-1',
    storeId: 'store-1',
    unit: 'bottle',
    taxRate: 0.16,
    description: 'Crisp, natural sparkling spring water.',
  },
  {
    id: 'prod-3',
    name: 'Citrus Blast Energy Tonic 250ml',
    sku: 'BEV-EN-003',
    barcode: '078000000244',
    categoryId: 'cat-1',
    costPrice: 1.10,
    sellingPrice: 2.89,
    stock: 6, // Low stock
    minStockAlert: 12,
    expirationDate: '2026-10-24', // Expiring in 6 days!
    supplierId: 'sup-1',
    storeId: 'store-1',
    unit: 'can',
    taxRate: 0.16,
    description: 'Natural taurine & green tea extract with lime punch.',
  },
  {
    id: 'prod-4',
    name: 'Artisan Sourdough Loaf 600g',
    sku: 'BAK-SD-001',
    barcode: '028400064082',
    categoryId: 'cat-2',
    costPrice: 2.10,
    sellingPrice: 5.50,
    stock: 18,
    minStockAlert: 5,
    expirationDate: '2026-10-21', // Expiring in 3 days!
    supplierId: 'sup-2',
    storeId: 'store-1',
    unit: 'loaf',
    taxRate: 0.16,
    description: 'Fermented naturally for 36 hours. Crisp blistered crust.',
  },
  {
    id: 'prod-5',
    name: 'Golden Butter Croissant',
    sku: 'BAK-CR-002',
    barcode: '038000138416',
    categoryId: 'cat-2',
    costPrice: 1.05,
    sellingPrice: 2.95,
    stock: 25,
    minStockAlert: 8,
    expirationDate: '2026-10-17', // Already EXPIRED yesterday!
    supplierId: 'sup-2',
    storeId: 'store-1',
    unit: 'pcs',
    taxRate: 0.16,
    description: 'Flaky Normandy butter laminated viennoiserie.',
  },
  {
    id: 'prod-6',
    name: 'Triple Chocolate Cookie Pack (4pc)',
    sku: 'BAK-CC-003',
    barcode: '044000032029',
    categoryId: 'cat-2',
    costPrice: 2.20,
    sellingPrice: 4.80,
    stock: 35,
    minStockAlert: 10,
    expirationDate: '2026-11-05',
    supplierId: 'sup-2',
    storeId: 'store-1',
    unit: 'pack',
    taxRate: 0.16,
    description: 'Belgian dark, milk, and white chocolate chunks.',
  },
  {
    id: 'prod-7',
    name: 'Farmhouse Whole Milk 1 Gallon',
    sku: 'GRO-MK-001',
    barcode: '070272212345',
    categoryId: 'cat-3',
    costPrice: 2.60,
    sellingPrice: 4.49,
    stock: 22,
    minStockAlert: 10,
    expirationDate: '2026-10-26', // Expiring in 8 days
    supplierId: 'sup-3',
    storeId: 'store-1',
    unit: 'gallon',
    taxRate: 0.0, // Zero-rated basic staple
    description: 'Pasteurized whole milk from grass-fed cows.',
  },
  {
    id: 'prod-8',
    name: 'Greek Plain Yogurt 500g',
    sku: 'GRO-YG-002',
    barcode: '052159700019',
    categoryId: 'cat-3',
    costPrice: 1.90,
    sellingPrice: 3.75,
    stock: 14,
    minStockAlert: 8,
    expirationDate: '2026-10-23', // Expiring in 5 days
    supplierId: 'sup-3',
    storeId: 'store-1',
    unit: 'tub',
    taxRate: 0.16,
    description: 'High-protein strained plain yogurt.',
  },
  {
    id: 'prod-9',
    name: 'Honeycrisp Apples 1kg Bag',
    sku: 'GRO-AP-003',
    barcode: '033383111005',
    categoryId: 'cat-3',
    costPrice: 2.40,
    sellingPrice: 5.20,
    stock: 30,
    minStockAlert: 10,
    expirationDate: '2026-11-01',
    supplierId: 'sup-3',
    storeId: 'store-1',
    unit: 'bag',
    taxRate: 0.0,
    description: 'Crisp, sweet orchard apples.',
  },
  {
    id: 'prod-10',
    name: 'Extra Virgin Olive Oil 750ml',
    sku: 'PAN-OL-001',
    barcode: '041790001402',
    categoryId: 'cat-4',
    costPrice: 8.50,
    sellingPrice: 14.99,
    stock: 19,
    minStockAlert: 6,
    expirationDate: '2027-08-30',
    supplierId: 'sup-3',
    storeId: 'store-1',
    unit: 'bottle',
    taxRate: 0.16,
    description: 'First cold pressed Mediterranean olive oil.',
  },
  {
    id: 'prod-11',
    name: 'Basmati Rice Premium 5kg',
    sku: 'PAN-RC-002',
    barcode: '074312001099',
    categoryId: 'cat-4',
    costPrice: 9.00,
    sellingPrice: 16.50,
    stock: 45,
    minStockAlert: 12,
    expirationDate: '2028-01-10',
    supplierId: 'sup-3',
    storeId: 'store-1',
    unit: 'bag',
    taxRate: 0.0,
    description: 'Long grain aged fragrant basmati rice.',
  },
  {
    id: 'prod-12',
    name: 'Artisan Penne Rigate 500g',
    sku: 'PAN-PS-003',
    barcode: '029351000213',
    categoryId: 'cat-4',
    costPrice: 1.15,
    sellingPrice: 2.65,
    stock: 50,
    minStockAlert: 15,
    expirationDate: '2027-12-15',
    supplierId: 'sup-3',
    storeId: 'store-1',
    unit: 'box',
    taxRate: 0.16,
    description: 'Bronze-die extruded Italian durum wheat pasta.',
  },
  {
    id: 'prod-13',
    name: 'Botanical Antibacterial Hand Soap 300ml',
    sku: 'HPC-SP-001',
    barcode: '037000123891',
    categoryId: 'cat-5',
    costPrice: 2.10,
    sellingPrice: 4.50,
    stock: 38,
    minStockAlert: 10,
    expirationDate: '2027-03-20',
    supplierId: 'sup-4',
    storeId: 'store-1',
    unit: 'bottle',
    taxRate: 0.16,
    description: 'Tea tree and aloe vera foaming cleanser.',
  },
  {
    id: 'prod-14',
    name: 'Hydro-Boost Face Serum 50ml',
    sku: 'HPC-FS-002',
    barcode: '071249210088',
    categoryId: 'cat-5',
    costPrice: 9.50,
    sellingPrice: 21.00,
    stock: 15,
    minStockAlert: 5,
    expirationDate: '2026-10-15', // Expired 3 days ago!
    supplierId: 'sup-4',
    storeId: 'store-1',
    unit: 'bottle',
    taxRate: 0.16,
    description: 'Hyaluronic acid with vitamin B5 nourishing serum.',
  },
  {
    id: 'prod-15',
    name: 'Fast-Charge Braided USB-C Cable 2m',
    sku: 'ELE-CB-001',
    barcode: '840056123490',
    categoryId: 'cat-6',
    costPrice: 4.20,
    sellingPrice: 12.99,
    stock: 28,
    minStockAlert: 10,
    expirationDate: '2030-01-01',
    supplierId: 'sup-4',
    storeId: 'store-1',
    unit: 'pcs',
    taxRate: 0.16,
    description: '100W PD compatible nylon braided tough cable.',
  },
  {
    id: 'prod-16',
    name: 'Universal 65W GaN Dual Wall Charger',
    sku: 'ELE-CH-002',
    barcode: '840056123491',
    categoryId: 'cat-6',
    costPrice: 14.50,
    sellingPrice: 34.00,
    stock: 12,
    minStockAlert: 5,
    expirationDate: '2030-01-01',
    supplierId: 'sup-4',
    storeId: 'store-1',
    unit: 'pcs',
    taxRate: 0.16,
    description: 'Compact gallium nitride charger for laptop & phone.',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-walkin',
    name: 'General Walk-In Customer',
    phone: 'N/A',
    email: 'walkin@auramart.enterprise',
    loyaltyPoints: 0,
    creditBalance: 0,
    totalSpent: 1240.50,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cust-1',
    name: 'Elena Rostova',
    phone: '+1 (555) 721-9988',
    email: 'elena.rostova@gmail.com',
    address: '42 Pine Hill Lane, Metro City',
    loyaltyPoints: 340,
    creditBalance: 25.00,
    totalSpent: 890.40,
    createdAt: '2026-02-14T10:15:00.000Z',
  },
  {
    id: 'cust-2',
    name: 'Marcus K. Vance',
    phone: '+1 (555) 721-4321',
    email: 'mvance@corporate.io',
    address: '15 Highline Blvd, Apt 12B',
    loyaltyPoints: 120,
    creditBalance: 0.0,
    totalSpent: 410.75,
    createdAt: '2026-04-10T14:20:00.000Z',
  },
  {
    id: 'cust-3',
    name: 'Sophia Patel',
    phone: '+1 (555) 721-6677',
    email: 'sophia.p@outlook.com',
    address: '77 Garden Terrace, Metro City',
    loyaltyPoints: 580,
    creditBalance: 50.00,
    totalSpent: 1420.10,
    createdAt: '2026-01-20T11:45:00.000Z',
  },
];

const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'disc-1',
    code: 'WELCOME10',
    name: 'Welcome Shopper 10%',
    type: 'percentage',
    value: 10,
    minSpend: 15,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    usageCount: 42,
  },
  {
    id: 'disc-2',
    code: 'FLASH20',
    name: 'Weekend Flash 20% Off',
    type: 'percentage',
    value: 20,
    minSpend: 50,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    isActive: true,
    usageCount: 19,
  },
  {
    id: 'disc-3',
    code: 'SAVE5',
    name: '$5 Instant Cashback Voucher',
    type: 'fixed',
    value: 5,
    minSpend: 25,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    isActive: true,
    usageCount: 88,
  },
  {
    id: 'disc-4',
    code: 'VIP25',
    name: 'Executive Loyalty $25 Flat',
    type: 'fixed',
    value: 25,
    minSpend: 100,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    usageCount: 7,
  },
];

// Generate 12 historical orders across recent dates for reporting and analytics
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    invoiceNumber: 'INV-2026-00101',
    date: '2026-10-18T05:50:00.000Z',
    timestamp: Date.now() - 3600000,
    cashierId: 'user-cashier',
    cashierName: 'Beatrice Vance',
    customerId: 'cust-1',
    customerName: 'Elena Rostova',
    storeId: 'store-1',
    storeName: 'Aura Flagship Supercenter',
    items: [
      {
        productId: 'prod-1',
        name: 'Organic Cold Brew Coffee 330ml',
        sku: 'BEV-CB-001',
        barcode: '012000000133',
        quantity: 2,
        unitPrice: 3.99,
        costPrice: 1.80,
        discount: 0,
        total: 7.98,
      },
      {
        productId: 'prod-4',
        name: 'Artisan Sourdough Loaf 600g',
        sku: 'BAK-SD-001',
        barcode: '028400064082',
        quantity: 1,
        unitPrice: 5.50,
        costPrice: 2.10,
        discount: 0,
        total: 5.50,
      },
    ],
    subtotal: 13.48,
    discountTotal: 0,
    taxTotal: 2.16,
    total: 15.64,
    paymentMethod: 'cash',
    amountPaid: 20.00,
    changeAmount: 4.36,
    status: 'completed',
    notes: 'Loyalty points added',
  },
  {
    id: 'ord-1002',
    invoiceNumber: 'INV-2026-00102',
    date: '2026-10-18T06:15:00.000Z',
    timestamp: Date.now() - 1800000,
    cashierId: 'user-cashier',
    cashierName: 'Beatrice Vance',
    customerId: 'cust-walkin',
    customerName: 'General Walk-In Customer',
    storeId: 'store-1',
    storeName: 'Aura Flagship Supercenter',
    items: [
      {
        productId: 'prod-16',
        name: 'Universal 65W GaN Dual Wall Charger',
        sku: 'ELE-CH-002',
        barcode: '840056123491',
        quantity: 1,
        unitPrice: 34.00,
        costPrice: 14.50,
        discount: 3.40,
        total: 30.60,
      },
      {
        productId: 'prod-15',
        name: 'Fast-Charge Braided USB-C Cable 2m',
        sku: 'ELE-CB-001',
        barcode: '840056123490',
        quantity: 1,
        unitPrice: 12.99,
        costPrice: 4.20,
        discount: 0,
        total: 12.99,
      },
    ],
    subtotal: 46.99,
    discountTotal: 3.40,
    taxTotal: 6.97,
    total: 50.56,
    paymentMethod: 'card',
    amountPaid: 50.56,
    changeAmount: 0.00,
    paymentDetails: { cardLast4: '4821' },
    status: 'completed',
  },
  {
    id: 'ord-1003',
    invoiceNumber: 'INV-2026-00098',
    date: '2026-10-17T14:30:00.000Z',
    timestamp: Date.now() - 86400000,
    cashierId: 'user-manager',
    cashierName: 'Marcus Sterling',
    customerId: 'cust-3',
    customerName: 'Sophia Patel',
    storeId: 'store-2',
    storeName: 'Downtown Express Branch',
    items: [
      {
        productId: 'prod-10',
        name: 'Extra Virgin Olive Oil 750ml',
        sku: 'PAN-OL-001',
        barcode: '041790001402',
        quantity: 2,
        unitPrice: 14.99,
        costPrice: 8.50,
        discount: 0,
        total: 29.98,
      },
      {
        productId: 'prod-11',
        name: 'Basmati Rice Premium 5kg',
        sku: 'PAN-RC-002',
        barcode: '074312001099',
        quantity: 1,
        unitPrice: 16.50,
        costPrice: 9.00,
        discount: 0,
        total: 16.50,
      },
    ],
    subtotal: 46.48,
    discountTotal: 5.00,
    taxTotal: 4.80,
    total: 46.28,
    paymentMethod: 'mobile_money',
    amountPaid: 46.28,
    changeAmount: 0.00,
    paymentDetails: { mobileTransactionId: 'MPESA-QJ8299A1' },
    status: 'completed',
  },
  {
    id: 'ord-1004',
    invoiceNumber: 'INV-2026-00097',
    date: '2026-10-16T11:10:00.000Z',
    timestamp: Date.now() - 172800000,
    cashierId: 'user-cashier',
    cashierName: 'Beatrice Vance',
    customerId: 'cust-2',
    customerName: 'Marcus K. Vance',
    storeId: 'store-1',
    storeName: 'Aura Flagship Supercenter',
    items: [
      {
        productId: 'prod-13',
        name: 'Botanical Antibacterial Hand Soap 300ml',
        sku: 'HPC-SP-001',
        barcode: '037000123891',
        quantity: 3,
        unitPrice: 4.50,
        costPrice: 2.10,
        discount: 0,
        total: 13.50,
      },
    ],
    subtotal: 13.50,
    discountTotal: 0,
    taxTotal: 2.16,
    total: 15.66,
    paymentMethod: 'split',
    amountPaid: 15.66,
    changeAmount: 0.00,
    paymentDetails: {
      splitAmounts: { cash: 10.00, card: 5.66 },
    },
    status: 'completed',
  },
];

// Storage Helper Functions
export const Storage = {
  getUsers: (): User[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser: (): User | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  },

  getCurrentSessionId: (): string => {
    let sess = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!sess) {
      sess = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sess);
    }
    return sess;
  },

  getStores: (): Store[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORES);
      return data ? JSON.parse(data) : INITIAL_STORES;
    } catch {
      return INITIAL_STORES;
    }
  },

  saveStores: (stores: Store[]) => {
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
  },

  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getSuppliers: (): Supplier[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return data ? JSON.parse(data) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  },

  saveSuppliers: (suppliers: Supplier[]) => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  },

  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCustomers: (): Customer[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },

  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getDiscounts: (): Discount[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISCOUNTS);
      return data ? JSON.parse(data) : INITIAL_DISCOUNTS;
    } catch {
      return INITIAL_DISCOUNTS;
    }
  },

  saveDiscounts: (discounts: Discount[]) => {
    localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(discounts));
  },

  getOrders: (): Order[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrders: (orders: Order[]) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getSettings: (): SystemSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings: (settings: SystemSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Multi-Device Session Lock Management
  getActiveSessions: (): Record<string, { sessionId: string; deviceName: string; lastActive: number }> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSIONS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveActiveSessions: (sessions: Record<string, { sessionId: string; deviceName: string; lastActive: number }>) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSIONS, JSON.stringify(sessions));
  },

  // Check if user is logged into another device/session
  checkUserActiveSession: (userId: string, currentSessionId: string): { isConflict: boolean; activeDevice?: string } => {
    const sessions = Storage.getActiveSessions();
    const active = sessions[userId];
    if (!active) return { isConflict: false };

    // If session ID matches, it's the current device
    if (active.sessionId === currentSessionId) {
      // update heartbeat
      active.lastActive = Date.now();
      sessions[userId] = active;
      Storage.saveActiveSessions(sessions);
      return { isConflict: false };
    }

    // If active session heartbeat was within 10 minutes, conflict!
    const TEN_MINUTES = 10 * 60 * 1000;
    if (Date.now() - active.lastActive < TEN_MINUTES) {
      return { isConflict: true, activeDevice: active.deviceName };
    }

    return { isConflict: false };
  },

  registerUserSession: (userId: string, sessionId: string, deviceName: string) => {
    const sessions = Storage.getActiveSessions();
    sessions[userId] = {
      sessionId,
      deviceName,
      lastActive: Date.now(),
    };
    Storage.saveActiveSessions(sessions);
  },

  terminateUserSession: (userId: string) => {
    const sessions = Storage.getActiveSessions();
    delete sessions[userId];
    Storage.saveActiveSessions(sessions);
  },

  resetAllData: () => {
    localStorage.clear();
  },
};

// Currency Formatting Helper
export function formatCurrency(amount: number, currency: Currency): string {
  const decimals = currency.decimals ?? 2;
  const numStr = (Number(amount) || 0).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return currency.position === 'after'
    ? `${numStr} ${currency.symbol}`
    : `${currency.symbol}${numStr}`;
}
