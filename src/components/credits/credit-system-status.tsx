// src/components/credits/credit-system-status.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export function CreditSystemStatus() {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="text-green-700">Credit System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Payment Processing</span>
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Stripe Ready
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Credit System</span>
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">AI Features</span>
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Integrated
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Analytics Tracking</span>
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <strong>System Ready:</strong> All credit system components are operational. You can purchase credits and use AI features.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}