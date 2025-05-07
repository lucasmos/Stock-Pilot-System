'use server';

import { z } from 'zod';
import { generateProductImage as generateProductImageFlow, type GenerateProductImageInput } from '@/ai/flows/product-image-generation';
import type { Product, Sale, Purchase } from './types';
import { mockProducts, mockSales, mockPurchases } from './data'; // For simulating data ops
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
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export async function addProduct(formData: FormData) {
  const validatedFields = AddProductSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      details: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    ...validatedFields.data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Simulate adding to a database
  mockProducts.push(newProduct);
  console.log("Added new product:", newProduct);

  return { success: "Product added successfully!", product: newProduct };
}

export async function getProducts(): Promise<Product[]> {
  // Simulate fetching from a database
  return Promise.resolve(mockProducts);
}

export async function getSales(dateRange?: { from: Date, to: Date }): Promise<Sale[]> {
  // Simulate fetching and filtering sales
  console.log("Fetching sales, date range:", dateRange);
  return Promise.resolve(mockSales);
}

export async function getPurchases(dateRange?: { from: Date, to: Date }): Promise<Purchase[]> {
  // Simulate fetching and filtering purchases
  console.log("Fetching purchases, date range:", dateRange);
  return Promise.resolve(mockPurchases);
}

export async function generateProductImage(input: GenerateProductImageInput): Promise<{ imageUrl?: string; error?: string }> {
  try {
    console.log("Generating product image for:", input.productName);
    // In a real app, ensure API keys for Genkit are set up on the server
    const result = await generateProductImageFlow(input);
    return { imageUrl: result.imageUrl };
  } catch (error) {
    console.error("Error generating product image:", error);
    return { error: "Failed to generate product image." };
  }
}


export async function processMpesaPayment(phoneNumber: string, amount: number, orderId: string) {
  try {
    const response = await initiateStkPush(phoneNumber, amount, orderId);
    // Handle response - typically you'd store CheckoutRequestID and wait for a callback
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
    // Handle response
    if (response.status === "COMPLETED" || response.status === "SUCCESS") { // Adjust based on actual API success status
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
  mockSales.push(newSale);
  console.log("Recorded new sale:", newSale);
  // Deduct stock (simplified)
  for (const item of newSale.items) {
    const product = mockProducts.find(p => p.id === item.productId);
    if (product) {
      product.quantityInStock -= item.quantity;
    }
  }
  return { success: "Sale recorded successfully!", sale: newSale };
}

// Placeholder for other actions
export async function updateProduct(productId: string, formData: FormData) { console.log(productId, formData); return { success: "Not implemented" }; }
export async function deleteProduct(productId: string) { console.log(productId); return { success: "Not implemented" }; }
export async function recordPurchase(purchaseData: Omit<Purchase, 'id' | 'createdAt'>) { console.log(purchaseData); return { success: "Not implemented" }; }
export async function getUsers() { return []; }
export async function addUser(userData: any) { console.log(userData); return { success: "Not implemented" }; }
export async function updateUserRole(userId: string, newRole: any) { console.log(userId, newRole); return { success: "Not implemented" }; }
export async function deleteUser(userId: string) { console.log(userId); return { success: "Not implemented" }; }
export async function generateMonthlyReport(month: number, year: number) { console.log(month, year); return { success: "Not implemented" }; }
export async function loginAdmin(formData: FormData) { console.log(formData); return { success: "Not implemented, redirecting...", redirect: "/admin/dashboard" }; }
export async function registerCustomer(formData: FormData) { console.log(formData); return { success: "Not implemented" }; }
export async function loginCustomer(formData: FormData) { console.log(formData); return { success: "Not implemented, redirecting...", redirect: "/products" }; }

