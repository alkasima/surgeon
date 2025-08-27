// src/app/test-credits/page.tsx
"use client";

import { ModernLayout } from '@/components/layout/modern-layout';
import { TestInsufficientCredits } from '@/components/dev/test-insufficient-credits';
import { DebugCreditFlow } from '@/components/dev/debug-credit-flow';
import { CreditUpgradeTester } from '@/components/dev/credit-upgrade-tester';

export default function TestCreditsPage() {
  return (
    <ModernLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Test Insufficient Credits</h1>
          <p className="text-muted-foreground">
            Test the insufficient credits dialogs and purchase flow
          </p>
        </div>
        
        <TestInsufficientCredits />
        
        <CreditUpgradeTester />
        
        <DebugCreditFlow />
      </div>
    </ModernLayout>
  );
}