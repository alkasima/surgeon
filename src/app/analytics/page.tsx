// src/app/analytics/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { getUserAnalytics } from '@/app/user/actions';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { UsageCharts } from '@/components/analytics/usage-charts';
import { FeatureBreakdown } from '@/components/analytics/feature-breakdown';
import { CreditHistory } from '@/components/analytics/credit-history';
import { formatDate } from '@/lib/date-utils';
import type { UsageStats } from '@/types/user';
import { BarChart3, TrendingUp, PieChart, CreditCard } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { userData } = useUser();
  const [analytics, setAnalytics] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const result = await getUserAnalytics(user.uid);
        
        if (result.error) {
          setError(result.error);
        } else {
          setAnalytics(result.analytics || null);
        }
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user?.uid]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your AI feature usage, credit consumption, and activity patterns
          </p>
        </div>

        <AnalyticsOverview 
          userData={userData} 
          analytics={analytics} 
        />

        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage Trends
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Feature Breakdown
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit History
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <UsageCharts analytics={analytics} />
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <FeatureBreakdown analytics={analytics} />
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <CreditHistory userData={userData} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Most Used Feature</h4>
                      <p className="text-2xl font-bold text-primary">
                        {analytics?.lastUsedFeature ? 
                          analytics.lastUsedFeature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) :
                          'No usage yet'
                        }
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Last Activity</h4>
                      <p className="text-2xl font-bold text-primary">
                        {formatDate(analytics?.lastUsageDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Try using the Surgeon Analysis feature to get AI-powered insights</li>
                      <li>• Use Email Drafting to create professional outreach messages</li>
                      <li>• Summarize your notes to keep track of important details</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}