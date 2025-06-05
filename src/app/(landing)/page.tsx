import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, BarChartBig, Briefcase, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-teal-50 dark:from-slate-900 dark:to-teal-900">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">StockPilot</span>
          </Link>
          <nav className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Customer Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/dashboard">Admin Portal</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Manage Your Hardware Inventory <span className="block text-primary xl:inline">Smarter, Not Harder.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            StockPilot offers a comprehensive suite of tools to streamline your hardware inventory, sales, and purchasing processes. Focus on growth, let us handle the logistics.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/products">
                Browse Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
           <div className="mt-16 relative">
            <Image 
              src="https://picsum.photos/seed/dashboardmockup/1200/600" 
              alt="StockPilot Dashboard Mockup"
              width={1200}
              height={600}
              className="rounded-lg shadow-2xl mx-auto"
              data-ai-hint="dashboard interface"
              priority
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Powerful Features, Seamless Experience</h2>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">Everything you need to manage your hardware business efficiently.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Inventory Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Track stock levels, sales, and purchases with precision. Export data to PDF with custom date ranges.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">EPOS System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Modern EPOS with cash, MPESA, and Airtel Money. Automated receipts and product image generation.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <BarChartBig className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Data & Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Interactive dashboards, automated monthly reports, and downloadable income statements.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                   <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Delegate tasks with role-based access control. Secure admin and customer portals.</p>
                </CardContent>
              </Card>
               <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                   <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Secure & Reliable</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Built with modern technology, including Supabase for data storage and Google OAuth for easy customer sign-in.</p>
                </CardContent>
              </Card>
               <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                   <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Customer Portal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Easy product browsing, ordering, and real-time stock availability for your customers.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} StockPilot. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
