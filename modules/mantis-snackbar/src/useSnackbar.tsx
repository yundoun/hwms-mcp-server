/**
 * useSnackbar Hook
 * MUI-based Snackbar with React Context state management
 * Simplified version of Mantis Snackbar without SWR dependency
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

/** Snackbar severity/variant types */
export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

/** Snackbar position */
export interface SnackbarPosition {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

/** Snackbar options */
export interface SnackbarOptions {
  /** Message to display */
  message: string;
  /** Severity/variant of the snackbar */
  severity?: SnackbarSeverity;
  /** Auto hide duration in ms (default: 3000, set to null to disable) */
  autoHideDuration?: number | null;
  /** Position of the snackbar */
  position?: SnackbarPosition;
  /** Show close button */
  showClose?: boolean;
}

/** Snackbar state */
export interface SnackbarState extends SnackbarOptions {
  open: boolean;
}

/** Snackbar context type */
interface SnackbarContextType {
  /** Current snackbar state */
  snackbar: SnackbarState;
  /** Open snackbar with options */
  openSnackbar: (options: SnackbarOptions) => void;
  /** Close current snackbar */
  closeSnackbar: () => void;
  /** Show success snackbar */
  showSuccess: (message: string) => void;
  /** Show error snackbar */
  showError: (message: string) => void;
  /** Show warning snackbar */
  showWarning: (message: string) => void;
  /** Show info snackbar */
  showInfo: (message: string) => void;
}

/** Default snackbar state */
const defaultState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 3000,
  position: { vertical: 'bottom', horizontal: 'right' },
  showClose: true,
};

/** Snackbar context */
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

/** Snackbar provider props */
interface SnackbarProviderProps {
  children: ReactNode;
  /** Default position for all snackbars */
  defaultPosition?: SnackbarPosition;
  /** Default auto hide duration */
  defaultAutoHideDuration?: number;
}

/**
 * Snackbar Provider Component
 * Wrap your app with this to enable snackbar functionality
 */
export function SnackbarProvider({
  children,
  defaultPosition = { vertical: 'bottom', horizontal: 'right' },
  defaultAutoHideDuration = 3000,
}: SnackbarProviderProps) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    ...defaultState,
    position: defaultPosition,
    autoHideDuration: defaultAutoHideDuration,
  });

  const openSnackbar = useCallback((options: SnackbarOptions) => {
    setSnackbar({
      open: true,
      message: options.message,
      severity: options.severity ?? 'info',
      autoHideDuration: options.autoHideDuration ?? defaultAutoHideDuration,
      position: options.position ?? defaultPosition,
      showClose: options.showClose ?? true,
    });
  }, [defaultPosition, defaultAutoHideDuration]);

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    openSnackbar({ message, severity: 'success' });
  }, [openSnackbar]);

  const showError = useCallback((message: string) => {
    openSnackbar({ message, severity: 'error' });
  }, [openSnackbar]);

  const showWarning = useCallback((message: string) => {
    openSnackbar({ message, severity: 'warning' });
  }, [openSnackbar]);

  const showInfo = useCallback((message: string) => {
    openSnackbar({ message, severity: 'info' });
  }, [openSnackbar]);

  const value = useMemo(() => ({
    snackbar,
    openSnackbar,
    closeSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }), [snackbar, openSnackbar, closeSnackbar, showSuccess, showError, showWarning, showInfo]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
}

/**
 * useSnackbar Hook
 * Access snackbar functions from any component
 */
export function useSnackbar(): SnackbarContextType {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

export default useSnackbar;
