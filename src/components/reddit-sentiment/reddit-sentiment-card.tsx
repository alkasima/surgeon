"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, ExternalLink, MessageCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import type { SurgeonSentimentData } from '@/lib/reddit-sentiment-service';

interface RedditSentimentCardProps {
  surgeonName: string;
  initialData?: SurgeonSentimentData;
  onUpdate?: (data: SurgeonSentimentData) => void;
}

export function RedditSentimentCard({ surgeonName, initialData, onUpdate }: RedditSentimentCardProps) {
  const [data, setData] = useState<SurgeonSentimentData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const analyzeSentiment = async (refresh = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to analyze Reddit sentiment.",
        variant: "destructive",
      });
      return;
    }

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/reddit/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          surgeonName,
          options: {
            limit: 50,
            timeRange: 'year',
            includeComments: true,
            subreddits: ['HairTransplants', 'tressless', 'hair', 'all'],
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        onUpdate?.(result.data);
        toast({
          title: "Analysis Complete",
          description: `Found ${result.data.totalMentions} Reddit mentions`,
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getSentimentEmoji = (label: string) => {
    switch (label) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '😐';
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Reddit Sentiment Analysis
          </CardTitle>
          <CardDescription>
            Analyzing Reddit discussions about {surgeonName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Analyzing Reddit sentiment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Reddit Sentiment Analysis
          </CardTitle>
          <CardDescription>
            Get insights from Reddit discussions about {surgeonName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Analyze what Reddit users are saying about this surgeon
            </p>
            <Button onClick={() => analyzeSentiment()} className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Analyze Reddit Sentiment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { sentiment } = data;
  const sentimentEmoji = getSentimentEmoji(sentiment.overallLabel);
  const sentimentColor = getSentimentColor(sentiment.overallLabel);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Reddit Sentiment Analysis
            </CardTitle>
            <CardDescription>
              Last updated: {formatDate(data.lastUpdated)}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyzeSentiment(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Sentiment */}
        <div className={`p-4 rounded-lg border ${sentimentColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{sentimentEmoji}</span>
                <span className="font-semibold capitalize">{sentiment.overallLabel}</span>
                <Badge variant="secondary">
                  {Math.round(sentiment.confidence * 100)}% confidence
                </Badge>
              </div>
              <p className="text-sm mt-1">
                {data.totalMentions} mentions found on Reddit
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {data.totalMentions > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{sentiment.breakdown.positive}</div>
              <div className="text-sm text-green-600">Positive</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{sentiment.breakdown.neutral}</div>
              <div className="text-sm text-gray-600">Neutral</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{sentiment.breakdown.negative}</div>
              <div className="text-sm text-red-600">Negative</div>
            </div>
          </div>
        )}

        {/* Themes */}
        {sentiment.themes.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Common Themes</h4>
            <div className="flex flex-wrap gap-2">
              {sentiment.themes.map((theme, index) => (
                <Badge key={index} variant="outline">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {(sentiment.examples.positive.length > 0 || sentiment.examples.negative.length > 0) && (
          <div className="space-y-3">
            {sentiment.examples.positive.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Positive Examples</h4>
                <div className="space-y-2">
                  {sentiment.examples.positive.slice(0, 2).map((example, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">"{example}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sentiment.examples.negative.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Negative Examples</h4>
                <div className="space-y-2">
                  {sentiment.examples.negative.slice(0, 2).map((example, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">"{example}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Data Message */}
        {data.totalMentions === 0 && (
          <Alert>
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              No Reddit mentions found for {surgeonName}. This could mean the surgeon is not well-known on Reddit or has a very common name.
            </AlertDescription>
          </Alert>
        )}

        {/* View on Reddit */}
        {data.totalMentions > 0 && (
          <div className="pt-4 border-t">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://www.reddit.com/search?q=${encodeURIComponent(surgeonName)}&sort=relevance&t=year`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Reddit
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
