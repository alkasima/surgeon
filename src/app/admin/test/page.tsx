"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function AdminTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runPermissionTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/admin/test-permissions');
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        error: 'Failed to run test',
        firestore: false,
        auth: false
      });
    }
    setIsLoading(false);
  };

  const testCreditManagement = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test if we can access the admin users page (which uses credit management)
      const response = await fetch('/api/admin/test-permissions');
      const result = await response.json();
      
      if (result.auth && result.firestore) {
        setTestResult({
          ...result,
          creditManagement: true,
          message: 'All systems working! Credit management should work now.'
        });
      } else {
        setTestResult({
          ...result,
          creditManagement: false,
          message: 'Fix Firebase permissions first, then credit management will work.'
        });
      }
    } catch (error) {
      setTestResult({
        error: 'Failed to run test',
        firestore: false,
        auth: false,
        creditManagement: false
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Firebase Admin SDK Test</CardTitle>
            <CardDescription className="text-gray-400">
              Test your Firebase Admin SDK permissions and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button 
                onClick={runPermissionTest}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Firebase Permissions'
                )}
              </Button>
              
              <Button 
                onClick={testCreditManagement}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Credit Management'
                )}
              </Button>
            </div>

            {testResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        {testResult.firestore ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        <span className="text-white">Firestore Access</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        {testResult.auth ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        <span className="text-white">Authentication Access</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        {testResult.creditManagement ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        <span className="text-white">Credit Management</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {testResult.authError && (
                  <Alert className="bg-red-500/10 border-red-500/50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-200">
                      <strong>Auth Error:</strong> {testResult.authError}
                    </AlertDescription>
                  </Alert>
                )}

                {testResult.solution && (
                  <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-blue-300">How to Fix This</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-blue-200">
                      <p><strong>Step 1:</strong> {testResult.solution.step1}</p>
                      <p><strong>Step 2:</strong> {testResult.solution.step2}</p>
                      <p><strong>Step 3:</strong> {testResult.solution.step3}</p>
                      <p><strong>Step 4:</strong> {testResult.solution.step4}</p>
                    </CardContent>
                  </Card>
                )}

                {testResult.message && (
                  <Alert className="bg-green-500/10 border-green-500/50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-200">
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">Quick Fix Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Go to Google Cloud Console</h3>
              <p>Visit: <a href="https://console.cloud.google.com/iam-admin/iam?project=hair-transplant-dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://console.cloud.google.com/iam-admin/iam?project=hair-transplant-dev</a></p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">2. Find Your Service Account</h3>
              <p>Look for an account ending with <code className="bg-gray-800 px-2 py-1 rounded text-sm">@hair-transplant-dev.iam.gserviceaccount.com</code></p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">3. Add Required Roles</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Firebase Admin SDK Administrator Service Agent</li>
                <li>Service Usage Consumer</li>
                <li>Firebase Authentication Admin</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">4. Wait and Test</h3>
              <p>Wait 5-10 minutes for permissions to propagate, then run the test again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
