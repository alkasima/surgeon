"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserData, AIFeatureType } from '@/types/user';
import { useAuth } from './auth-context';
import { getUserData, checkAICredits, decrementAICredits } from '@/app/user/actions';
import { useToast } from '@/hooks/use-toast';
import { ErrorHandler, ErrorType } from '@/lib/error-handling';

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
  checkAndUseAICredits: (featureType: AIFeatureType) => Promise<boolean>;
  hasEnoughCredits: (featureType: AIFeatureType) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshUserData = async () => {
    if (!user) {
      setUserData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getUserData(user.uid);
      if (result.error) {
        const appError = ErrorHandler.createError(
          ErrorType.NETWORK,
          "Failed to load user data",
          result.error
        );
        ErrorHandler.handleError(appError);
      } else {
        setUserData(result.data || null);
      }
    } catch (error) {
      console.error('Error in refreshUserData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndUseAICredits = async (featureType: AIFeatureType): Promise<boolean> => {
    if (!user) {
      const authError = ErrorHandler.createError(
        ErrorType.AUTHENTICATION,
        "Please log in to use AI features"
      );
      ErrorHandler.handleError(authError);
      return false;
    }

    try {
      // Check if user has enough credits
      const creditCheck = await checkAICredits(user.uid, featureType);
      if (creditCheck.error) {
        const error = ErrorHandler.createError(
          ErrorType.NETWORK,
          "Failed to check credit balance",
          creditCheck.error
        );
        ErrorHandler.handleError(error);
        return false;
      }

      if (!creditCheck.hasCredits) {
        const creditError = ErrorHandler.createError(
          ErrorType.INSUFFICIENT_CREDITS,
          `You need more AI credits to use this feature. Current balance: ${creditCheck.currentCredits || 0}`,
          undefined,
          undefined,
          false
        );
        ErrorHandler.handleError(creditError);
        return false;
      }

      // Deduct credits
      const deductResult = await decrementAICredits(user.uid, featureType);
      if (deductResult.error) {
        const error = ErrorHandler.createError(
          ErrorType.NETWORK,
          "Failed to process credit deduction",
          deductResult.error
        );
        ErrorHandler.handleError(error);
        return false;
      }

      // Update local state
      if (userData) {
        setUserData({
          ...userData,
          aiCredits: deductResult.remainingCredits || 0
        });
      }

      return true;
    } catch (error) {
      ErrorHandler.handleError(error);
      return false;
    }
  };

  const hasEnoughCredits = (featureType: AIFeatureType): boolean => {
    if (!userData) return false;
    const requiredCredits = {
      summarizeNotes: 1,
      draftEmail: 2,
      analyzeSurgeon: 3
    }[featureType];
    return (userData.aiCredits || 0) >= requiredCredits;
  };

  // Load user data when user changes
  useEffect(() => {
    refreshUserData();
  }, [user]);

  return (
    <UserContext.Provider value={{
      userData,
      isLoading,
      refreshUserData,
      checkAndUseAICredits,
      hasEnoughCredits
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
