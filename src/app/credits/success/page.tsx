"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/user-context';
import { CheckCircle, Coins, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function CreditsSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUserData, userData } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Refresh user data to get updated credit balance
    const refreshData = async () => {
      await refreshUserData();
      setIsLoading(false);
    };

    // Add a small delay to ensure webhook has processed
    const timer = setTimeout(refreshData, 2000);
    return () => clearTimeout(timer);
  }, [refreshUserData]);

  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

  if (!paymentIntent) {
    router.push('/credits');
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-700">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Your AI credits have been successfully purchased and added to your account.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                <span className="text-sm text-muted-foreground">
                  Updating your credit balance...
                </span>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Coins className="h-6 w-6 text-yellow-600" />
                  <span className="text-lg font-semibold text-yellow-700">
                    Current Balance
                  </span>
                </div>
                <div className="text-3xl font-bold text-yellow-700">
                  {userData?.aiCredits || 0} credits
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold">What you can do now:</h3>
              <div className="grid gap-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-indigo-500" />
                  <span>Summarize your surgeon notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-indigo-500" />
                  <span>Draft professional outreach emails</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-indigo-500" />
                  <span>Get AI-powered surgeon analysis</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/credits">
                  Buy More Credits
                </Link>
              </Button>
              <Button asChild>
                <Link href="/">
                  Start Using AI Features
                </Link>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p>Payment ID: {paymentIntent}</p>
              <p>Your credits never expire and can be used anytime.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function CreditsSuccessPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-8">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-green-100">
                  <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-700">
                Loading...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    }>
      <CreditsSuccessContent />
    </Suspense>
  );
}
