"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  Plus,
  Search,
  BarChart3,
  ChevronLeft,
  HeartHandshake,
  User,
  Crown,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function ModernSidebar({ collapsed, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const { userData } = useUser();

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 280 }}
      className={`${isMobile ? 'h-full' : 'sticky top-0 h-screen'} border-r bg-background flex flex-col`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-muted grid place-items-center">
            <HeartHandshake className="h-6 w-6 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-semibold text-lg leading-tight text-foreground">Hair Transplant</div>
              <div className="font-semibold text-lg leading-tight text-foreground">CRM</div>
              <div className="text-sm text-muted-foreground mt-1">Your decision co‑pilot</div>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle} 
          aria-label={isMobile ? "Close menu" : "Toggle sidebar"}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {isMobile ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="px-3 space-y-1 mt-2 flex-1">
        <SideItem 
          icon={Home} 
          label="Dashboard" 
          collapsed={collapsed} 
          active={pathname === "/" || pathname === "/modern"} 
          href="/"
          subtitle="Overview & analytics"
        />
        <SideItem 
          icon={Plus} 
          label="Add Surgeon" 
          collapsed={collapsed} 
          active={pathname === "/add-surgeon"}
          href="/add-surgeon"
          subtitle="Register new surgeon"
        />
        <SideItem 
          icon={Search} 
          label="Find Surgeons" 
          collapsed={collapsed} 
          active={pathname === "/find-surgeons"}
          href="/find-surgeons"
          subtitle="Search directory"
        />
        <SideItem 
          icon={BarChart3} 
          label="Analytics" 
          collapsed={collapsed} 
          active={pathname === "/analytics"}
          href="/analytics"
          subtitle="Performance metrics"
        />
      </nav>

      {/* Profile Section */}
      <div className="px-3 pb-4 mt-auto">
        <div className="border-t pt-4">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full h-12 p-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{user?.displayName || user?.email?.split('@')[0] || 'User'}</div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Credits</span>
                        <Badge variant="secondary">{userData?.credits || 0}</Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/credits" className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Upgrade Plan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logOut()} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-muted">
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-sm truncate">
                        {user?.displayName || user?.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          Credits: {userData?.credits || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{user?.displayName || user?.email?.split('@')[0] || 'User'}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/credits" className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Upgrade Plan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logOut()} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

    </motion.aside>
  );
}

function SideItem({ 
  icon: Icon, 
  label, 
  collapsed, 
  active, 
  href,
  subtitle 
}: { 
  icon: any; 
  label: string; 
  collapsed: boolean; 
  active?: boolean;
  href: string;
  subtitle?: string;
}) {
  const content = (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
      active 
        ? "bg-muted text-foreground" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{label}</span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      )}
      {collapsed && <span className="sr-only">{label}</span>}
    </div>
  );

  const linkContent = (
    <Link href={href} className="w-full text-left">
      {content}
    </Link>
  );

  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>
        {linkContent}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  ) : (
    linkContent
  );
}