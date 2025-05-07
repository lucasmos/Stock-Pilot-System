'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, DollarSign, ShoppingCart, Archive, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Sale, Purchase } from '@/lib/types';
import { mockSales, mockPurchases } from '@/lib/data'; // Using mock data

type ChartDataPoint = {
  name: string;
  sales?: number;
  purchases?: number;
  profit?: number;
};

const aggregateDataByMonth = (sales: Sale[], purchases: Purchase[]): ChartDataPoint[] => {
  const dataMap = new Map<string, ChartDataPoint>();

  const processItems = (items: (Sale | Purchase)[], type: 'sales' | 'purchases') => {
    items.forEach(item => {
      const date = new Date(item.createdAt);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!dataMap.has(monthYear)) {
        dataMap.set(monthYear, { name: monthYear, sales: 0, purchases: 0 });
      }
      
      const entry = dataMap.get(monthYear)!;
      if (type === 'sales') {
        entry.sales = (entry.sales || 0) + (item as Sale).totalAmount;
      } else {
        entry.purchases = (entry.purchases || 0) + (item as Purchase).totalCost;
      }
    });
  };

  processItems(sales, 'sales');
  processItems(purchases, 'purchases');

  // Sort by date for chronological chart
  const sortedData = Array.from(dataMap.values()).sort((a, b) => new Date(a.name) > new Date(b.name) ? 1 : -1);
  
  // Calculate profit
  return sortedData.map(d => ({ ...d, profit: (d.sales || 0) - (d.purchases || 0) }));
};

const chartConfig = {
  sales: { label: 'Sales', color: 'hsl(var(--chart-1))' },
  purchases: { label: 'Purchases', color: 'hsl(var(--chart-2))' },
  profit: { label: 'Profit', color: 'hsl(var(--chart-3))' },
};

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<string>('last_3_months');
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [purchasesData, setPurchasesData] = useState<Purchase[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    // Simulate fetching data based on timeRange
    // In a real app, you'd call lib/actions.ts functions here
    const now = new Date();
    let fromDate = new Date();

    switch (timeRange) {
      case 'last_7_days':
        fromDate.setDate(now.getDate() - 7);
        break;
      case 'last_30_days':
        fromDate.setDate(now.getDate() - 30);
        break;
      case 'last_3_months':
        fromDate.setMonth(now.getMonth() - 3);
        break;
      case 'all_time':
      default:
        fromDate = new Date(0); // Epoch time for all data
        break;
    }

    const filteredSales = mockSales.filter(s => new Date(s.createdAt) >= fromDate);
    const filteredPurchases = mockPurchases.filter(p => new Date(p.createdAt) >= fromDate);
    
    setSalesData(filteredSales);
    setPurchasesData(filteredPurchases);
    setChartData(aggregateDataByMonth(filteredSales, filteredPurchases));
  }, [timeRange]);

  const totalSales = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPurchases = purchasesData.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  const totalProfit = totalSales - totalPurchases;
  const totalItemsSold = salesData.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month (mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPurchases.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+10.5% from last month (mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-accent' : 'text-destructive'}`}>
              ${totalProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalProfit >=0 ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />}
              Compared to last month (mock)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItemsSold}</div>
            <p className="text-xs text-muted-foreground">+50 items this week (mock)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales & Purchases Overview</CardTitle>
            <CardDescription>Monthly sales and purchases trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="sales" fill="var(--chart-1)" radius={4}>
                     <LabelList dataKey="sales" position="top" formatter={(value: number) => `$${value.toFixed(0)}`} />
                  </Bar>
                  <Bar dataKey="purchases" fill="var(--chart-2)" radius={4}>
                    <LabelList dataKey="purchases" position="top" formatter={(value: number) => `$${value.toFixed(0)}`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
            <CardDescription>Monthly profit over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="profit" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
