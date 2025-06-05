
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Archive,
  ShoppingCart,
  Truck,
  FileText,
  Users,
  LogOut,
  DollarSign,
  Settings,
  PanelLeftClose, // Added for collapse button
  PanelLeftOpen,  // Added for expand button
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar, // Import useSidebar hook
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/inventory', label: 'Inventory', icon: Archive },
  { href: '/admin/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/admin/purchases', label: 'Purchases', icon: Truck },
  { href: '/admin/epos', label: 'EPOS', icon: DollarSign },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/users', label: 'User Management', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile, toggleSidebar, state: sidebarState } = useSidebar(); // Get sidebar context

  // Function to handle item click for auto-collapsing on mobile
  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 flex justify-between items-center group-data-[collapsible=icon]:justify-center">
        <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={handleItemClick}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">StockPilot</span>
        </Link>
        {/* Desktop sidebar toggle button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
            aria-label={sidebarState === 'expanded' ? "Collapse sidebar" : "Expand sidebar"}
            title={sidebarState === 'expanded' ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarState === 'expanded' ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                  onClick={handleItemClick} // Auto-collapse on mobile
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
         <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://picsum.photos/seed/adminuser/100" alt="Admin User" data-ai-hint="user avatar"/>
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@stockpilot.com</p>
            </div>
          </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 mt-2 group-data-[collapsible=icon]:justify-center">
          <LogOut />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
