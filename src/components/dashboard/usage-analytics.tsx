"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/user-context';
import { Coins, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { useMemo } from 'react';

export function UsageAnalytics() {
  const { userData } = useUser();

  const analytics = useMemo(() => {
    if (!userData?.usageStats) return null;

    const stats = userData.usageStats;
    const totalFeatureUsage = (stats.summarizeNotesCount || 0) + 
                             (stats.draftEmailCount || 0) + 
                             (stats.analyzeSurgeonCount || 0);

    // Calculate this month's usage
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthUsage = stats.monthlyUsage?.[currentMonth] || 0;

    // Calculate this week's usage (last 7 days)
    const thisWeekUsage = Object.entries(stats.dailyUsage || {})
      .filter(([date]) => {
        const daysDiff = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff < 7;
      })
      .reduce((sum, [, count]) => sum + count, 0);

    // Most used feature
    const featureUsage = [
      { name: 'Note Summaries', count: stats.summarizeNotesCount || 0, cost: 1 },
      { name: 'Email Drafts', count: stats.draftEmailCount || 0, cost: 2 },
      { name: 'Surgeon Analysis', count: stats.analyzeSurgeonCount || 0, cost: 3 },
    ];
    const mostUsedFeature = featureUsage.reduce((max, feature) => 
      feature.count > max.count ? feature : max
    );

    return {
      totalFeatureUsage,
      thisMonthUsage,
      thisWeekUsage,
      mostUsedFeature,
      featureUsage,
      lastUsed: stats.lastUsageDate,
    };
  }, [userData]);

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start using AI features to see your usage analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total AI Usage</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalFeatureUsage}</div>
          <p className="text-xs text-muted-foreground">
            {userData?.totalCreditsUsed || 0} credits spent
          </p>
        </CardContent>
      </Card>

      {/* This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.thisMonthUsage}</div>
          <p className="text-xs text-muted-foreground">
            AI features used
          </p>
        </CardContent>
      </Card>

      {/* This Week */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.thisWeekUsage}</div>
          <p className="text-xs text-muted-foreground">
            Recent activity
          </p>
        </CardContent>
      </Card>

      {/* Most Used Feature */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Favorite Feature</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{analytics.mostUsedFeature.name}</div>
          <p className="text-xs text-muted-foreground">
            {analytics.mostUsedFeature.count} times used
          </p>
        </CardContent>
      </Card>

      {/* Feature Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Feature Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.featureUsage.map((feature) => (
              <div key={feature.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{feature.name}</div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.cost} credit{feature.cost > 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {feature.count} uses
                  </div>
                  <div className="text-sm font-medium">
                    {feature.count * feature.cost} credits
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {analytics.lastUsed && (
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              Last used: {formatDate(analytics.lastUsed)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
