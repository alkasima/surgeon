// src/components/analytics/usage-charts.tsx
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { UsageStats } from '@/types/user';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface UsageChartsProps {
  analytics: UsageStats | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function UsageCharts({ analytics }: UsageChartsProps) {
  // Prepare daily usage data for the last 30 days
  const prepareDailyData = () => {
    const endDate = new Date();
    const startDate = subDays(endDate, 29); // Last 30 days
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateRange.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return {
        date: format(date, 'MMM dd'),
        usage: analytics?.dailyUsage?.[dateKey] || 0,
        fullDate: dateKey
      };
    });
  };

  // Prepare monthly usage data for the last 12 months
  const prepareMonthlyData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = format(date, 'yyyy-MM');
      months.push({
        month: format(date, 'MMM yyyy'),
        usage: analytics?.monthlyUsage?.[monthKey] || 0,
        fullMonth: monthKey
      });
    }
    
    return months;
  };

  const dailyData = prepareDailyData();
  const monthlyData = prepareMonthlyData();

  // Feature usage pie chart data
  const featureData = [
    { name: 'Note Summaries', value: analytics?.summarizeNotesCount || 0, credits: 1 },
    { name: 'Email Drafts', value: analytics?.draftEmailCount || 0, credits: 2 },
    { name: 'Surgeon Analysis', value: analytics?.analyzeSurgeonCount || 0, credits: 3 },
  ].filter(item => item.value > 0);

  const totalUsage = featureData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Daily Usage Trend */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Daily Usage Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? `Date: ${item.fullDate}` : label;
                }}
                formatter={(value: number) => [value, 'Usage Count']}
              />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Usage Trend */}
      <Card>
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
                formatter={(value: number) => [value, 'Usage Count']}
              />
              <Bar dataKey="usage" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feature Usage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {totalUsage > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={featureData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {featureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value} uses (${props.payload.credits} credits each)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No usage data yet</p>
                <p className="text-sm">Start using AI features to see your usage patterns</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Summary Stats */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Usage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dailyData.reduce((sum, day) => sum + day.usage, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Last 30 Days</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {monthlyData[monthlyData.length - 1]?.usage || 0}
              </div>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...dailyData.map(d => d.usage), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Peak Daily Usage</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dailyData.filter(d => d.usage > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Days (30d)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}