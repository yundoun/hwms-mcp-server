/**
 * useLoading Hook
 * Provides global loading state management
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import LoadingOverlay from './LoadingOverlay';

interface LoadingContextValue {
  isLoading: boolean;
  message: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export interface LoadingProviderProps {
  children: ReactNode;
  blur?: boolean;
  spinnerSize?: 'small' | 'medium' | 'large';
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  blur = true,
  spinnerSize = 'large',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('로딩 중...');

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg || '로딩 중...');
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>, msg?: string): Promise<T> => {
      showLoading(msg);
      try {
        const result = await promise;
        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return (
    <LoadingContext.Provider
      value={{ isLoading, message, showLoading, hideLoading, withLoading }}
    >
      {children}
      <LoadingOverlay
        isVisible={isLoading}
        message={message}
        blur={blur}
        spinnerSize={spinnerSize}
      />
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextValue => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default useLoading;
