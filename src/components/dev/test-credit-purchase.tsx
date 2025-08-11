// src/components/dev/test-credit-purchase.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Coins, TestTube } from 'lucide-react';

export function TestCreditPurchase() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const testAddCredits = async (credits: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          credits: credits,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Test Credits Added!",
          description: `Successfully added ${credits} test credits. New total: ${data.newTotal}`,
          variant: "default"
        });
        refreshUserData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add credits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <TestTube className="h-5 w-5" />
          Development Testing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-600 mb-4">
          Test credit system without real payments (development only)
        </p>
        
        {/* Debug Info */}
        <div className="mb-4 p-2 bg-orange-100 rounded text-xs">
          <div><strong>User ID:</strong> {user?.uid || 'Not logged in'}</div>
          <div><strong>Current Credits:</strong> {userData?.aiCredits || 0}</div>
          <div><strong>Total Used:</strong> {userData?.totalCreditsUsed || 0}</div>
          <div><strong>Total Purchased:</strong> {userData?.totalCreditsPurchased || 0}</div>
        </div>
        
        <div className="flex gap-2 mb-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => testAddCredits(25)}
            disabled={loading}
            className="border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <Coins className="h-4 w-4 mr-1" />
            +25 Credits
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => testAddCredits(100)}
            disabled={loading}
            className="border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <Coins className="h-4 w-4 mr-1" />
            +100 Credits
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshUserData}
            className="border-orange-200 text-orange-700 hover:bg-orange-100 text-xs"
          >
            Refresh Data
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              if (user?.uid) {
                const response = await fetch(`/api/debug/user-data?userId=${user.uid}`);
                const data = await response.json();
                console.log('Debug user data:', data);
                toast({
                  title: "Debug Data",
                  description: `Credits: ${data.userData?.aiCredits || 0} (check console for full data)`,
                  variant: "default"
                });
              }
            }}
            className="border-orange-200 text-orange-700 hover:bg-orange-100 text-xs"
          >
            Debug Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}