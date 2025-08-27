// src/components/credits/insufficient-credits-dialog.tsx
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Coins, Star, Loader2, Check, ExternalLink } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { useCreditPurchase } from '@/hooks/use-credit-purchase';

interface InsufficientCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creditsNeeded: number;
  featureName: string;
  currentCredits?: number;
}

// Credit packages for quick purchase
const QUICK_PACKAGES = [
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

export function InsufficientCreditsDialog({ 
  isOpen, 
  onClose, 
  creditsNeeded, 
  featureName,
  currentCredits 
}: InsufficientCreditsDialogProps) {
  const { userData } = useUser();
  const { purchaseCredits, loading } = useCreditPurchase();
  const [showAllPackages, setShowAllPackages] = useState(false);

  const actualCurrentCredits = currentCredits ?? userData?.aiCredits ?? 0;
  const shortfall = creditsNeeded - actualCurrentCredits;

  // Find the smallest package that covers the shortfall
  const recommendedPackage = QUICK_PACKAGES.find(pkg => pkg.credits >= shortfall) || QUICK_PACKAGES[0];

  const handlePurchase = (packageId: string) => {
    purchaseCredits(packageId);
    // Dialog will close automatically when purchase completes successfully
  };

  const handleViewAllCredits = () => {
    onClose();
    window.location.href = '/credits';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-amber-700">
            Insufficient Credits
          </DialogTitle>
          <DialogDescription className="text-base">
            You need <span className="font-semibold text-amber-600">{creditsNeeded} credits</span> to use {featureName}, 
            but you only have <span className="font-semibold">{actualCurrentCredits} credits</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current Balance */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-700">Current Balance</span>
              </div>
              <div className="text-3xl font-bold text-amber-700">
                {actualCurrentCredits}
              </div>
              <div className="text-sm text-amber-600">
                Need {shortfall} more credits
              </div>
            </div>
          </div>

          {/* Recommended Package */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-center">Recommended for You</h3>
            <Card className="border-2 border-indigo-500 shadow-lg">
              <CardHeader className="text-center pb-3">
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-lg font-bold">{recommendedPackage.name}</CardTitle>
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Best Match
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatPrice(recommendedPackage.price)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {recommendedPackage.credits} AI credits
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{Math.floor(recommendedPackage.credits / 3)} Analyses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{Math.floor(recommendedPackage.credits / 2)} Email Drafts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{recommendedPackage.credits} Summaries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Never expires</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => handlePurchase(recommendedPackage.id)}
                  disabled={!!loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {loading === recommendedPackage.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Purchase ${recommendedPackage.credits} Credits`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Other Options */}
          {!showAllPackages ? (
            <div className="text-center space-y-3">
              <Button
                variant="outline"
                onClick={() => setShowAllPackages(true)}
                className="w-full"
              >
                View Other Credit Packages
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-center">Other Options</h3>
              <div className="grid gap-3">
                {QUICK_PACKAGES.filter(pkg => pkg.id !== recommendedPackage.id).map((pkg) => (
                  <Card key={pkg.id} className="border hover:border-indigo-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{pkg.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.credits} credits • {formatPrice(pkg.price)}
                          </div>
                        </div>
                        <Button
                          onClick={() => handlePurchase(pkg.id)}
                          disabled={!!loading}
                          variant="outline"
                          size="sm"
                        >
                          {loading === pkg.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Purchase'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleViewAllCredits}
              className="flex-1 gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Full Credits Page
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}