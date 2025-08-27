// src/app/analytics/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { getUserAnalytics } from '@/app/user/actions';
import { ModernLayout } from '@/components/layout/modern-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { UsageCharts } from '@/components/analytics/usage-charts';
import { FeatureBreakdown } from '@/components/analytics/feature-breakdown';
import { CreditHistory } from '@/components/analytics/credit-history';
import { CreditAnalytics } from '@/components/analytics/credit-analytics';
import { formatDate } from '@/lib/date-utils';
import type { UsageStats } from '@/types/user';
import { BarChart3, TrendingUp, PieChart, CreditCard } from 'lucide-react';

function AnalyticsContent() {
  const { user } = useAuth();
  const { userData } = useUser();
  const [analytics, setAnalytics] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user?.uid) {
        console.log('No user or uid available:', { user: !!user, uid: user?.uid });
        return;
      }
      
      console.log('User authenticated:', {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      });
      
      // Log Firebase project info
      console.log('Firebase project info:', {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      });
      
      try {
        setLoading(true);
        console.log('Fetching analytics for user:', user.uid);
        const result = await getUserAnalytics(user.uid);
        console.log('Analytics result:', result);
        
        if (result.error) {
          console.error('Analytics error:', result.error);
          setError(result.error);
        } else {
          setAnalytics(result.analytics || null);
        }
      } catch (err) {
        console.error('Analytics fetch error details:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          userUid: user?.uid,
          userEmail: user?.email
        });
        setError(`Failed to load analytics data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
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
    );
  }

  if (error) {
    return (
      <div className="p-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={() => {
                    console.log('Debug info:', {
                      user: user ? { uid: user.uid, email: user.email } : 'No user',
                      error: error,
                      timestamp: new Date().toISOString()
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  Log Debug Info
                </Button>
                <Button 
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    // Retry
                    if (user?.uid) {
                      getUserAnalytics(user.uid).then(result => {
                        if (result.error) {
                          setError(result.error);
                        } else {
                          setAnalytics(result.analytics || null);
                        }
                        setLoading(false);
                      });
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
                <Button 
                  onClick={async () => {
                    if (!user?.uid) return;
                    try {
                      // Test basic Firestore access
                      const { db } = await import('@/lib/firebase');
                      const { doc, getDoc } = await import('firebase/firestore');
                      
                      console.log('Testing Firestore access...');
                      const testDocRef = doc(db, 'users', user.uid);
                      console.log('Created doc reference for:', user.uid);
                      
                      const docSnap = await getDoc(testDocRef);
                      console.log('Document exists:', docSnap.exists());
                      
                      if (docSnap.exists()) {
                        console.log('Document data:', docSnap.data());
                      } else {
                        console.log('Document does not exist, this is normal for new users');
                      }
                    } catch (err) {
                      console.error('Direct Firestore test failed:', err);
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Test Firestore
                </Button>
                <Button 
                  onClick={async () => {
                    if (!user) return;
                    try {
                      console.log('Getting user token...');
                      const token = await user.getIdToken(true); // Force refresh
                      console.log('User token (first 50 chars):', token.substring(0, 50) + '...');
                      
                      // Decode token to check claims
                      const tokenParts = token.split('.');
                      if (tokenParts.length === 3) {
                        const payload = JSON.parse(atob(tokenParts[1]));
                        console.log('Token payload:', {
                          aud: payload.aud,
                          iss: payload.iss,
                          exp: new Date(payload.exp * 1000),
                          iat: new Date(payload.iat * 1000),
                          uid: payload.sub
                        });
                      }
                    } catch (err) {
                      console.error('Token check failed:', err);
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Check Token
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="flex items-center gap-3 p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Track your AI feature usage and credit consumption</p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
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

        <Tabs defaultValue="credits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit Analytics
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage Trends
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Feature Breakdown
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit History
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="space-y-6">
            <CreditAnalytics userData={userData} analytics={analytics} />
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <UsageCharts analytics={analytics} />
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <FeatureBreakdown analytics={analytics} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
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
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ModernLayout>
      <AnalyticsContent />
    </ModernLayout>
  );
}