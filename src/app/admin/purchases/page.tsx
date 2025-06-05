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
import { FileDown, Search, Truck, Filter, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Purchase } from '@/lib/types';
import { getPurchases, recordPurchase } from '@/lib/actions'; // Assuming these actions exist
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming this component exists
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // For multi-item input

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAddPurchaseDialogOpen, setIsAddPurchaseDialogOpen] = useState(false);
  // Form state for new purchase
  const [newPurchaseSupplier, setNewPurchaseSupplier] = useState('');
  const [newPurchaseItems, setNewPurchaseItems] = useState([{ productName: '', quantity: 1, unitCost: 0 }]); // Array for multiple items
  
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPurchases() {
      setIsLoading(true);
      try {
        const fetchedPurchases = await getPurchases(dateRange ? { from: dateRange.from!, to: dateRange.to! } : undefined);
        setPurchases(fetchedPurchases);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch purchase data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPurchases();
  }, [dateRange, toast]);

  const filteredPurchases = purchases.filter(purchase =>
    purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportPdf = (range?: string) => {
    console.log(`Exporting ${range || 'selected range/all'} purchase data as PDF...`);
    toast({ title: "Exporting PDF", description: `Preparing purchase data for PDF export.` });
  };
  
  const handleAddItemToPurchase = () => {
    setNewPurchaseItems([...newPurchaseItems, { productName: '', quantity: 1, unitCost: 0 }]);
  };

  const handleRemoveItemFromPurchase = (index: number) => {
    const items = [...newPurchaseItems];
    items.splice(index, 1);
    setNewPurchaseItems(items);
  };
  
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const items = [...newPurchaseItems];
    if (field === 'productName') items[index].productName = value as string;
    if (field === 'quantity') items[index].quantity = Number(value);
    if (field === 'unitCost') items[index].unitCost = Number(value);
    setNewPurchaseItems(items);
  };

  const handleAddPurchase = async () => {
    if (!newPurchaseSupplier || newPurchaseItems.some(item => !item.productName || item.quantity <= 0 || item.unitCost <=0)) {
      toast({ title: "Error", description: "Please fill all fields for supplier and items.", variant: "destructive" });
      return;
    }

    const purchaseData = {
      items: newPurchaseItems.map(item => ({...item, totalCost: item.quantity * item.unitCost})),
      supplier: newPurchaseSupplier,
      totalCost: newPurchaseItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0),
      purchaseDate: new Date().toISOString(),
    };

    try {
      // @ts-ignore
      const result = await recordPurchase(purchaseData); // recordPurchase needs to be defined in actions.ts
      if (result.success) {
        toast({ title: "Success", description: "Purchase recorded successfully." });
        // @ts-ignore // Assuming result.purchase exists
        setPurchases(prev => [...prev, result.purchase]);
        setIsAddPurchaseDialogOpen(false);
        // Reset form
        setNewPurchaseSupplier('');
        setNewPurchaseItems([{ productName: '', quantity: 1, unitCost: 0 }]);
      } else {
        toast({ title: "Error", description: result.error || "Failed to record purchase.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-semibold">Purchase Records</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={isAddPurchaseDialogOpen} onOpenChange={setIsAddPurchaseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record New Purchase</DialogTitle>
                <DialogDescription>Enter details for the new purchase order.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid gap-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input id="supplier" value={newPurchaseSupplier} onChange={(e) => setNewPurchaseSupplier(e.target.value)} placeholder="Supplier Name" />
                </div>
                
                {newPurchaseItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 items-end gap-2 border p-2 rounded-md relative">
                     <div className="col-span-4 sm:col-span-2 grid gap-1">
                      <Label htmlFor={`productName-${index}`}>Product Name</Label>
                      <Input id={`productName-${index}`} value={item.productName} onChange={(e) => handleItemChange(index, 'productName', e.target.value)} placeholder="Product Name" />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                      <Input id={`quantity-${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" />
                    </div>
                     <div className="grid gap-1">
                      <Label htmlFor={`unitCost-${index}`}>Unit Cost</Label>
                      <Input id={`unitCost-${index}`} type="number" step="0.01" value={item.unitCost} onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)} placeholder="Cost" />
                    </div>
                    {newPurchaseItems.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItemFromPurchase(index)} className="absolute top-1 right-1 h-6 w-6 sm:relative sm:top-0 sm:right-0 sm:self-end">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                 <Button type="button" variant="outline" onClick={handleAddItemToPurchase} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
                </Button>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddPurchaseDialogOpen(false)}>Cancel</Button>
                <Button type="button" onClick={handleAddPurchase}>Save Purchase</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <DropdownMenuItem onSelect={() => handleExportPdf('all_time')}>All Purchases</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search purchases by ID, supplier, or product..."
          className="w-full rounded-lg bg-background pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchases History</CardTitle>
          <CardDescription>
            Detailed list of all purchase orders. Filter by date range and search.
             {dateRange?.from && (
               <span className="block mt-1 text-xs">
                 Displaying purchases from {format(dateRange.from, "LLL dd, y")}
                 {dateRange.to && ` to ${format(dateRange.to, "LLL dd, y")}`}
               </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading purchase data...</p>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-10">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No purchases found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                 {searchTerm || dateRange ? "Try adjusting your search or date range." : "No purchases have been recorded yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purchase ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.id}</TableCell>
                    <TableCell>{format(new Date(purchase.purchaseDate), "PP")}</TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>
                      {purchase.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                    </TableCell>
                    <TableCell>${purchase.totalCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <Filter className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {/* More actions like Edit/Delete if applicable */}
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
