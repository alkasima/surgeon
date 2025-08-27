// src/components/credits/insufficient-search-credits-dialog.tsx
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Search, Star, Loader2, Check, ExternalLink, CreditCard } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { useCreditPurchase } from '@/hooks/use-credit-purchase';

interface InsufficientSearchCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creditsNeeded: number;
  featureName: string;
  currentCredits?: number;
}

// For now, use the same credit packages as AI credits
// In the future, you might want separate search credit packages
const SEARCH_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 25,
    price: 999, // $9.99 in cents
    description: 'Perfect for trying out search features',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 100,
    price: 2999, // $29.99 in cents
    description: 'Great for extensive research',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 250,
    price: 5999, // $59.99 in cents
    description: 'Best value for power researchers',
    popular: false,
  },
];

const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100);
};

export function InsufficientSearchCreditsDialog({ 
  isOpen, 
  onClose, 
  creditsNeeded, 
  featureName,
  currentCredits 
}: InsufficientSearchCreditsDialogProps) {
  const { userData } = useUser();
  const { purchaseCredits, loading } = useCreditPurchase();
  const [showAllPackages, setShowAllPackages] = useState(false);

  const actualCurrentCredits = currentCredits ?? userData?.searchCredits ?? 0;
  const shortfall = creditsNeeded - actualCurrentCredits;

  // Find the smallest package that covers the shortfall
  const recommendedPackage = SEARCH_PACKAGES.find(pkg => pkg.credits >= shortfall) || SEARCH_PACKAGES[0];

  const handlePurchase = (packageId: string) => {
    purchaseCredits(packageId);
    // Dialog will close automatically when purchase completes successfully
  };

  const handleViewCreditsPage = () => {
    onClose();
    window.location.href = '/credits';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <Search className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-blue-700">
            Insufficient Search Credits
          </DialogTitle>
          <DialogDescription className="text-base">
            You need <span className="font-semibold text-blue-600">{creditsNeeded} search credits</span> to use {featureName}, 
            but you only have <span className="font-semibold">{actualCurrentCredits} search credits</span>.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Note: Purchasing credits will add to your AI credit balance, which can be used for both AI features and searches.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current Balance */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-700">Current Search Credits</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {actualCurrentCredits}
              </div>
              <div className="text-sm text-blue-600">
                Need {shortfall} more search credits
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
                  {recommendedPackage.credits} search credits
                </div>
                <div className="text-xs text-muted-foreground">
                  ~{Math.floor(recommendedPackage.credits / 5)} searches (5 credits each)
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Google Places Search</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Load More Results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Unlimited Saves</span>
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
                    `Purchase ${recommendedPackage.credits} Search Credits`
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
                View Other Search Credit Packages
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-center">Other Options</h3>
              <div className="grid gap-3">
                {SEARCH_PACKAGES.filter(pkg => pkg.id !== recommendedPackage.id).map((pkg) => (
                  <Card key={pkg.id} className="border hover:border-indigo-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{pkg.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.credits} credits • {formatPrice(pkg.price)} • ~{Math.floor(pkg.credits / 5)} searches
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
              onClick={handleViewCreditsPage}
              className="flex-1 gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View All Credit Options
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