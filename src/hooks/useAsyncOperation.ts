import { useState, useCallback } from 'react';
import { ErrorState, LoadingState, createErrorState, createLoadingState } from '../utils/errorHandling';

export const useAsyncOperation = () => {
  const [loading, setLoading] = useState<LoadingState>(createLoadingState(false));
  const [error, setError] = useState<ErrorState | null>(null);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T | null> => {
    try {
      setLoading(createLoadingState(true, loadingMessage));
      setError(null);
      
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(createErrorState(errorMessage));
      return null;
    } finally {
      setLoading(createLoadingState(false));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
    isLoading: loading.isLoading
  };
};