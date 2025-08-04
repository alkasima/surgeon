import { toast } from '@/hooks/use-toast';

export enum ErrorType {
  AUTHENTICATION = 'authentication',
  INSUFFICIENT_CREDITS = 'insufficient_credits',
  AI_SERVICE = 'ai_service',
  PAYMENT = 'payment',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  retryable?: boolean;
}

export class ErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    details?: string,
    code?: string,
    retryable = false
  ): AppError {
    return {
      type,
      message,
      details,
      code,
      retryable,
    };
  }

  static handleError(error: AppError | Error | unknown, showToast = true): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      appError = this.parseError(error);
    } else if (this.isAppError(error)) {
      appError = error;
    } else {
      appError = this.createError(
        ErrorType.UNKNOWN,
        'An unexpected error occurred',
        typeof error === 'string' ? error : 'Unknown error'
      );
    }

    // Log error for debugging
    console.error('Error handled:', appError);

    // Show toast notification
    if (showToast) {
      this.showErrorToast(appError);
    }

    return appError;
  }

  private static parseError(error: Error): AppError {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return this.createError(
        ErrorType.AUTHENTICATION,
        'Authentication failed. Please log in again.',
        error.message,
        undefined,
        false
      );
    }

    // Credit errors
    if (message.includes('insufficient') && message.includes('credit')) {
      return this.createError(
        ErrorType.INSUFFICIENT_CREDITS,
        'You don\'t have enough AI credits for this action.',
        error.message,
        undefined,
        false
      );
    }

    // AI service errors
    if (message.includes('genkit') || message.includes('gemini') || message.includes('ai')) {
      return this.createError(
        ErrorType.AI_SERVICE,
        'AI service is temporarily unavailable. Please try again.',
        error.message,
        undefined,
        true
      );
    }

    // Payment errors
    if (message.includes('stripe') || message.includes('payment') || message.includes('billing')) {
      return this.createError(
        ErrorType.PAYMENT,
        'Payment processing failed. Please try again.',
        error.message,
        undefined,
        true
      );
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return this.createError(
        ErrorType.NETWORK,
        'Network error. Please check your connection and try again.',
        error.message,
        undefined,
        true
      );
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return this.createError(
        ErrorType.VALIDATION,
        'Please check your input and try again.',
        error.message,
        undefined,
        false
      );
    }

    // Default to unknown error
    return this.createError(
      ErrorType.UNKNOWN,
      'An unexpected error occurred. Please try again.',
      error.message,
      undefined,
      true
    );
  }

  private static isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'message' in error &&
      Object.values(ErrorType).includes((error as any).type)
    );
  }

  private static showErrorToast(error: AppError) {
    const variant = error.type === ErrorType.INSUFFICIENT_CREDITS ? 'default' : 'destructive';
    
    toast({
      title: this.getErrorTitle(error.type),
      description: error.message,
      variant,
      duration: error.retryable ? 5000 : 4000,
    });
  }

  private static getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorType.INSUFFICIENT_CREDITS:
        return 'Insufficient Credits';
      case ErrorType.AI_SERVICE:
        return 'AI Service Error';
      case ErrorType.PAYMENT:
        return 'Payment Error';
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.VALIDATION:
        return 'Validation Error';
      default:
        return 'Error';
    }
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Only retry for retryable errors
        const appError = this.parseError(lastError);
        if (!appError.retryable) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError!;
  }
}

// Utility functions for common error scenarios
export const handleAIError = (error: unknown) => {
  return ErrorHandler.handleError(error);
};

export const handlePaymentError = (error: unknown) => {
  return ErrorHandler.handleError(error);
};

export const handleNetworkError = (error: unknown) => {
  return ErrorHandler.handleError(error);
};
