
// src/app/admin/layout.tsx
"use client";

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout'; // Assuming MainLayout handles overall structure

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login'); // Not logged in, redirect to login
      } else if (!isAdmin) {
        router.push('/'); // Logged in but not admin, redirect to dashboard
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-1 justify-center items-center h-[calc(100vh-theme(spacing.16))]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return <>{children}</>; // Children are rendered within MainLayout by their respective page.tsx
}
