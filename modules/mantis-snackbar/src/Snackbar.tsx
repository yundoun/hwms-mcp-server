/**
 * Snackbar Component
 * MUI-based Snackbar with Alert styling
 * Simplified version of Mantis Snackbar
 */

import React from 'react';
import MuiSnackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Slide, { SlideProps } from '@mui/material/Slide';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from './useSnackbar';

/** Slide transition component */
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

/**
 * Snackbar Component
 * Renders the actual snackbar UI based on context state
 * Place this component at the root of your app (inside SnackbarProvider)
 */
export function Snackbar() {
  const { snackbar, closeSnackbar } = useSnackbar();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    closeSnackbar();
  };

  return (
    <MuiSnackbar
      open={snackbar.open}
      autoHideDuration={snackbar.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={snackbar.position}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={snackbar.showClose ? handleClose : undefined}
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: '100%', alignItems: 'center' }}
        action={
          snackbar.showClose ? (
            <IconButton
              size="small"
              aria-label="닫기"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : undefined
        }
      >
        {snackbar.message}
      </Alert>
    </MuiSnackbar>
  );
}

export default Snackbar;
