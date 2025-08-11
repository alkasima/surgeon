// src/components/analytics/credit-history.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserData } from '@/types/user';
import { CreditCard, TrendingUp, ShoppingCart, Zap } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import Link from 'next/link';

interface CreditHistoryProps {
  userData: UserData | null;
}

export function CreditHistory({ userData }: CreditHistoryProps) {
  const currentCredits = userData?.aiCredits || 0;
  const totalPurchased = userData?.totalCreditsPurchased || 0;
  const totalUsed = userData?.totalCreditsUsed || 0;
  const lastPurchase = userData?.lastCreditPurchase;

  // Calculate efficiency metrics
  const usageRate = totalPurchased > 0 ? (totalUsed / totalPurchased) * 100 : 0;
  const remainingRate = totalPurchased > 0 ? (currentCredits / totalPurchased) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Credit Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentCredits}</div>
            <p className="text-xs text-muted-foreground">
              Available AI credits
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchased</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPurchased}</div>
            <p className="text-xs text-muted-foreground">
              Credits bought all-time
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalUsed}</div>
            <p className="text-xs text-muted-foreground">
              Credits consumed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {usageRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of purchased credits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Status */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Available Credits</h4>
                  <p className="text-sm text-muted-foreground">
                    Ready to use for AI features
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentCredits}</div>
                <Badge variant={currentCredits > 10 ? "default" : currentCredits > 5 ? "secondary" : "destructive"}>
                  {currentCredits > 10 ? "Plenty" : currentCredits > 5 ? "Moderate" : "Low"}
                </Badge>
              </div>
            </div>

            {lastPurchase && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Last Purchase</h4>
                    <p className="text-sm text-muted-foreground">
                      Most recent credit purchase
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatDate(lastPurchase)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(lastPurchase, { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {totalPurchased === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No Credit Purchases Yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  You're currently using your free starter credits. Purchase more to unlock unlimited AI features.
                </p>
                <Link href="/credits">
                  <Button>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Credits
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages Info */}
      <Card>
        <CardHeader>
          <CardTitle>Available Credit Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium mb-2">Starter Pack</h4>
              <div className="text-2xl font-bold mb-1">25 Credits</div>
              <p className="text-sm text-muted-foreground mb-3">$9.99</p>
              <Badge variant="outline">$0.40 per credit</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center border-primary">
              <Badge className="mb-2">Most Popular</Badge>
              <h4 className="font-medium mb-2">Professional Pack</h4>
              <div className="text-2xl font-bold mb-1">100 Credits</div>
              <p className="text-sm text-muted-foreground mb-3">$29.99</p>
              <Badge variant="outline">$0.30 per credit</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium mb-2">Premium Pack</h4>
              <div className="text-2xl font-bold mb-1">250 Credits</div>
              <p className="text-sm text-muted-foreground mb-3">$59.99</p>
              <Badge variant="outline">$0.24 per credit</Badge>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link href="/credits">
              <Button size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Purchase Credits
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Usage Insights */}
      {totalUsed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Credit Efficiency</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Usage Rate</span>
                    <span className="font-medium">{usageRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining</span>
                    <span className="font-medium">{remainingRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  {currentCredits < 5 && (
                    <p>• Consider purchasing more credits to continue using AI features</p>
                  )}
                  {usageRate > 80 && (
                    <p>• You're actively using your credits - great engagement!</p>
                  )}
                  {usageRate < 20 && totalPurchased > 0 && (
                    <p>• You have plenty of unused credits - try exploring more AI features</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}