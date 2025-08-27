
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { UserProvider } from '@/contexts/user-context';
import { SurgeonsProvider } from '@/contexts/surgeons-context';
import ModernDashboard from '@/components/dashboard/modern-dashboard';
import { Loader2 } from 'lucide-react';

function ProtectedDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <ModernDashboard />;
}

export default function Dashboard() {
  return (
    <UserProvider>
      <SurgeonsProvider>
        <ProtectedDashboard />
      </SurgeonsProvider>
    </UserProvider>
  );
}
