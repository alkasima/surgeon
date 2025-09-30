"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { RedditSentimentCard } from '@/components/reddit-sentiment';

export default function RedditSentimentTestPage() {
  const [surgeonName, setSurgeonName] = useState('Dr. John Doe');
  const [testResults, setTestResults] = useState<any>(null);
  const [clinicName, setClinicName] = useState('Beverly Hills Hair Group');
  const [isTesting, setIsTesting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const seedSampleSurgeon = async () => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to seed data.', variant: 'destructive' });
      return;
    }
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/seed-sample-surgeon', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Sample Surgeon Added', description: `${json.surgeon.name} - ${json.surgeon.clinicName}` });
        setSurgeonName(json.surgeon.name);
        setClinicName(json.surgeon.clinicName);
      } else {
        throw new Error(json.error || 'Failed to seed');
      }
    } catch (e) {
      toast({ title: 'Seeding Failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const testRedditAPI = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to test the Reddit API.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResults(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/reddit/sentiment', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      setTestResults(result);
      
      if (result.success) {
        toast({
          title: "Test Complete",
          description: "Reddit API test completed successfully",
        });
      } else {
        toast({
          title: "Test Failed",
          description: result.error || 'Unknown error',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Test Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <TestTube className="h-6 w-6" />
              Reddit Sentiment Analysis Test
            </CardTitle>
            <CardDescription className="text-gray-400">
              Test the Reddit API integration and sentiment analysis system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Test */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">API Connection Test</h3>
                <Button onClick={seedSampleSurgeon} className="bg-blue-600 hover:bg-blue-500">Seed Sample Surgeon</Button>
              </div>
              <Button 
                onClick={testRedditAPI}
                disabled={isTesting}
                className="bg-purple-600 hover:bg-purple-500"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Reddit API
                  </>
                )}
              </Button>

              {testResults && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-white/5 border border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          {testResults.test?.redditConnected ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          <span className="text-white">Reddit API</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          {testResults.test?.sentimentWorking ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          <span className="text-white">Sentiment Analysis</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!testResults.test?.redditConnected && (
                    <Alert className="bg-red-500/10 border-red-500/50">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-200">
                        Reddit API is not connected. Please check your Reddit API credentials in the environment variables.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!testResults.test?.sentimentWorking && (
                    <Alert className="bg-red-500/10 border-red-500/50">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-200">
                        Sentiment analysis is not working. Please check the vader-sentiment package installation.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {/* Surgeon Analysis Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Surgeon Analysis Test</h3>
              <div className="space-y-2">
                <Label htmlFor="surgeonName" className="text-gray-300">Surgeon Name</Label>
                <Input
                  id="surgeonName"
                  value={surgeonName}
                  onChange={(e) => setSurgeonName(e.target.value)}
                  placeholder="Enter surgeon name to test"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicName" className="text-gray-300">Clinic Name (optional)</Label>
                <Input
                  id="clinicName"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Enter clinic name to include"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis Component */}
        {surgeonName && (
          <RedditSentimentCard surgeonName={surgeonName} clinicName={clinicName || undefined} />
        )}

        {/* Setup Instructions */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Reddit API Setup</h4>
              <p className="text-sm">
                To use Reddit sentiment analysis, you need to set up Reddit API credentials:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
                <li>Go to <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Reddit App Preferences</a></li>
                <li>Create a new app (script type)</li>
                <li>Add the credentials to your environment variables</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">2. Environment Variables</h4>
              <div className="bg-gray-900 p-3 rounded-lg text-sm font-mono">
                <div>REDDIT_CLIENT_ID=your_client_id</div>
                <div>REDDIT_CLIENT_SECRET=your_client_secret</div>
                <div>REDDIT_USERNAME=your_reddit_username</div>
                <div>REDDIT_PASSWORD=your_reddit_password</div>
                <div>REDDIT_USER_AGENT=HairTransplantCRM/1.0</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">3. Features</h4>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Search Reddit for surgeon mentions</li>
                <li>Analyze sentiment of posts and comments</li>
                <li>Extract common themes from discussions</li>
                <li>Provide confidence scores and examples</li>
                <li>Background agent for automated updates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
