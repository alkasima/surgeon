// src/components/credits/payment-success-modal.tsx
"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Coins, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { useAuth } from '@/contexts/auth-context';
import { formatDate } from '@/lib/date-utils';
import { getUserData } from '@/lib/user-api';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

export function PaymentSuccessModal({ isOpen, onClose, sessionId }: PaymentSuccessModalProps) {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUser();
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize current balance when modal opens
    if (isOpen && userData?.aiCredits !== undefined) {
      setCurrentBalance(userData.aiCredits);
    }
  }, [isOpen, userData?.aiCredits]);

  useEffect(() => {
    if (isOpen && sessionId && !creditsAdded) {
      setIsLoading(true);
      
      // First, get session details
      fetch(`/api/stripe/session?session_id=${sessionId}`)
        .then(response => response.json())
        .then(async (data) => {
          if (data.credits) {
            setCreditsAdded(data.credits);
            
            // Add credits directly (since webhook isn't configured in development)
            try {
              console.log('Adding credits directly for user:', user?.uid, 'Credits:', data.credits);
              const directResponse = await fetch('/api/credits/add-direct', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user?.uid,
                  credits: data.credits,
                  reason: `Stripe payment - Session: ${sessionId}`
                }),
              });
              
              const directData = await directResponse.json();
              console.log('Direct credit addition response:', directData);
              
              if (directResponse.ok) {
                console.log('Credits added successfully:', directData);
                // Wait a moment for Firestore to propagate the changes
                await new Promise(resolve => setTimeout(resolve, 1000));
              } else {
                console.error('Direct credit addition failed:', directData.error);
                // Show error to user
                alert(`Failed to add credits: ${directData.error}`);
              }
            } catch (directError) {
              console.error('Direct credit addition error:', directError);
              alert(`Error adding credits: ${directError}`);
            }
          }
          
          // Refresh user data to show updated balance
          await refreshUserData();
          
          // Also fetch fresh user data directly to ensure we have the latest balance
          if (user?.uid) {
            const freshUserData = await getUserData(user.uid);
            if (freshUserData.data) {
              setCurrentBalance(freshUserData.data.aiCredits || 0);
              console.log('Fresh user data fetched:', freshUserData.data.aiCredits);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching session:', error);
          // Fallback: just refresh user data
          refreshUserData();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, sessionId, creditsAdded, refreshUserData, user]);

  const handleClose = () => {
    setCreditsAdded(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-700">
            Payment Successful!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Credits Added */}
          {isLoading ? (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="text-lg font-semibold">Processing Credits...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Updating your account balance
              </p>
            </div>
          ) : creditsAdded ? (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold">Credits Added</span>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-4xl font-bold text-green-600">
                +{creditsAdded}
              </div>
              <p className="text-sm text-muted-foreground">
                AI credits have been added to your account
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold">Credits Updated</span>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your payment has been processed successfully
              </p>
            </div>
          )}

          {/* Current Balance */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-700">Current Balance</span>
              </div>
              <div className="text-3xl font-bold text-yellow-700">
                {currentBalance || userData?.aiCredits || 0}
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                AI Credits Available
              </Badge>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Your payment has been processed successfully and credits have been added to your account.
            </p>
            <p className="text-sm font-medium text-green-600">
              You can now use AI features like note summarization, email drafting, and surgeon analysis!
            </p>
          </div>

          {/* Close Button */}
          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}