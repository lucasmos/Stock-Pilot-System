'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, Search, ShoppingCart, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Sale } from '@/lib/types';
import { getSales } from '@/lib/actions'; // Assuming this action exists
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming this component exists or will be created
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSales() {
      setIsLoading(true);
      try {
        // Pass dateRange to getSales if it's defined
        const fetchedSales = await getSales(dateRange ? {from: dateRange.from!, to: dateRange.to!} : undefined);
        setSales(fetchedSales);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch sales data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSales();
  }, [dateRange, toast]);

  const filteredSales = sales.filter(sale =>
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sale.transactionId && sale.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportPdf = (range?: string) => {
    console.log(`Exporting ${range || 'selected range/all'} sales data as PDF...`);
    toast({ title: "Exporting PDF", description: `Preparing sales data for PDF export.` });
    // Actual PDF generation logic would go here, considering the dateRange and searchTerm
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-semibold">Sales Records</h1>
        <div className="flex gap-2 w-full sm:w-auto">
           <DateRangePicker date={dateRange} onDateChange={setDateRange} />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <FileDown className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Export Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleExportPdf('current_view')}>Current View</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExportPdf('all_time')}>All Sales Data</DropdownMenuItem>
              {/* Custom range might involve a modal or further inputs */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search sales by ID, product, or transaction ID..."
          className="w-full rounded-lg bg-background pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>
            Detailed list of all sales transactions. Filter by date range and search.
            {dateRange?.from && (
               <span className="block mt-1 text-xs">
                 Displaying sales from {format(dateRange.from, "LLL dd, y")}
                 {dateRange.to && ` to ${format(dateRange.to, "LLL dd, y")}`}
               </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading sales data...</p>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No sales found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || dateRange ? "Try adjusting your search or date range." : "No sales have been recorded yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Transaction ID</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>{format(new Date(sale.createdAt), "PPpp")}</TableCell>
                    <TableCell>
                      {sale.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                    </TableCell>
                    <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{sale.paymentMethod}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        sale.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sale.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{sale.transactionId || 'N/A'}</TableCell>
                    <TableCell>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <Filter className="h-4 w-4" /> {/* Using Filter icon as placeholder */}
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {sale.receiptUrl && <DropdownMenuItem onClick={() => window.open(sale.receiptUrl, '_blank')}>Download Receipt</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
