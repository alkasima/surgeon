"use client"

import type React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { useAuth } from "@/contexts/auth-context"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth()

  return (
    <SidebarProvider defaultOpen={true}>
      {user && <AppSidebar />}

      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50">
          <AppHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-900/5 p-4 sm:p-6 lg:p-8 dark:bg-slate-900/60 dark:border-slate-700/60 dark:shadow-slate-900/20">
                {children}
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
