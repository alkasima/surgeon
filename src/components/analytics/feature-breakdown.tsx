// src/components/analytics/feature-breakdown.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { UsageStats } from '@/types/user';
import { FileText, Mail, Brain, TrendingUp } from 'lucide-react';

interface FeatureBreakdownProps {
  analytics: UsageStats | null;
}

export function FeatureBreakdown({ analytics }: FeatureBreakdownProps) {
  const features = [
    {
      name: 'Note Summarization',
      icon: FileText,
      count: analytics?.summarizeNotesCount || 0,
      credits: 1,
      description: 'Condense lengthy notes into summaries',
      color: 'bg-blue-500'
    },
    {
      name: 'Email Drafting',
      icon: Mail,
      count: analytics?.draftEmailCount || 0,
      credits: 2,
      description: 'Generate professional outreach emails',
      color: 'bg-green-500'
    },
    {
      name: 'Surgeon Analysis',
      icon: Brain,
      count: analytics?.analyzeSurgeonCount || 0,
      credits: 3,
      description: 'AI-powered suitability analysis',
      color: 'bg-purple-500'
    }
  ];

  const totalUsage = features.reduce((sum, feature) => sum + feature.count, 0);
  const totalCreditsSpent = features.reduce((sum, feature) => sum + (feature.count * feature.credits), 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Features Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Across all AI features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsSpent}</div>
            <p className="text-xs text-muted-foreground">
              Total credits consumed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsage > 0 ? (totalCreditsSpent / totalUsage).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Credits per feature use
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Details */}
      <div className="grid gap-4 md:grid-cols-1">
        {features.map((feature, index) => {
          const percentage = totalUsage > 0 ? (feature.count / totalUsage) * 100 : 0;
          const Icon = feature.icon;
          
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{feature.count}</div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.credits} credit{feature.credits !== 1 ? 's' : ''} each
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage percentage</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total credits spent: {feature.count * feature.credits}</span>
                    <span>{feature.count} uses</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {totalUsage === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  No AI features used yet
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start exploring our AI-powered tools to enhance your surgeon research
                </p>
                <div className="grid gap-2 md:grid-cols-3 text-left">
                  {features.map((feature, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <feature.icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{feature.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {feature.credits} credit{feature.credits !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Most Efficient Features</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Note Summarization (1 credit) - Great for organizing research
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Email Drafting (2 credits) - Professional outreach made easy
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Premium Features</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <Brain className="h-3 w-3" />
                      Surgeon Analysis (3 credits) - Comprehensive AI insights
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}