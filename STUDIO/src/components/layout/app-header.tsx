
// src/components/layout/app-header.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, UserCircle, LogOut, Loader2 } from "lucide-react"; // Added Loader2
import Link from "next/link";
import { FollicleFlowLogo } from "@/components/icons";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; 
import { useAuth } from '@/contexts/auth-context';

export function AppHeader() {
  const { isMobile } = useSidebar();
  const { user, logOut, loading: authLoading } = useAuth(); // Renamed loading to authLoading for clarity
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {!authLoading && user && isMobile && ( // Only show sidebar trigger if user is logged in on mobile and not loading
         <SidebarTrigger />
      )}
       {(!authLoading && !user && isMobile) && ( // Placeholder for logo or title if no user and mobile and not loading
        <Link href="/" className="flex items-center gap-2">
          <FollicleFlowLogo className="h-7 w-auto text-primary" />
        </Link>
      )}
      <div className="flex-1">
        {!authLoading && user && ( // Only show Dashboard title if user is logged in and not loading
          <h1 className="text-lg font-semibold md:text-xl hidden sm:block">Dashboard</h1>
        )}
        {!authLoading && !user && ( // Show app title if no user and not loading
           <div className="hidden sm:flex items-center gap-2">
             <FollicleFlowLogo className="h-8 w-auto text-primary" />
             <span className="font-bold text-xl">FollicleFlow</span>
           </div>
        )}
      </div>
      <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {authLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : user ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={logOut} title="Logout">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
