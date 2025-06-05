'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, BarChart3, AlertTriangle, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Report } from '@/lib/types'; // Assuming Report type includes income statement data
import { generateMonthlyReport } from '@/lib/actions'; // Action to generate report

// Mock data for already generated reports (replace with actual data fetching)
const mockGeneratedReports: Report[] = [
  {
    id: 'report_2024_06',
    month: 6,
    year: 2024,
    salesData: [], // Simplified
    purchasesData: [], // Simplified
    incomeStatementData: { revenue: 15000, costOfGoodsSold: 7000, grossProfit: 8000, operatingExpenses: 2500, netIncome: 5500 },
    generatedAt: new Date(2024, 6, 1).toISOString(),
    downloadUrl: '/reports/june_2024_summary.pdf',
  },
  {
    id: 'report_2024_05',
    month: 5,
    year: 2024,
    salesData: [],
    purchasesData: [],
    incomeStatementData: { revenue: 12500, costOfGoodsSold: 6000, grossProfit: 6500, operatingExpenses: 2200, netIncome: 4300 },
    generatedAt: new Date(2024, 5, 1).toISOString(),
    downloadUrl: '/reports/may_2024_summary.pdf',
  }
];


export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>( (new Date().getMonth()).toString() ); // Default to previous month
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [generatedReports, setGeneratedReports] = useState<Report[]>(mockGeneratedReports);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  // Effect to check for end-of-month notification
  useEffect(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() === lastDayOfMonth) {
      // Check if report for current month & year is already generated
      const reportExists = generatedReports.some(r => r.month === (today.getMonth() + 1) && r.year === today.getFullYear());
      if (!reportExists) {
        toast({
          title: "Monthly Report Ready",
          description: `The report for ${months[today.getMonth()].label} ${today.getFullYear()} is ready to be generated and downloaded.`,
          variant: "default",
          duration: 10000, // 10 seconds
          action: <Button onClick={() => handleGenerateReport()}>Generate Now</Button>
        });
      }
    }
  }, [generatedReports, months, toast]);


  const handleGenerateReport = async () => {
    setIsGenerating(true);
    toast({ title: "Generating Report...", description: `Compiling data for ${months.find(m=>m.value === selectedMonth)?.label} ${selectedYear}.`});
    try {
      // Simulate API call
      // const reportData = await generateMonthlyReport(parseInt(selectedMonth), parseInt(selectedYear));
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      
      const newReport: Report = {
        id: `report_${selectedYear}_${selectedMonth.padStart(2, '0')}`,
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
        salesData: [], // Populate with actual data
        purchasesData: [], // Populate with actual data
        incomeStatementData: { // Placeholder data
          revenue: Math.random() * 20000 + 5000,
          costOfGoodsSold: Math.random() * 10000 + 2000,
          grossProfit: 0, // Will be calculated
          operatingExpenses: Math.random() * 3000 + 1000,
          netIncome: 0, // Will be calculated
        },
        generatedAt: new Date().toISOString(),
        downloadUrl: `/reports/report_${selectedYear}_${selectedMonth.padStart(2, '0')}.pdf` // Simulated
      };
      newReport.incomeStatementData.grossProfit = newReport.incomeStatementData.revenue - newReport.incomeStatementData.costOfGoodsSold;
      newReport.incomeStatementData.netIncome = newReport.incomeStatementData.grossProfit - newReport.incomeStatementData.operatingExpenses;

      setGeneratedReports(prev => [newReport, ...prev.filter(r => !(r.month === newReport.month && r.year === newReport.year))]);
      toast({ title: "Report Generated", description: `Report for ${months.find(m=>m.value === selectedMonth)?.label} ${selectedYear} is ready.` });
    } catch (error) {
      toast({ title: "Error Generating Report", description: "Could not generate the report. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (url?: string) => {
    if (!url) {
      toast({ title: "Error", description: "Download URL not available.", variant: "destructive"});
      return;
    }
    toast({ title: "Downloading Report", description: `Starting download for ${url}...` });
    // Simulate download
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Financial Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate Monthly Report</CardTitle>
          <CardDescription>Select a month and year to compile a comprehensive financial report, including an income statement.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger id="month" aria-label="Select month">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger id="year" aria-label="Select year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full sm:w-auto">
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>Download previously generated monthly reports and income statements.</CardDescription>
        </CardHeader>
        <CardContent>
          {generatedReports.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No reports generated yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the section above to generate your first monthly report.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {generatedReports.map(report => (
                <li key={report.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {months.find(m => m.value === report.month.toString())?.label} {report.year} Report
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Generated on: {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                    <div className="text-sm mt-1">
                      Revenue: ${report.incomeStatementData.revenue.toFixed(2)} | 
                      Net Income: <span className={report.incomeStatementData.netIncome >= 0 ? 'text-accent' : 'text-destructive'}>${report.incomeStatementData.netIncome.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button variant="outline" size="sm" onClick={() => alert(`Displaying income statement for ${report.id}. \nRevenue: $${report.incomeStatementData.revenue.toFixed(2)}\nCOGS: $${report.incomeStatementData.costOfGoodsSold.toFixed(2)}\nGross Profit: $${report.incomeStatementData.grossProfit.toFixed(2)}\nExpenses: $${report.incomeStatementData.operatingExpenses.toFixed(2)}\nNet Income: $${report.incomeStatementData.netIncome.toFixed(2)}`)}>
                      <BarChart3 className="mr-2 h-4 w-4" /> View Income Statement
                    </Button>
                    <Button size="sm" onClick={() => handleDownloadReport(report.downloadUrl)} disabled={!report.downloadUrl}>
                      <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
       <Card className="mt-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <CardTitle className="text-yellow-700 dark:text-yellow-300">Important Note</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700 dark:text-yellow-400">
          <p>Automated end-of-month report compilation and notifications are simulated. In a production environment, this would be handled by a scheduled background task (e.g., cron job or serverless function).</p>
          <p className="mt-2">The income statement data provided is a simplified skeleton. A comprehensive financial statement would require more detailed expense tracking and accounting practices.</p>
        </CardContent>
      </Card>
    </div>
  );
}
