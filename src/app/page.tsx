
"use client";

import { useAuth } from '@/contexts/auth-context';
import { UserProvider } from '@/contexts/user-context';
import { SurgeonsProvider } from '@/contexts/surgeons-context';
import ModernDashboard from '@/components/dashboard/modern-dashboard';
import { AdminRedirect } from '@/components/admin-redirect';
import LandingPage from '@/components/landing/landing-page';

export default function RootPage() {
  const { user } = useAuth();

  // Visitors see the marketing landing page until they choose to sign up
  if (!user) {
    return <LandingPage />;
  }

  // Authenticated users see the dashboard
  return (
    <UserProvider>
      <SurgeonsProvider>
        <>
          <AdminRedirect />
          <ModernDashboard />
        </>
      </SurgeonsProvider>
    </UserProvider>
  );
}
