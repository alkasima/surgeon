
// src/app/profile/page.tsx
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function ProfilePageContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

 // Protect route

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  if (authLoading || !user) {
    return (
      <MainLayout>
        <div className="flex flex-1 justify-center items-center h-[calc(100vh-theme(spacing.16))]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Your Profile</CardTitle>
            <CardDescription>View and manage your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
             <div>
              <Label>User ID</Label>
              <p className="text-sm text-muted-foreground font-mono">{user.uid}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function ProfilePage() {
    return <ProfilePageContent />;
}
