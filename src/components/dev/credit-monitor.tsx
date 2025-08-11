// src/components/dev/credit-monitor.tsx
"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Activity, RefreshCw, Eye, EyeOff } from 'lucide-react';

export function CreditMonitor() {
  const { userData, refreshUserData } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [previousCredits, setPreviousCredits] = useState<number | null>(null);
  const [creditHistory, setCreditHistory] = useState<Array<{
    credits: number;
    change: number;
    timestamp: string;
  }>>([]);

  // Monitor credit changes
  useEffect(() => {
    const currentCredits = userData?.aiCredits || 0;
    
    if (previousCredits !== null && currentCredits !== previousCredits) {
      const change = currentCredits - previousCredits;
      const newEntry = {
        credits: currentCredits,
        change,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setCreditHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 changes
      
      console.log('Credit change detected:', {
        from: previousCredits,
        to: currentCredits,
        change,
        timestamp: newEntry.timestamp
      });
    }
    
    setPreviousCredits(currentCredits);
  }, [userData?.aiCredits, previousCredits]);

  // Auto-refresh every 5 seconds when visible
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      refreshUserData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isVisible, refreshUserData]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-white shadow-lg border-2 border-green-200 text-green-700 hover:bg-green-50"
        >
          <Eye className="h-4 w-4 mr-1" />
          Credit Monitor
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-2 border-green-200 bg-green-50/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-green-700 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Credit Monitor
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={refreshUserData}
                className="h-6 w-6 p-0 hover:bg-green-100"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0 hover:bg-green-100"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current Status */}
          <div className="flex items-center justify-between p-2 bg-white rounded border">
            <span className="text-sm font-medium">Current Credits:</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              <Coins className="h-3 w-3 mr-1" />
              {userData?.aiCredits || 0}
            </Badge>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded border text-center">
              <div className="font-medium text-green-700">Total Used</div>
              <div className="text-lg font-bold">{userData?.totalCreditsUsed || 0}</div>
            </div>
            <div className="p-2 bg-white rounded border text-center">
              <div className="font-medium text-green-700">Purchased</div>
              <div className="text-lg font-bold">{userData?.totalCreditsPurchased || 0}</div>
            </div>
          </div>

          {/* Recent Changes */}
          {creditHistory.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-green-700">Recent Changes:</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {creditHistory.map((entry, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded border ${
                      entry.change > 0 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : entry.change < 0
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {entry.change > 0 ? `+${entry.change}` : entry.change} credits
                      </span>
                      <span className="opacity-75">{entry.timestamp}</span>
                    </div>
                    <div className="text-xs opacity-75">
                      Total: {entry.credits}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-green-600 bg-green-100 p-2 rounded border">
            <strong>Monitoring:</strong> Auto-refreshes every 5s. Use AI features to see credit deduction in real-time.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}