// src/components/analytics/analytics-overview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserData, UsageStats } from '@/types/user';
import { formatDate } from '@/lib/date-utils';
import { 
  Brain, 
  Mail, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Zap,
  Target
} from 'lucide-react';

interface AnalyticsOverviewProps {
  userData: UserData | null;
  analytics: UsageStats | null;
}

export function AnalyticsOverview({ userData, analytics }: AnalyticsOverviewProps) {
  const totalFeatureUsage = (analytics?.summarizeNotesCount || 0) + 
                           (analytics?.draftEmailCount || 0) + 
                           (analytics?.analyzeSurgeonCount || 0);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthUsage = analytics?.monthlyUsage?.[currentMonth] || 0;

  const mostUsedFeature = analytics ? 
    Object.entries({
      'Summarize Notes': analytics.summarizeNotesCount || 0,
      'Draft Email': analytics.draftEmailCount || 0,
      'Analyze Surgeon': analytics.analyzeSurgeonCount || 0
    }).sort(([,a], [,b]) => b - a)[0] : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userData?.credits || 0}</div>
          <p className="text-xs text-muted-foreground">
            {userData?.totalCreditsUsed || 0} used total
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total AI Usage</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFeatureUsage}</div>
          <p className="text-xs text-muted-foreground">
            All-time feature usage
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisMonthUsage}</div>
          <p className="text-xs text-muted-foreground">
            Features used this month
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Used</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">
            {mostUsedFeature ? mostUsedFeature[0] : 'None'}
          </div>
          <p className="text-xs text-muted-foreground">
            {mostUsedFeature ? `${mostUsedFeature[1]} times` : 'No usage yet'}
          </p>
        </CardContent>
      </Card>

      {/* Feature Usage Breakdown Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Note Summaries</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.summarizeNotesCount || 0}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">1 credit each</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Email Drafts</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.draftEmailCount || 0}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">2 credits each</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Surgeon Analysis</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.analyzeSurgeonCount || 0}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">3 credits each</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits Purchased</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userData?.totalCreditsPurchased || 0}</div>
          <p className="text-xs text-muted-foreground">
            {userData?.lastCreditPurchase ? 
              `Last: ${formatDate(userData.lastCreditPurchase)}` :
              'No purchases yet'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}