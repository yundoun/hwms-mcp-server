/**
 * LoadingOverlay Component
 * Full-page loading overlay
 */

import React from 'react';
import Spinner from './Spinner';
import styles from './LoadingOverlay.module.css';

export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  blur?: boolean;
  spinnerSize?: 'small' | 'medium' | 'large';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = '로딩 중...',
  blur = true,
  spinnerSize = 'large',
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`${styles.overlay} ${blur ? styles.blur : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className={styles.content}>
        <Spinner size={spinnerSize} color="white" />
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
