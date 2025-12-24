/**
 * Toast Container Component
 * Manages and displays multiple toasts
 */

import React from 'react';
import Toast, { ToastProps, ToastPosition } from './Toast';
import styles from './ToastContainer.module.css';

export interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  position?: ToastPosition;
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  onClose,
}) => {
  return (
    <div className={`${styles.container} ${styles[position]}`}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default ToastContainer;
