'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft, PackageSearch, Loader2, AlertTriangle } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getProductById } from '@/lib/data'; // Using mock data getter
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// This component would typically fetch data based on `params.id`
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for loading, null for not found
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching product data
    const fetchedProduct = getProductById(params.id); // Using mock data accessor
    if (fetchedProduct) {
      setProduct(fetchedProduct);
    } else {
      setProduct(null); // Product not found
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.quantityInStock === 0) {
      toast({ title: "Out of Stock", description: `${product.name} is currently out of stock.`, variant: "destructive"});
      return;
    }
    if (quantity > product.quantityInStock) {
      toast({ title: "Not Enough Stock", description: `Only ${product.quantityInStock} units of ${product.name} available.`, variant: "destructive"});
      return;
    }
    // Placeholder for actual cart logic
    console.log(`Added ${quantity} of ${product.name} to cart.`);
    toast({
      title: `${product.name} Added to Cart!`,
      description: `${quantity} unit(s) added.`,
      action: <Button variant="outline" size="sm" asChild><Link href="/cart">View Cart</Link></Button>
    });
  };

  if (product === undefined) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="container py-12 text-center min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
        <PackageSearch className="h-24 w-24 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">Sorry, we couldn't find the product you're looking for.</p>
        <Button asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>
      </Button>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority // Prioritize loading main product image
              data-ai-hint="product item detail"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <PackageSearch className="w-24 h-24 text-gray-400" />
            </div>
          )}
           {product.quantityInStock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-2xl bg-destructive px-4 py-2 rounded">SOLD OUT!</span>
            </div>
          )}
        </div>
        <div>
          {product.category && <Badge variant="outline" className="mb-2">{product.category}</Badge>}
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">{product.name}</h1>
          <p className="text-2xl lg:text-3xl font-semibold text-primary mb-4">${product.price.toFixed(2)}</p>
          
          <Separator className="my-6" />

          <CardDescription className="text-base leading-relaxed mb-6">
            {product.description || 'No detailed description available for this product.'}
          </CardDescription>
          
          {product.supplier && <p className="text-sm text-muted-foreground mb-1">Supplier: {product.supplier}</p>}
          <p className={`text-sm font-medium mb-6 ${product.quantityInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.quantityInStock > 0 ? `${product.quantityInStock} units in stock` : 'Currently out of stock'}
          </p>

          {product.quantityInStock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label htmlFor="quantity" className="font-medium">Quantity:</label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.quantityInStock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, product.quantityInStock)))}
                className="w-20 h-10 text-center"
              />
            </div>
          )}

          <Button 
            size="lg" 
            className="w-full md:w-auto" 
            onClick={handleAddToCart}
            disabled={product.quantityInStock === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.quantityInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          {product.quantityInStock > 0 && product.quantityInStock <= 5 && (
             <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md flex items-center gap-2 text-sm">
                <AlertTriangle className="h-5 w-5"/>
                Only {product.quantityInStock} items left in stock! Order soon.
            </div>
          )}

        </div>
      </div>

      {/* Potential section for related products or specifications */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Product Specifications</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong>ID:</strong> {product.id}</li>
              <li><strong>Category:</strong> {product.category || 'N/A'}</li>
              <li><strong>Price:</strong> ${product.price.toFixed(2)}</li>
              <li><strong>Supplier:</strong> {product.supplier || 'N/A'}</li>
              {/* Add more specifications as needed */}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
