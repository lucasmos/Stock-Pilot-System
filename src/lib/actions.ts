
'use server';

import { z } from 'zod';
import { generateProductImage as generateProductImageFlow, type GenerateProductImageInput } from '@/ai/flows/product-image-generation';
import type { Product, Sale, Purchase, User, UserRole } from './types';
import { mockProducts, mockSales, mockPurchases, mockUsers } from './data'; // For simulating data ops
import { initiateStkPush } from '@/services/safaricom';
import { initiateAirtelMoneyTransaction } from '@/services/airtel-money';

// Schema for adding a product
const AddProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number"),
  quantityInStock: z.coerce.number().int().nonnegative("Quantity must be a non-negative integer"),
  category: z.string().optional(),
  supplier: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal('')),
});

export async function addProduct(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = AddProductSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten().fieldErrors);
    return {
      error: "Invalid fields. Please check the data and try again.",
      details: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const newProductData = validatedFields.data;
  if (newProductData.imageUrl === '') {
    delete newProductData.imageUrl; // Remove if empty string so it becomes undefined
  }

  const newProduct: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // More unique ID
    ...newProductData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockProducts.unshift(newProduct); // Add to the beginning for visibility
  console.log("Added new product:", newProduct);

  return { success: "Product added successfully!", product: newProduct };
}

