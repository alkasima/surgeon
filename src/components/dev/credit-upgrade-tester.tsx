'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { upgradeUserCredits } from '@/lib/user-api';

export function CreditUpgradeTester() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleUpgrade = async () => {
    if (!user?.uid) {
      setResult('Please log in first');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const upgradeResult = await upgradeUserCredits(user.uid);
      
      if (upgradeResult.success) {
        if (upgradeResult.upgraded) {
          setResult('✅ Credits migrated successfully! You now have unified credits.');
          await refreshUserData();
        } else {
          setResult('ℹ️ No migration needed - you already have unified credits.');
        }
      } else {
        setResult(`❌ Upgrade failed: ${upgradeResult.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Credit Upgrade Tester</CardTitle>
        <CardDescription>
          Test the credit upgrade system for existing users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p><strong>Current Credits:</strong> {userData?.credits || 0}</p>
          {(userData?.aiCredits || userData?.searchCredits) && (
            <div className="text-xs text-gray-500 mt-1">
              <p>Legacy: AI: {userData?.aiCredits || 0}, Search: {userData?.searchCredits || 0}</p>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleUpgrade} 
          disabled={loading || !user}
          className="w-full"
        >
          {loading ? 'Upgrading...' : 'Upgrade Credits'}
        </Button>
        
        {result && (
          <div className="p-3 bg-gray-50 rounded-md text-sm">
            {result}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p>This will migrate users to unified credits:</p>
          <p>• Combines AI + Search credits</p>
          <p>• Minimum 100 credits guaranteed</p>
        </div>
      </CardContent>
    </Card>
  );
}