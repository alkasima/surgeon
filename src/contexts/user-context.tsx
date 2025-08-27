"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserData, FeatureType, AIFeatureType } from '@/types/user';
import { CREDIT_COSTS } from '@/types/user';
import { useAuth } from './auth-context';
import { getUserData, checkCredits, useCredits, upgradeUserCredits, checkAICredits, decrementAICredits } from '@/lib/user-api';
import { useToast } from '@/hooks/use-toast';
import { ErrorHandler, ErrorType } from '@/lib/error-handling';

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
  checkAndUseAICredits: (featureType: AIFeatureType) => Promise<boolean>;
  checkAndUseCredits: (featureType: FeatureType) => Promise<boolean>;
  hasEnoughCredits: (featureType: FeatureType) => boolean;
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
      } else if (result.data) {
        // Check if user needs credit upgrade/migration (one-time migration)
        const currentCredits = result.data.credits || 0;
        const currentAICredits = result.data.aiCredits || 0;
        const currentSearchCredits = result.data.searchCredits || 0;
        
        if (currentCredits === 0 || (currentCredits < 50 && (currentAICredits > 0 || currentSearchCredits > 0))) {
          console.log('User needs credit migration/upgrade...');
          try {
            const upgradeResult = await upgradeUserCredits(user.uid);
            if (upgradeResult.success && upgradeResult.upgraded) {
              console.log('User credits upgraded successfully');
              // Fetch updated data
              const updatedResult = await getUserData(user.uid);
              if (updatedResult.data) {
                setUserData(updatedResult.data);
                return;
              }
            }
          } catch (upgradeError) {
            console.error('Error upgrading user credits:', upgradeError);
          }
        }
        
        setUserData(result.data);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Error in refreshUserData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndUseCredits = async (featureType: FeatureType): Promise<boolean> => {
    if (!user) {
      const authError = ErrorHandler.createError(
        ErrorType.AUTHENTICATION,
        "Please log in to use this feature"
      );
      ErrorHandler.handleError(authError);
      return false;
    }

    try {
      // Check if user has enough credits
      const creditCheck = await checkCredits(user.uid, featureType);
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
          `You need more credits to use this feature. Current balance: ${creditCheck.currentCredits || 0}`,
          undefined,
          undefined,
          false
        );
        ErrorHandler.handleError(creditError);
        return false;
      }

      // Deduct credits
      const deductResult = await useCredits(user.uid, featureType);
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
          credits: deductResult.remainingCredits || 0
        });
      }

      return true;
    } catch (error) {
      ErrorHandler.handleError(error);
      return false;
    }
  };

  const checkAndUseAICredits = async (featureType: AIFeatureType): Promise<boolean> => {
    return checkAndUseCredits(featureType);
  };

  const hasEnoughCredits = (featureType: FeatureType): boolean => {
    if (!userData) return false;
    const requiredCredits = CREDIT_COSTS[featureType];
    return (userData.credits || 0) >= requiredCredits;
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
      checkAndUseCredits,
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
