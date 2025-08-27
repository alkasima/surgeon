// src/components/dev/test-insufficient-credits.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InsufficientCreditsDialog } from '@/components/credits/insufficient-credits-dialog';
import { InsufficientSearchCreditsDialog } from '@/components/credits/insufficient-search-credits-dialog';
import { useUser } from '@/contexts/user-context';
import { ErrorHandler, ErrorType } from '@/lib/error-handling';

export function TestInsufficientCredits() {
  const { userData, checkAndUseAICredits } = useUser();
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  const testAICreditsDialog = () => {
    setShowAIDialog(true);
  };

  const testSearchCreditsDialog = () => {
    setShowSearchDialog(true);
  };

  const testGlobalErrorHandler = () => {
    // Simulate an insufficient credits error that should trigger the global dialog
    const error = ErrorHandler.createError(
      ErrorType.INSUFFICIENT_CREDITS,
      'You need more AI credits to use this feature. Current balance: 2',
      'Test error for surgeon analysis',
      undefined,
      false
    );
    ErrorHandler.handleError(error);
  };

  const testAIFeatureWithoutCredits = async () => {
    // This will trigger the global insufficient credits dialog if user doesn't have enough credits
    await checkAndUseAICredits('analyzeSurgeon');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Insufficient Credits Dialogs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Current Balances</h3>
            <p className="text-sm">AI Credits: {userData?.aiCredits || 0}</p>
            <p className="text-sm">Search Credits: {userData?.searchCredits || 0}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Test Dialogs</h3>
            <div className="space-y-2">
              <Button 
                onClick={testAICreditsDialog}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Test AI Credits Dialog
              </Button>
              <Button 
                onClick={testSearchCreditsDialog}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Test Search Credits Dialog
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold">Test Global Error Handler</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={testGlobalErrorHandler}
              variant="outline"
              size="sm"
            >
              Test Global Dialog
            </Button>
            <Button 
              onClick={testAIFeatureWithoutCredits}
              variant="outline"
              size="sm"
            >
              Test Real AI Feature
            </Button>
          </div>
        </div>

        {/* Direct Dialog Tests */}
        <InsufficientCreditsDialog
          isOpen={showAIDialog}
          onClose={() => setShowAIDialog(false)}
          creditsNeeded={3}
          featureName="Surgeon Analysis"
          currentCredits={userData?.aiCredits || 0}
        />

        <InsufficientSearchCreditsDialog
          isOpen={showSearchDialog}
          onClose={() => setShowSearchDialog(false)}
          creditsNeeded={5}
          featureName="Surgeon Search"
          currentCredits={userData?.searchCredits || 0}
        />
      </CardContent>
    </Card>
  );
}