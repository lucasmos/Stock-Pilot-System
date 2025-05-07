
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantityInStock: number;
  category?: string;
  supplier?: string;
  imageUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'mpesa' | 'airtelmoney';
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId?: string; // From payment gateway
  customerId?: string;
  createdAt: string; // ISO date string
  receiptUrl?: string;
}

export interface PurchaseItem {
  productId?: string; // Optional if it's a new product not yet in inventory
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  items: PurchaseItem[];
  supplier: string;
  totalCost: number;
  purchaseDate: string; // ISO date string
  createdAt: string; // ISO date string
}

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO date string
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string; // ISO date string
}

export interface Report {
  id: string;
  month: number; // 1-12
  year: number;
  salesData: Sale[]; // Simplified, could be aggregated data
  purchasesData: Purchase[]; // Simplified
  // Placeholder for income statement data
  incomeStatementData: {
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: number;
    netIncome: number;
  };
  generatedAt: string; // ISO date string
  downloadUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
