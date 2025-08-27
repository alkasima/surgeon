'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernLayout } from '@/components/layout/modern-layout';

export default function UpgradeUsersPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleBulkUpgrade = async () => {
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('/api/admin/upgrade-all-users', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        setResults([
          `✅ Bulk migration completed!`,
          `📊 Total users processed: ${data.totalProcessed}`,
          `⬆️ Users migrated: ${data.usersUpgraded}`,
          `✨ Users already had unified credits: ${data.usersSkipped}`
        ]);
      } else {
        setResults([`❌ Bulk migration failed: ${data.error}`]);
      }
    } catch (error) {
      setResults([`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModernLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Admin: Migrate All Users</h1>
          <p className="text-muted-foreground">
            Migrate all existing users to the unified credit system
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bulk Credit Migration</CardTitle>
            <CardDescription>
              This will migrate all users to the unified credit system:
              <br />• Combines AI + Search credits into one balance
              <br />• Ensures minimum 100 credits per user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleBulkUpgrade} 
              disabled={loading}
              className="w-full"
              variant="default"
            >
              {loading ? 'Migrating All Users...' : 'Migrate All Users'}
            </Button>
            
            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md text-sm">
                    {result}
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-xs text-gray-500 border-t pt-4">
              <p><strong>⚠️ Admin Only:</strong> This page should only be used by administrators.</p>
              <p>This operation will scan all users and upgrade those with low credit balances.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}