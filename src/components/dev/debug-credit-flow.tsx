// src/components/dev/debug-credit-flow.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { Textarea } from '@/components/ui/textarea';

export function DebugCreditFlow() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUser();
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testDirectCreditAddition = async () => {
    if (!user?.uid) {
      addLog('ERROR: No user logged in');
      return;
    }

    setIsLoading(true);
    addLog('Starting direct credit addition test...');
    addLog(`Current user: ${user.uid}`);
    addLog(`Current AI credits before: ${userData?.aiCredits || 0}`);
    addLog(`Current search credits before: ${userData?.searchCredits || 0}`);

    try {
      // Add 10 test credits
      const response = await fetch('/api/credits/add-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          credits: 10,
          reason: 'Debug test'
        }),
      });

      const data = await response.json();
      addLog(`API Response: ${JSON.stringify(data)}`);

      if (response.ok) {
        addLog(`Credits added successfully. New total: ${data.newTotal}`);
        
        // Wait and refresh
        addLog('Waiting 2 seconds before refresh...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        addLog('Refreshing user data...');
        await refreshUserData();
        
        // Wait a bit more for the context to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addLog(`AI credits after refresh: ${userData?.aiCredits || 0}`);
        addLog(`Search credits after refresh: ${userData?.searchCredits || 0}`);
        
        // Also try to fetch fresh data directly
        addLog('Fetching fresh user data directly...');
        const freshResponse = await fetch(`/api/user/${user.uid}`);
        if (freshResponse.ok) {
          const freshData = await freshResponse.json();
          addLog(`Fresh data from API: AI=${freshData.aiCredits}, Search=${freshData.searchCredits}`);
        }
      } else {
        addLog(`ERROR: ${data.error}`);
      }
    } catch (error) {
      addLog(`ERROR: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUserDataRefresh = async () => {
    addLog('Testing user data refresh...');
    addLog(`Credits before refresh: ${userData?.aiCredits || 0}`);
    
    await refreshUserData();
    
    addLog(`Credits after refresh: ${userData?.aiCredits || 0}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Credit Flow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Current State</h3>
            <p className="text-sm">User ID: {user?.uid || 'Not logged in'}</p>
            <p className="text-sm">AI Credits: {userData?.aiCredits || 0}</p>
            <p className="text-sm">Search Credits: {userData?.searchCredits || 0}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Test Actions</h3>
            <div className="space-y-2">
              <Button 
                onClick={testDirectCreditAddition}
                disabled={isLoading}
                size="sm"
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Add 10 Credits'}
              </Button>
              <Button 
                onClick={testUserDataRefresh}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Test Refresh User Data
              </Button>
              <Button 
                onClick={clearLogs}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Clear Logs
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold">Debug Logs</h3>
          <Textarea
            value={logs.join('\n')}
            readOnly
            rows={15}
            className="font-mono text-xs"
            placeholder="Logs will appear here..."
          />
        </div>
      </CardContent>
    </Card>
  );
}