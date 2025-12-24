/**
 * useBottomSheet Hook
 * Provides bottom sheet state management
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import BottomSheet, { BottomSheetProps, SnapPoint } from './BottomSheet';

interface BottomSheetConfig extends Omit<BottomSheetProps, 'isOpen' | 'onClose' | 'children'> {
  content: ReactNode;
}

interface BottomSheetContextValue {
  isOpen: boolean;
  open: (config: BottomSheetConfig) => void;
  close: () => void;
  update: (config: Partial<BottomSheetConfig>) => void;
}

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

export interface BottomSheetProviderProps {
  children: ReactNode;
}

export const BottomSheetProvider: React.FC<BottomSheetProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<BottomSheetConfig | null>(null);

  const open = useCallback((newConfig: BottomSheetConfig) => {
    setConfig(newConfig);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const update = useCallback((updates: Partial<BottomSheetConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return (
    <BottomSheetContext.Provider value={{ isOpen, open, close, update }}>
      {children}
      {config && (
        <BottomSheet
          isOpen={isOpen}
          onClose={close}
          title={config.title}
          snapPoints={config.snapPoints}
          initialSnap={config.initialSnap}
          enableDragToDismiss={config.enableDragToDismiss}
          showHandle={config.showHandle}
          showBackdrop={config.showBackdrop}
          closeOnBackdropClick={config.closeOnBackdropClick}
          className={config.className}
        >
          {config.content}
        </BottomSheet>
      )}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = (): BottomSheetContextValue => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};

/**
 * Simple hook for local bottom sheet state
 */
export const useBottomSheetState = (
  initialOpen = false
): [boolean, () => void, () => void, () => void] => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return [isOpen, open, close, toggle];
};

export default useBottomSheet;
