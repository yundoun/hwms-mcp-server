/**
 * useLoader Hook
 * MUI-based Loader with React Context state management
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

/** Loader type */
export type LoaderType = 'linear' | 'circular';

/** Loader state */
export interface LoaderState {
  /** Is loading visible */
  loading: boolean;
  /** Loader type */
  type: LoaderType;
  /** Loading message (optional) */
  message?: string;
  /** Is fullscreen overlay */
  fullscreen: boolean;
}

/** Loader context type */
interface LoaderContextType {
  /** Current loader state */
  loader: LoaderState;
  /** Show loader */
  showLoader: (options?: Partial<LoaderState>) => void;
  /** Hide loader */
  hideLoader: () => void;
  /** Show linear loader */
  showLinearLoader: (message?: string) => void;
  /** Show circular loader */
  showCircularLoader: (message?: string) => void;
  /** Check if loading */
  isLoading: boolean;
}

/** Default loader state */
const defaultState: LoaderState = {
  loading: false,
  type: 'linear',
  message: undefined,
  fullscreen: false,
};

/** Loader context */
const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

/** Loader provider props */
interface LoaderProviderProps {
  children: ReactNode;
  /** Default loader type */
  defaultType?: LoaderType;
  /** Default fullscreen mode */
  defaultFullscreen?: boolean;
}

/**
 * Loader Provider Component
 * Wrap your app with this to enable loader functionality
 */
export function LoaderProvider({
  children,
  defaultType = 'linear',
  defaultFullscreen = false,
}: LoaderProviderProps) {
  const [loader, setLoader] = useState<LoaderState>({
    ...defaultState,
    type: defaultType,
    fullscreen: defaultFullscreen,
  });

  const showLoader = useCallback((options?: Partial<LoaderState>) => {
    setLoader(prev => ({
      ...prev,
      loading: true,
      type: options?.type ?? prev.type,
      message: options?.message,
      fullscreen: options?.fullscreen ?? prev.fullscreen,
    }));
  }, []);

  const hideLoader = useCallback(() => {
    setLoader(prev => ({ ...prev, loading: false, message: undefined }));
  }, []);

  const showLinearLoader = useCallback((message?: string) => {
    showLoader({ type: 'linear', message, fullscreen: false });
  }, [showLoader]);

  const showCircularLoader = useCallback((message?: string) => {
    showLoader({ type: 'circular', message, fullscreen: true });
  }, [showLoader]);

  const value = useMemo(() => ({
    loader,
    showLoader,
    hideLoader,
    showLinearLoader,
    showCircularLoader,
    isLoading: loader.loading,
  }), [loader, showLoader, hideLoader, showLinearLoader, showCircularLoader]);

  return (
    <LoaderContext.Provider value={value}>
      {children}
    </LoaderContext.Provider>
  );
}

/**
 * useLoader Hook
 * Access loader functions from any component
 */
export function useLoader(): LoaderContextType {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
}

export default useLoader;
