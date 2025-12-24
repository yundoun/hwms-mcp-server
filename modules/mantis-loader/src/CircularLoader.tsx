/**
 * CircularLoader Component
 * MUI-based Circular Progress Loader
 * Can be used as fullscreen overlay or inline
 */

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';
import { useLoader } from './useLoader';

/** CircularLoader props */
export interface CircularLoaderProps {
  /** Override loading state (for standalone use) */
  loading?: boolean;
  /** Loading message */
  message?: string;
  /** Show as fullscreen overlay */
  fullscreen?: boolean;
  /** Progress size */
  size?: number;
  /** Progress color */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

/**
 * CircularLoader Component
 * Displays a circular progress indicator
 * Can be fullscreen overlay or inline centered
 */
export function CircularLoader({
  loading: loadingProp,
  message: messageProp,
  fullscreen: fullscreenProp,
  size = 40,
  color = 'primary',
}: CircularLoaderProps) {
  // Try to use context, but allow standalone usage
  let isLoading = loadingProp;
  let message = messageProp;
  let fullscreen = fullscreenProp;

  try {
    const context = useLoader();
    if (loadingProp === undefined && context.loader.type === 'circular') {
      isLoading = context.isLoading;
      message = messageProp ?? context.loader.message;
      fullscreen = fullscreenProp ?? context.loader.fullscreen;
    }
  } catch {
    // Context not available, use props only
  }

  if (!isLoading) {
    return null;
  }

  const content = (
    <Stack
      spacing={2}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        height: fullscreen ? '100%' : 'auto',
        minHeight: fullscreen ? undefined : 200,
      }}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Stack>
  );

  if (fullscreen) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
        }}
        open={isLoading}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4,
            minWidth: 200,
          }}
        >
          <CircularProgress size={size} color={color} />
          {message && (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          )}
        </Stack>
      </Backdrop>
    );
  }

  return content;
}

export default CircularLoader;
