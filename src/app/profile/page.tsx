
// src/app/profile/page.tsx
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ModernLayout } from '@/components/layout/modern-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { UsageAnalytics } from '@/components/dashboard/usage-analytics';
import { Loader2, User, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateUserProfileAction } from './actions';
import { auth } from '@/lib/firebase';

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not be longer than 50 characters." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfilePageContent() {
  const { user, loading: authLoading } = useAuth();
  const { userData } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
      });
    }
  }, [user, form]);
  
  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }
    
    const result = await updateUserProfileAction({ uid: user.uid, displayName: data.displayName });
    
    if (result.success) {
      toast({ title: "Success", description: "Your profile has been updated." });
      // Reload the user object to get the latest data from Firebase Auth
      // The onAuthStateChanged listener in AuthProvider will handle updating the global user state.
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
    } else {
      toast({ title: "Error", description: result.error || "Failed to update profile.", variant: "destructive" });
    }
  }

  if (authLoading || !user) {
    return (
      <ModernLayout>
        <div className="flex flex-1 justify-center items-center h-[calc(100vh-theme(spacing.16))]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Profile & Analytics</h1>
            <p className="text-muted-foreground">Manage your account and view usage insights</p>
          </div>
        </div>

        {/* Usage Analytics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Usage Analytics</h2>
          </div>
          <UsageAnalytics />
        </div>

        {/* Account Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and statistics.</CardDescription>
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
              <div>
                <Label>AI Credits</Label>
                <p className="text-sm font-semibold text-yellow-700">{userData?.aiCredits || 0} credits</p>
              </div>
              <div>
                <Label>Total Credits Purchased</Label>
                <p className="text-sm text-muted-foreground">{userData?.totalCreditsPurchased || 0} credits</p>
              </div>
              <div>
                <Label>Total Credits Used</Label>
                <p className="text-sm text-muted-foreground">{userData?.totalCreditsUsed || 0} credits</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Your Information</CardTitle>
              <CardDescription>Changes will be reflected across the application.</CardDescription>
            </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernLayout>
  );
}

export default function ProfilePage() {
    return <ProfilePageContent />;
}
