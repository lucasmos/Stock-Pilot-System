import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar'; // Path based on existing ui/sidebar
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}> {/* Changed defaultOpen to false */}
      <div className="flex min-h-screen w-full bg-muted/40">
        <AdminSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1"> {/* sm:pl-14 for collapsed sidebar */}
          <AdminHeader />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
