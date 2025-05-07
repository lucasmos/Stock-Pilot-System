import type { Product, Sale, Purchase, User, Customer } from '@/lib/types';

export const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Dell XPS 13 Laptop',
    description: 'Powerful and compact 13-inch laptop.',
    price: 1299.99,
    quantityInStock: 25,
    category: 'Laptops',
    supplier: 'Dell Inc.',
    imageUrl: 'https://picsum.photos/seed/xps13/400/300',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_2',
    name: 'Logitech MX Master 3S Mouse',
    description: 'Advanced wireless mouse for productivity.',
    price: 99.99,
    quantityInStock: 50,
    category: 'Accessories',
    supplier: 'Logitech',
    imageUrl: 'https://picsum.photos/seed/mxmaster3s/400/300',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_3',
    name: 'Samsung 27" Odyssey G5 Monitor',
    description: 'QHD 144Hz gaming monitor.',
    price: 349.99,
    quantityInStock: 15,
    category: 'Monitors',
    supplier: 'Samsung Electronics',
    imageUrl: 'https://picsum.photos/seed/odysseyg5/400/300',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_4',
    name: 'Intel Core i7-13700K CPU',
    description: 'High-performance desktop processor.',
    price: 409.00,
    quantityInStock: 30,
    category: 'Components',
    supplier: 'Intel Corporation',
    imageUrl: 'https://picsum.photos/seed/i7cpu/400/300',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockSales: Sale[] = [
  {
    id: 'sale_1',
    items: [
      { productId: 'prod_2', productName: 'Logitech MX Master 3S Mouse', quantity: 1, unitPrice: 99.99, totalPrice: 99.99 },
      { productId: 'prod_3', productName: 'Samsung 27" Odyssey G5 Monitor', quantity: 1, unitPrice: 349.99, totalPrice: 349.99 },
    ],
    totalAmount: 449.98,
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    transactionId: 'MPESA_TXN_123',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'sale_2',
    items: [{ productId: 'prod_1', productName: 'Dell XPS 13 Laptop', quantity: 1, unitPrice: 1299.99, totalPrice: 1299.99 }],
    totalAmount: 1299.99,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
  },
];

export const mockPurchases: Purchase[] = [
  {
    id: 'pur_1',
    items: [{ productName: 'Dell XPS 13 Laptop', quantity: 10, unitCost: 1000.00, totalCost: 10000.00 }],
    supplier: 'Dell Inc.',
    totalCost: 10000.00,
    purchaseDate: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'pur_2',
    items: [{ productName: 'Logitech MX Master 3S Mouse', quantity: 20, unitCost: 70.00, totalCost: 1400.00 }],
    supplier: 'Logitech Distributor',
    totalCost: 1400.00,
    purchaseDate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const mockUsers: User[] = [
    { id: 'user_1', name: 'Admin User', email: 'admin@stockpilot.com', role: 'admin', createdAt: new Date().toISOString() },
    { id: 'user_2', name: 'Staff User', email: 'staff@stockpilot.com', role: 'staff', createdAt: new Date().toISOString() },
];

export const mockCustomers: Customer[] = [
    { id: 'cust_1', name: 'John Doe', email: 'john.doe@example.com', phoneNumber: '254712345678', createdAt: new Date().toISOString() },
];

// Helper function to get a product by ID (simulates database lookup)
export const getProductById = (id: string): Product | undefined => mockProducts.find(p => p.id === id);
