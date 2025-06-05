import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist to Inter
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const inter = Inter({ // Changed from geistSans to inter
  subsets: ['latin'],
  variable: '--font-sans', // Using --font-sans for Inter
});

export const metadata: Metadata = {
  title: 'StockPilot - Hardware Management System', // Updated title
  description: 'Efficiently manage your hardware inventory, sales, and purchases with StockPilot.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}> {/* Using inter variable and font-sans */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
