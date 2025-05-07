'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MinusCircle, XCircle, DollarSign, CreditCard, Smartphone, Printer, Loader2, PackageSearch } from 'lucide-react';
import type { Product, CartItem, Sale } from '@/lib/types';
import { getProducts, processMpesaPayment, processAirtelMoneyPayment, recordSale } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EposPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'airtelmoney'>('cash');
  const [phoneNumber, setPhoneNumber] = useState(''); // For MPESA/Airtel Money
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isProcessingPayment, startProcessingPayment] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      setIsLoadingProducts(true);
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch products.", variant: "destructive" });
      } finally {
        setIsLoadingProducts(false);
      }
    }
    fetchProducts();
  }, [toast]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.quantityInStock) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast({ title: "Stock Limit", description: `Cannot add more ${product.name}. Max stock reached.`, variant: "destructive" });
          return prevCart;
        }
      } else {
         if (product.quantityInStock > 0) {
            return [...prevCart, { ...product, quantity: 1 }];
         } else {
            toast({ title: "Out of Stock", description: `${product.name} is out of stock.`, variant: "destructive" });
            return prevCart;
         }
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const productInStock = products.find(p => p.id === productId);
    if (!productInStock) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, Math.min(newQuantity, productInStock.quantityInStock)) }
          : item
      )
    );
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.quantityInStock > 0
  );

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast({ title: "Empty Cart", description: "Please add items to the cart before proceeding to payment.", variant: "destructive" });
      return;
    }

    if ((paymentMethod === 'mpesa' || paymentMethod === 'airtelmoney') && !phoneNumber) {
      toast({ title: "Phone Number Required", description: `Please enter a phone number for ${paymentMethod} payment.`, variant: "destructive" });
      return;
    }

    startProcessingPayment(async () => {
      let paymentResult: { success: boolean; message: string; transactionId?: string, checkoutRequestId?: string, receiptUrl?: string };
      const saleItems = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      }));
      const saleData: Omit<Sale, 'id' | 'createdAt' | 'paymentStatus' | 'receiptUrl'> = {
          items: saleItems,
          totalAmount: cartTotal,
          paymentMethod: paymentMethod,
      };

      try {
        if (paymentMethod === 'mpesa') {
          paymentResult = await processMpesaPayment(phoneNumber, cartTotal, `ORDER-${Date.now()}`);
        } else if (paymentMethod === 'airtelmoney') {
          paymentResult = await processAirtelMoneyPayment(phoneNumber, cartTotal, `ORDER-${Date.now()}`);
        } else { // Cash
          paymentResult = { success: true, message: "Cash payment successful." };
        }

        if (paymentResult.success) {
          // Record the sale
          const recordedSale = await recordSale({
            ...saleData,
            paymentStatus: 'paid',
            transactionId: paymentResult.transactionId || paymentResult.checkoutRequestId,
            // Simulate receipt generation
            receiptUrl: `/receipts/sale_${Date.now()}.pdf` // Placeholder
          });

          if (recordedSale.success && recordedSale.sale) {
            toast({ title: "Payment Successful", description: paymentResult.message });
            setCart([]);
            setPhoneNumber('');
             // TODO: Implement actual receipt generation and download/display
            toast({ title: "Receipt Generated", description: `Receipt for sale ${recordedSale.sale.id} is available. (Simulated)`, 
              action: <Button variant="outline" size="sm" onClick={() => alert(`Downloading receipt: ${recordedSale.sale?.receiptUrl}`)}>Download</Button> 
            });
          } else {
             toast({ title: "Sale Recording Failed", description: recordedSale.error || "Could not record the sale.", variant: "destructive" });
          }
        } else {
          toast({ title: "Payment Failed", description: paymentResult.message, variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Payment Error", description: "An unexpected error occurred during payment.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-120px)]"> {/* Adjust height as needed */}
      {/* Product List */}
      <Card className="md:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle>Available Products</CardTitle>
          <Input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2"
          />
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4"> {/* Added pr-4 for scrollbar space */}
            {isLoadingProducts ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
               <div className="text-center py-10 h-full flex flex-col justify-center items-center">
                  <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Products Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ? "Try a different search term." : "No products available or all are out of stock."}
                  </p>
                </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => addToCart(product)}>
                    <div className="relative w-full h-32 sm:h-40">
                      <Image
                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200/200`}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                        data-ai-hint="product item"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                      <p className="text-sm font-bold mt-1">${product.price.toFixed(2)}</p>
                       <p className="text-xs text-muted-foreground">Stock: {product.quantityInStock}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Cart and Payment */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Current Sale</CardTitle>
          <CardDescription>Review items and complete payment.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {cart.length === 0 ? (
              <div className="text-center py-10 h-full flex flex-col justify-center items-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Your cart is empty.</p>
                <p className="text-xs text-muted-foreground">Add products from the list.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium truncate w-2/5">{item.name}</TableCell>
                      <TableCell className="text-center w-1/5">
                        <div className="flex items-center justify-center">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))} className="w-12 h-8 text-center mx-1" />
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.quantityInStock}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right w-1/5">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-right w-1/5">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.id)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-4">
          <div className="flex justify-between w-full text-lg font-semibold">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <Select value={paymentMethod} onValueChange={(value: 'cash' | 'mpesa' | 'airtelmoney') => setPaymentMethod(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash"><DollarSign className="inline mr-2 h-4 w-4" />Cash</SelectItem>
              <SelectItem value="mpesa"><Smartphone className="inline mr-2 h-4 w-4" />MPESA</SelectItem>
              <SelectItem value="airtelmoney"><CreditCard className="inline mr-2 h-4 w-4" />Airtel Money</SelectItem>
            </SelectContent>
          </Select>
          {(paymentMethod === 'mpesa' || paymentMethod === 'airtelmoney') && (
            <Input
              type="tel"
              placeholder="Enter Phone Number (e.g., 2547...)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <Button className="w-full" size="lg" disabled={cart.length === 0 || isProcessingPayment}>
                {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" /> }
                Process Payment
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to process a payment of <strong>${cartTotal.toFixed(2)}</strong> via <strong>{paymentMethod}</strong>.
                  { (paymentMethod === 'mpesa' || paymentMethod === 'airtelmoney') && ` An STK push will be sent to ${phoneNumber}.`}
                  <br />Do you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isProcessingPayment}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handlePayment} disabled={isProcessingPayment}>
                  {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm & Pay
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
