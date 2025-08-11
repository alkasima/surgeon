"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
// Temporary credit packages for MVP demo
const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 25,
    price: 999, // $9.99 in cents
    description: 'Perfect for trying out AI features',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 100,
    price: 2999, // $29.99 in cents
    description: 'Great for active researchers',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 250,
    price: 5999, // $59.99 in cents
    description: 'Best value for power users',
    popular: false,
  },
];

const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100);
};
import { Coins, Check, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreditPurchase } from '@/hooks/use-credit-purchase';
import { CreditSystemStatus } from '@/components/credits/credit-system-status';
import { PaymentSuccessModal } from '@/components/credits/payment-success-modal';

export default function CreditsPage() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUser();
  const { toast } = useToast();
  const { purchaseCredits, loading } = useCreditPurchase();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Handle success/cancel from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionIdParam = searchParams.get('session_id');

    if (success && !showSuccessModal) {
      // Show success modal instead of toast
      setSessionId(sessionIdParam);
      setShowSuccessModal(true);
      
      // Clean up URL parameters immediately to prevent loop
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('session_id');
      router.replace(url.pathname, { scroll: false });
    } else if (canceled) {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. No charges were made.",
        variant: "default"
      });
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('canceled');
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, toast, showSuccessModal, router]);

  const handlePurchase = (packageId: string) => {
    purchaseCredits(packageId);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSessionId(null);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 shadow-lg">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
              AI Credits
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Purchase AI credits to unlock powerful features like note summarization, email drafting, and surgeon analysis.
          </p>
          
          {/* Current Balance */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-700">
              Current Balance: {userData?.aiCredits || 0} credits
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                pkg.popular 
                  ? 'border-2 border-indigo-500 shadow-lg scale-105' 
                  : 'border hover:border-indigo-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-bold text-indigo-600">
                    {formatPrice(pkg.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pkg.credits} AI credits
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ${(pkg.price / 100 / pkg.credits).toFixed(3)} per credit
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{Math.floor(pkg.credits / 3)} Surgeon Analyses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{Math.floor(pkg.credits / 2)} Email Drafts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{pkg.credits} Note Summaries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Never expires</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                      : ''
                  }`}
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  {loading === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Purchase ${pkg.credits} Credits`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Status */}
        {/* <CreditSystemStatus /> */}

        {/* Features Info */}
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">How AI Credits Work</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                Note Summarization (1 credit)
              </div>
              <p className="text-muted-foreground">
                Condense lengthy notes into short, medium, or long summaries.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                Email Drafting (2 credits)
              </div>
              <p className="text-muted-foreground">
                Generate professional outreach emails to surgeons and clinics.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                Surgeon Analysis (3 credits)
              </div>
              <p className="text-muted-foreground">
                Get comprehensive suitability analysis and next step recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Success Modal */}
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          sessionId={sessionId}
        />
      </div>
    </MainLayout>
  );
}
