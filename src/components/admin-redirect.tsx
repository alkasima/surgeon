"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function AdminRedirect() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if user is logged in, not loading, and is admin
    if (!loading && user && isAdmin) {
      // Don't redirect if already on admin pages or auth pages
      const isOnAdminPage = pathname.startsWith('/admin');
      const isOnAuthPage = pathname === '/login' || pathname === '/signup';
      const isOnRoot = pathname === '/';

      if (!isOnAdminPage && !isOnAuthPage && isOnRoot) {
        // Redirect to admin dashboard
        router.push('/admin/users');
      }
    }
  }, [user, isAdmin, loading, pathname, router]);

  return null; // This component doesn't render anything
}
