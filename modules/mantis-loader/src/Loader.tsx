/**
 * Loader Component
 * MUI-based Linear Progress Loader
 * Fixed position at top of viewport
 */

import React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useLoader } from './useLoader';

/** Loader props */
export interface LoaderProps {
  /** Override loading state (for standalone use) */
  loading?: boolean;
  /** Progress color */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

/**
 * Loader Component
 * Displays a linear progress bar at the top of the viewport
 * Can be used standalone or with LoaderProvider context
 */
export function Loader({ loading: loadingProp, color = 'primary' }: LoaderProps) {
  // Try to use context, but allow standalone usage
  let isLoading = loadingProp;

  try {
    const context = useLoader();
    if (loadingProp === undefined && context.loader.type === 'linear') {
      isLoading = context.isLoading;
    }
  } catch {
    // Context not available, use prop only
  }

  if (!isLoading) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 2001,
        width: '100%',
      }}
    >
      <LinearProgress color={color} />
    </Box>
  );
}

export default Loader;