export async function addProductsFromExcel(formData: FormData) {
  const file = formData.get('excelFile') as File;

  if (!file) {
    return { error: "No Excel file provided." };
  }

  console.log("Received Excel file:", file.name, "Size:", file.size);

  // ** SIMULATION ONLY **
  // In a real application, you would use a library like 'xlsx' or 'SheetJS' here to:
  // 1. Read the file buffer: `await file.arrayBuffer()`
  // 2. Parse the Excel data from the buffer.
  // 3. Iterate over rows and validate each product using AddProductSchema.
  // 4. Collect valid products and any errors.

  // For demonstration, let's simulate adding a couple of products
  const simulatedParsedProducts = [
    { name: "Excel Product A", price: 19.99, quantityInStock: 150, category: "Excel Uploads", description: "Added via Excel" },
    { name: "Excel Product B", price: 29.99, quantityInStock: 75, category: "Excel Uploads", description: "Another one via Excel" },
  ];

  let addedCount = 0;
  for (const prodData of simulatedParsedProducts) {
    const validatedFields = AddProductSchema.safeParse(prodData);
    if (validatedFields.success) {
      const newProduct: Product = {
        id: `prod_excel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...validatedFields.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProducts.unshift(newProduct);
      addedCount++;
    } else {
      console.warn("Skipping invalid product from Excel (simulated):", prodData, validatedFields.error.flatten().fieldErrors);
    }
  }

  if (addedCount > 0) {
    return { success: true, message: `Successfully processed Excel file. ${addedCount} products added (simulated). Actual Excel parsing requires a library.` };
  } else {
    return { error: "No valid products found in Excel file (simulated). Actual Excel parsing requires a library." };
  }
}


export async function getProducts(): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return Promise.resolve([...mockProducts]); // Return a copy to avoid direct mutation issues in components
}

export async function getSales(dateRange?: { from: Date, to: Date }): Promise<Sale[]> {
  console.log("Fetching sales, date range:", dateRange);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredSales = [...mockSales];
  if (dateRange?.from && dateRange?.to) {
    const fromDate = new Date(dateRange.from).setHours(0,0,0,0);
    const toDate = new Date(dateRange.to).setHours(23,59,59,999);
    filteredSales = mockSales.filter(sale => {
      const saleDate = new Date(sale.createdAt).getTime();
      return saleDate >= fromDate && saleDate <= toDate;
    });
  }
  return Promise.resolve(filteredSales);
}

export async function getPurchases(dateRange?: { from: Date, to: Date }): Promise<Purchase[]> {
  console.log("Fetching purchases, date range:", dateRange);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredPurchases = [...mockPurchases];
   if (dateRange?.from && dateRange?.to) {
    const fromDate = new Date(dateRange.from).setHours(0,0,0,0);
    const toDate = new Date(dateRange.to).setHours(23,59,59,999);
    filteredPurchases = mockPurchases.filter(purchase => {
      const purchaseDateVal = new Date(purchase.purchaseDate).getTime();
      return purchaseDateVal >= fromDate && purchaseDateVal <= toDate;
    });
  }
  return Promise.resolve(filteredPurchases);
}

export async function generateProductImage(input: GenerateProductImageInput): Promise<{ imageUrl?: string; error?: string }> {
  try {
    console.log("Generating product image for:", input.productName);
    const result = await generateProductImageFlow(input);
    if (!result.imageUrl.startsWith('data:image')) {
        // This can happen if the model doesn't return a valid image data URI.
        console.error("Generated image URL is not a data URI:", result.imageUrl);
        return { error: "Generated content is not a valid image. Try a different product name."};
    }
    return { imageUrl: result.imageUrl };
  } catch (error: any) {
    console.error("Error generating product image:", error);
    const errorMessage = error.message || "Failed to generate product image due to an unexpected error.";
    if (error.cause && error.cause.message) { // Genkit often wraps errors
        return { error: `Image generation failed: ${error.cause.message}` };
    }
    return { error: errorMessage };
  }
}


export async function processMpesaPayment(phoneNumber: string, amount: number, orderId: string) {
  try {
    const response = await initiateStkPush(phoneNumber, amount, orderId);
    if (response.ResponseCode === "0") {
      return { success: true, message: response.CustomerMessage, checkoutRequestId: response.CheckoutRequestID };
    }
    return { success: false, message: response.ResponseDescription || "MPESA STK push failed." };
  } catch (error) {
    console.error("MPESA Payment Error:", error);
    return { success: false, message: "An error occurred during MPESA payment processing." };
  }
}

export async function processAirtelMoneyPayment(phoneNumber: string, amount: number, orderId: string) {
  try {
    const response = await initiateAirtelMoneyTransaction(phoneNumber, amount, orderId);
    if (response.status === "COMPLETED" || response.status === "SUCCESS") { 
      return { success: true, message: response.message, transactionId: response.transactionId };
    }
    return { success: false, message: response.message || "Airtel Money transaction failed." };
  } catch (error) {
    console.error("Airtel Money Payment Error:", error);
    return { success: false, message: "An error occurred during Airtel Money payment processing." };
  }
}

export async function recordSale(saleData: Omit<Sale, 'id' | 'createdAt'>) {
  const newSale: Sale = {
    id: `sale_${Date.now()}`,
    ...saleData,
    createdAt: new Date().toISOString(),
  };
  mockSales.unshift(newSale);
  console.log("Recorded new sale:", newSale);
  for (const item of newSale.items) {
    const productIndex = mockProducts.findIndex(p => p.id === item.productId);
    if (productIndex !== -1) {
      mockProducts[productIndex].quantityInStock -= item.quantity;
    }
  }
  return { success: "Sale recorded successfully!", sale: newSale };
}

export async function recordPurchase(purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'purchaseDate'> & { purchaseDate?: string } ) {
  const newPurchase: Purchase = {
    id: `pur_${Date.now()}`,
    ...purchaseData,
    purchaseDate: purchaseData.purchaseDate || new Date().toISOString(), // Use provided or current date
    createdAt: new Date().toISOString(),
  };
  mockPurchases.unshift(newPurchase);
  console.log("Recorded new purchase:", newPurchase);
  // Optionally, update stock for purchased items
  for (const item of newPurchase.items) {
    const product = mockProducts.find(p => p.name.toLowerCase() === item.productName.toLowerCase()); // Match by name (could be improved)
    if (product) {
      product.quantityInStock += item.quantity;
    } else {
      // Optionally create a new product if it doesn't exist
      const newProduct: Product = {
        id: `prod_purch_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
        name: item.productName,
        price: item.unitCost * 1.25, // Example: set price with 25% markup
        quantityInStock: item.quantity,
        supplier: newPurchase.supplier,
        category: "Uncategorized",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProducts.unshift(newProduct);
    }
  }
  return { success: "Purchase recorded successfully!", purchase: newPurchase };
}


export async function getUsers(): Promise<User[]> { 
  await new Promise(resolve => setTimeout(resolve, 300));
  return Promise.resolve([...mockUsers]);
}

export async function addUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<{success: boolean, user?: User, error?: string}> {
  console.log("Attempting to add user:", userData);
  if (!userData.email || !userData.name || !userData.role) {
    return { success: false, error: "Missing required user data." };
  }
  const newUser: User = {
    id: `user_${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString(),
  };
  mockUsers.unshift(newUser);
  return { success: true, user: newUser };
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{success: boolean, error?: string}> {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return { success: false, error: "User not found." };
  }
  mockUsers[userIndex].role = newRole;
  console.log(`Updated role for user ${userId} to ${newRole}`);
  return { success: true };
}

export async function deleteUser(userId: string): Promise<{success: boolean, error?: string}> {
   const initialLength = mockUsers.length;
   const userToDelete = mockUsers.find(u => u.id === userId);
   if (!userToDelete) return { success: false, error: "User not found." };
   // Prevent deleting the last admin if it's the only admin
    if (userToDelete.role === 'admin') {
        const adminCount = mockUsers.filter(u => u.role === 'admin').length;
        if (adminCount <= 1) {
            return { success: false, error: "Cannot delete the last admin user." };
        }
    }

   mockUsers = mockUsers.filter(u => u.id !== userId);
   if (mockUsers.length < initialLength) {
     console.log(`Deleted user ${userId}`);
     return { success: true };
   }
   return { success: false, error: "Failed to delete user." };
}

export async function generateMonthlyReport(month: number, year: number) { 
  console.log(`Generating report for ${month}/${year}`); 
  // Simulate report generation
  await new Promise(resolve => setTimeout(resolve, 1500));
  const revenue = Math.random() * 10000 + 50000;
  const costOfGoodsSold = revenue * (Math.random() * 0.3 + 0.4); // COGS between 40-70% of revenue
  const operatingExpenses = Math.random() * 5000 + 10000;
  const grossProfit = revenue - costOfGoodsSold;
  const netIncome = grossProfit - operatingExpenses;

  const report = {
    id: `report_${year}_${String(month).padStart(2, '0')}`,
    month,
    year,
    incomeStatementData: { revenue, costOfGoodsSold, grossProfit, operatingExpenses, netIncome },
    generatedAt: new Date().toISOString(),
    downloadUrl: `/api/reports/download?month=${month}&year=${year}` // Simulated
  };
  return { success: true, report }; 
}

// Authentication (Simulated)
export async function loginAdmin(formData: FormData) { 
  const email = formData.get('email');
  // In a real app, validate credentials against a database
  if (email === 'admin@stockpilot.com') {
    return { success: "Login successful! Redirecting...", redirect: "/admin/dashboard" }; 
  }
  return { error: "Invalid admin credentials." };
}

export async function registerCustomer(formData: FormData) { 
  console.log("Registering customer:", Object.fromEntries(formData.entries())); 
  // Simulate adding to mockCustomers or a database
  return { success: "Registration successful! Please login." , redirect: "/login"}; 
}
export async function loginCustomer(formData: FormData) { 
  console.log("Logging in customer:", Object.fromEntries(formData.entries())); 
  return { success: "Login successful! Redirecting...", redirect: "/products" }; 
}
export async function updateProduct(productId: string, formData: FormData) { console.log(productId, formData); return { success: "Not implemented" }; }
export async function deleteProduct(productId: string) { console.log(productId); return { success: "Not implemented" }; }

