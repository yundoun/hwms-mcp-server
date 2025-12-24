/**
 * useToast Hook
 * Provides toast notification functionality
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastContainer, { ToastItem } from './ToastContainer';
import { ToastType, ToastPosition } from './Toast';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => string;
  hideToast: (id: string) => void;
  hideAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;
const generateId = () => `toast-${++toastId}`;

export interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      const id = generateId();
      const newToast: ToastItem = {
        id,
        message,
        type: options.type || 'info',
        duration: options.duration ?? 3000,
        position: options.position || defaultPosition,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Limit max toasts
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      return id;
    },
    [defaultPosition, maxToasts]
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAll }}>
      {children}
      <ToastContainer toasts={toasts} position={defaultPosition} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions
export const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => {
    // Note: This requires ToastProvider to be mounted
    console.warn('toast.success called outside of ToastProvider context');
  },
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => {
    console.warn('toast.error called outside of ToastProvider context');
  },
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => {
    console.warn('toast.warning called outside of ToastProvider context');
  },
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => {
    console.warn('toast.info called outside of ToastProvider context');
  },
};

export default useToast;
