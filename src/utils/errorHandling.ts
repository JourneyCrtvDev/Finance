export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export const createErrorState = (message: string, type: 'error' | 'warning' | 'info' = 'error'): ErrorState => ({
  message,
  type,
  timestamp: new Date()
});

export const createLoadingState = (isLoading: boolean, message?: string): LoadingState => ({
  isLoading,
  message
});

export const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  setLoading: (state: LoadingState) => void,
  setError: (error: ErrorState | null) => void,
  loadingMessage?: string
): Promise<T | null> => {
  try {
    setLoading(createLoadingState(true, loadingMessage));
    setError(null);
    
    const result = await operation();
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    setError(createErrorState(errorMessage));
    return null;
  } finally {
    setLoading(createLoadingState(false));
  }
};

export const withErrorBoundary = <T extends any[]>(
  fn: (...args: T) => Promise<any>,
  onError?: (error: Error) => void
) => {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Error in async operation:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
      throw error;
    }
  };
};