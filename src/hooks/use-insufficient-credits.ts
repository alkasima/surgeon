// src/hooks/use-insufficient-credits.ts
"use client";

import { useState } from 'react';
import type { AIFeatureType } from '@/types/user';

interface InsufficientCreditsState {
  isOpen: boolean;
  creditsNeeded: number;
  featureName: string;
  currentCredits: number;
}

export function useInsufficientCredits() {
  const [state, setState] = useState<InsufficientCreditsState>({
    isOpen: false,
    creditsNeeded: 0,
    featureName: '',
    currentCredits: 0,
  });

  const showInsufficientCreditsDialog = (
    featureType: AIFeatureType,
    currentCredits: number
  ) => {
    const creditsNeeded = {
      summarizeNotes: 1,
      draftEmail: 2,
      analyzeSurgeon: 3
    }[featureType];

    const featureName = {
      summarizeNotes: 'Note Summarization',
      draftEmail: 'Email Drafting',
      analyzeSurgeon: 'Surgeon Analysis'
    }[featureType];

    setState({
      isOpen: true,
      creditsNeeded,
      featureName,
      currentCredits,
    });
  };

  const hideInsufficientCreditsDialog = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    ...state,
    showInsufficientCreditsDialog,
    hideInsufficientCreditsDialog,
  };
}