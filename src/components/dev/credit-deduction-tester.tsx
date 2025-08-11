// src/components/dev/credit-deduction-tester.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Coins, TestTube, Minus, Eye, RefreshCw } from 'lucide-react';
import { AI_CREDIT_COSTS } from '@/types/user';
import type { AIFeatureType } from '@/types/user';

export function CreditDeductionTester() {
  const { user } = useAuth();
  const { userData, refreshUserData, checkAndUseAICredits, hasEnoughCredits } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    feature: string;
    creditsBefore: number;
    creditsAfter: number;
    success: boolean;
    timestamp: string;
  }>>([]);

  const testCreditDeduction = async (featureType: AIFeatureType) => {
    if (!user) return;

    setLoading(featureType);
    const creditsBefore = userData?.aiCredits || 0;
    
    try {
      console.log(`Testing ${featureType} - Credits before: ${creditsBefore}`);
      
      // Test the credit deduction
      const success = await checkAndUseAICredits(featureType);
      
      // Refresh data to get updated credits
      await refreshUserData();
      
      // Wait a moment for data to update
      setTimeout(() => {
        const creditsAfter = userData?.aiCredits || 0;
        
        const result = {
          feature: featureType,
          creditsBefore,
          creditsAfter,
          success,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
        
        console.log('Test result:', result);
        
        if (success) {
          toast({
            title: "Credit Deduction Test",
            description: `${featureType}: ${creditsBefore} → ${creditsAfter} credits (-${AI_CREDIT_COSTS[featureType]})`,
            variant: "default"
          });
        } else {
          toast({
            title: "Credit Deduction Failed",
            description: `${featureType}: Insufficient credits or error occurred`,
            variant: "destructive"
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Credit deduction test error:', error);
      toast({
        title: "Test Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const addTestCredits = async (amount: number) => {
    if (!user) return;

    try {
      const response = await fetch('/api/credits/add-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          credits: amount,
          reason: 'Credit deduction testing'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Test Credits Added",
          description: `Added ${amount} credits for testing. New total: ${data.newTotal}`,
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
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <TestTube className="h-5 w-5" />
          Credit Deduction Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-600">
          Test if credits are being deducted correctly when using AI features
        </p>
        
        {/* Current Status */}
        <div className="p-3 bg-blue-100 rounded text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span><strong>Current Credits:</strong></span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                <Coins className="h-3 w-3 mr-1" />
                {userData?.aiCredits || 0}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={refreshUserData}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div><strong>Total Used:</strong> {userData?.totalCreditsUsed || 0}</div>
          <div><strong>User ID:</strong> {user?.uid?.slice(0, 8)}...</div>
        </div>

        {/* Add Test Credits */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => addTestCredits(10)}
            className="border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Coins className="h-4 w-4 mr-1" />
            +10 Credits
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addTestCredits(50)}
            className="border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Coins className="h-4 w-4 mr-1" />
            +50 Credits
          </Button>
        </div>

        {/* Test Credit Deduction */}
        <div className="space-y-2">
          <h4 className="font-medium text-blue-700">Test Credit Deduction:</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => testCreditDeduction('summarizeNotes')}
              disabled={loading === 'summarizeNotes' || !hasEnoughCredits('summarizeNotes')}
              className="border-blue-200 text-blue-700 hover:bg-blue-100 justify-between"
            >
              <span className="flex items-center gap-1">
                <Minus className="h-3 w-3" />
                Test Summarize Notes
              </span>
              <Badge variant="secondary" className="text-xs">-1 credit</Badge>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => testCreditDeduction('draftEmail')}
              disabled={loading === 'draftEmail' || !hasEnoughCredits('draftEmail')}
              className="border-blue-200 text-blue-700 hover:bg-blue-100 justify-between"
            >
              <span className="flex items-center gap-1">
                <Minus className="h-3 w-3" />
                Test Draft Email
              </span>
              <Badge variant="secondary" className="text-xs">-2 credits</Badge>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => testCreditDeduction('analyzeSurgeon')}
              disabled={loading === 'analyzeSurgeon' || !hasEnoughCredits('analyzeSurgeon')}
              className="border-blue-200 text-blue-700 hover:bg-blue-100 justify-between"
            >
              <span className="flex items-center gap-1">
                <Minus className="h-3 w-3" />
                Test Analyze Surgeon
              </span>
              <Badge variant="secondary" className="text-xs">-3 credits</Badge>
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700 flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Test Results:
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-xs p-2 rounded border ${
                    result.success 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{result.feature}</span>
                    <span className="text-xs opacity-75">{result.timestamp}</span>
                  </div>
                  <div>
                    {result.success ? (
                      <span>✅ {result.creditsBefore} → {result.creditsAfter} credits</span>
                    ) : (
                      <span>❌ Failed - Insufficient credits or error</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          <strong>How to test:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Add test credits using the buttons above</li>
            <li>Click a "Test" button to simulate using an AI feature</li>
            <li>Check if credits are deducted correctly</li>
            <li>View results in the "Test Results" section</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}