'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, PackageSearch, Loader2, AlertTriangle, Filter } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getProducts } from '@/lib/actions'; // Assuming this action fetches products
import { useToast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";


const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name_asc');
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchProductsData() {
      setIsLoading(true);
      try {
        const productsData = await getProducts();
        setAllProducts(productsData);
        setFilteredProducts(productsData); // Initially show all
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch products.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProductsData();
  }, [toast]);

  useEffect(() => {
    let productsToFilter = [...allProducts];

    // Filter by search term
    if (searchTerm) {
      productsToFilter = productsToFilter.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      productsToFilter = productsToFilter.filter(p => p.category === categoryFilter);
    }

    // Sort products
    productsToFilter.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
    
    setFilteredProducts(productsToFilter);
    setCurrentPage(1); // Reset to first page on filter/sort change
  }, [searchTerm, categoryFilter, sortBy, allProducts]);

  const uniqueCategories = ['all', ...new Set(allProducts.map(p => p.category).filter(Boolean) as string[])];

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
     window.scrollTo(0, 0); // Scroll to top on page change
  };


  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Explore Our Products</h1>
        <p className="mt-2 text-lg text-muted-foreground">Find the latest hardware and accessories.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 items-end">
        <Input
          type="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2 lg:col-span-2"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger aria-label="Sort by">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            <SelectItem value="price_asc">Price (Low to High)</SelectItem>
            <SelectItem value="price_desc">Price (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="text-center py-20">
          <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">No Products Found</h3>
          <p className="mt-1 text-muted-foreground">
            {searchTerm || categoryFilter !== 'all' ? "Try adjusting your search or filters." : "There are no products available at the moment."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProducts.map((product) => (
              <Card key={product.id} className="flex flex-col overflow-hidden transition-all hover:shadow-xl">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative w-full h-56 bg-muted">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                        data-ai-hint="product image"
                      />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <PackageSearch className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {product.quantityInStock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-xl bg-destructive px-3 py-1 rounded">SOLD OUT!</span>
                      </div>
                    )}
                  </div>
                </Link>
                <CardHeader className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <CardTitle className="text-lg hover:text-primary truncate">{product.name}</CardTitle>
                  </Link>
                  <CardDescription className="text-sm h-10 overflow-hidden text-ellipsis">
                    {product.description || 'No description available.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xl font-semibold text-primary">${product.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.quantityInStock > 0 ? `${product.quantityInStock} in stock` : 'Out of stock'}
                  </p>
                </CardContent>
                <CardFooter className="p-4 mt-auto">
                  <Button asChild className="w-full" disabled={product.quantityInStock === 0}>
                    <Link href={`/products/${product.id}`}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.quantityInStock > 0 ? 'View Details' : 'Out of Stock'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination className="mt-12">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); if(currentPage > 1) handlePageChange(currentPage - 1); }}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Basic pagination display logic (can be improved for many pages)
                  if (totalPages <= 5 || page === 1 || page === totalPages || (page >= currentPage -1 && page <= currentPage + 1)) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if ((page === currentPage - 2 && currentPage > 3) || (page === currentPage + 2 && currentPage < totalPages - 2 )) {
                     return <PaginationEllipsis key={`ellipsis-${page}`} />;
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) handlePageChange(currentPage + 1); }}
                    aria-disabled={currentPage === totalPages}
                     className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
