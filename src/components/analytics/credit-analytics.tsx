"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import type { UserData, UsageStats } from '@/types/user';
import { format, subDays, eachDayOfInterval, subMonths, eachMonthOfInterval } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';

interface CreditAnalyticsProps {
  userData: UserData | null;
  analytics: UsageStats | null;
}

export function CreditAnalytics({ userData, analytics }: CreditAnalyticsProps) {
  // Prepare credit usage data for the last 30 days (REAL DATA ONLY)
  const prepareCreditUsageData = () => {
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateRange.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dailyUsage = analytics?.dailyUsage?.[dateKey] || 0;
      
      return {
        date: format(date, 'MMM dd'),
        featureUsage: dailyUsage,
        fullDate: dateKey
      };
    });
  };

  // Prepare monthly usage data (REAL DATA ONLY)
  const prepareMonthlyData = () => {
    const endDate = new Date();
    const startDate = subMonths(endDate, 11);
    const monthRange = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return monthRange.map(date => {
      const monthKey = format(date, 'yyyy-MM');
      const monthlyUsage = analytics?.monthlyUsage?.[monthKey] || 0;
      
      return {
        month: format(date, 'MMM yyyy'),
        usage: monthlyUsage,
        fullMonth: monthKey
      };
    });
  };

  const creditUsageData = prepareCreditUsageData();
  const monthlyData = prepareMonthlyData();

  // Calculate totals from REAL DATA
  const totalFeatureUsage = creditUsageData.reduce((sum, day) => sum + day.featureUsage, 0);
  const totalMonthlyUsage = monthlyData.reduce((sum, month) => sum + month.usage, 0);
  const avgFeaturesPerDay = totalFeatureUsage / 30;

  return (
    <div className="space-y-6">
      {/* Credit Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features Used (30d)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalFeatureUsage}</div>
            <p className="text-xs text-muted-foreground">
              {avgFeaturesPerDay.toFixed(1)} per day average
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits Used</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userData?.totalCreditsUsed || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time usage
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Purchased</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {userData?.totalCreditsPurchased || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total credits purchased
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {userData?.credits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available credits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Feature Usage Over Time */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Feature Usage Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={creditUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'Features Used']}
                />
                <Area 
                  type="monotone" 
                  dataKey="featureUsage" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Usage Trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Usage Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'Features Used']}
                />
                <Bar dataKey="usage" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Credit Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {avgFeaturesPerDay.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Features per day</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {userData?.totalCreditsUsed || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total credits used</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {((userData?.credits || 0) / Math.max(userData?.totalCreditsPurchased || 1, 1) * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Credits remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}