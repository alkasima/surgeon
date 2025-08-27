// src/components/credits/insufficient-credits-provider.tsx
"use client";

import { useEffect, useState } from 'react';
import { InsufficientCreditsDialog } from './insufficient-credits-dialog';
import { setInsufficientCreditsCallback } from '@/lib/error-handling';

interface InsufficientCreditsState {
  isOpen: boolean;
  creditsNeeded: number;
  featureName: string;
  currentCredits: number;
}

export function InsufficientCreditsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InsufficientCreditsState>({
    isOpen: false,
    creditsNeeded: 0,
    featureName: '',
    currentCredits: 0,
  });

  useEffect(() => {
    // Set up global callback for insufficient credits
    setInsufficientCreditsCallback((featureName: string, currentCredits: number, creditsNeeded: number) => {
      setState({
        isOpen: true,
        creditsNeeded,
        featureName,
        currentCredits,
      });
    });

    // Cleanup on unmount
    return () => {
      setInsufficientCreditsCallback(null);
    };
  }, []);

  const handleClose = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      {children}
      <InsufficientCreditsDialog
        isOpen={state.isOpen}
        onClose={handleClose}
        creditsNeeded={state.creditsNeeded}
        featureName={state.featureName}
        currentCredits={state.currentCredits}
      />
    </>
  );
}