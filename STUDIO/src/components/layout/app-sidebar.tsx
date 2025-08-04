
// src/components/layout/app-sidebar.tsx
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, LayoutDashboard, Search } from 'lucide-react';
import { FollicleFlowLogo } from '@/components/icons';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth-context';

const userNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/add-surgeon', label: 'Add Surgeon', icon: PlusCircle },
  { href: '/find-surgeons', label: 'Find Surgeons', icon: Search },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (!user && !loading) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="items-center justify-center p-4 group-data-[collapsible=icon]:justify-center">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <FollicleFlowLogo className="h-8 w-auto text-primary group-data-[collapsible=icon]:h-6" />
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">FollicleFlow</span>
        </Link>
        <div className="ml-auto group-data-[collapsible=icon]:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {userNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden truncate">{item.label}</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 items-center group-data-[collapsible=icon]:justify-center">
        <div className="group-data-[collapsible=icon]:hidden text-xs text-muted-foreground">
          © {new Date().getFullYear()} FollicleFlow
        </div>
        <div className="hidden group-data-[collapsible=icon]:block text-xs text-muted-foreground">
          FF
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
