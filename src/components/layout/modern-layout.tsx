"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { UserProvider } from "@/contexts/user-context";
import { SurgeonsProvider } from "@/contexts/surgeons-context";
import { ModernSidebar } from "@/components/dashboard/modern-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ModernLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

function ProtectedContent({ children, requireAuth = true }: ModernLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && requireAuth) {
      router.push('/login');
    }
  }, [user, loading, router, requireAuth]);

  if (loading || (requireAuth && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <ModernSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
          </div>

          {/* Mobile Sidebar Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
              <div className="relative flex w-64 flex-col bg-background border-r">
                <ModernSidebar 
                  collapsed={false} 
                  onToggle={() => setMobileMenuOpen(false)}
                  isMobile={true}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 w-full lg:w-auto">
            {/* Mobile Menu Button */}
            <div className="lg:hidden sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
              <div className="flex items-center p-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Page Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function ModernLayout({ children, requireAuth = true }: ModernLayoutProps) {
  return (
    <UserProvider>
      <SurgeonsProvider>
        <ProtectedContent requireAuth={requireAuth}>
          {children}
        </ProtectedContent>
      </SurgeonsProvider>
    </UserProvider>
  );
}