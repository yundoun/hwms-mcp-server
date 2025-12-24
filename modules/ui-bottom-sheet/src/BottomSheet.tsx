/**
 * BottomSheet Component
 * Modal sheet that slides up from the bottom
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './BottomSheet.module.css';

export type SnapPoint = number | 'content';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: SnapPoint[];
  initialSnap?: number;
  enableDragToDismiss?: boolean;
  showHandle?: boolean;
  showBackdrop?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 1],
  initialSnap = 0,
  enableDragToDismiss = true,
  showHandle = true,
  showBackdrop = true,
  closeOnBackdropClick = true,
  className = '',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const startY = useRef(0);
  const currentY = useRef(0);

  const getSnapHeight = useCallback((snap: SnapPoint): number => {
    if (snap === 'content') {
      return sheetRef.current?.scrollHeight || 300;
    }
    return window.innerHeight * snap;
  }, []);

  const getCurrentHeight = useCallback((): number => {
    return getSnapHeight(snapPoints[currentSnap]);
  }, [currentSnap, snapPoints, getSnapHeight]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentSnap(initialSnap);
      setDragOffset(0);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialSnap]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableDragToDismiss) return;
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentY.current - startY.current;
    const threshold = getCurrentHeight() * 0.3;

    if (diff > threshold) {
      // Find next lower snap point or close
      const nextSnap = currentSnap - 1;
      if (nextSnap < 0 || diff > getCurrentHeight() * 0.5) {
        onClose();
      } else {
        setCurrentSnap(nextSnap);
      }
    }

    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableDragToDismiss) return;
    setIsDragging(true);
    startY.current = e.clientY;
    currentY.current = e.clientY;
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      currentY.current = e.clientY;
      const diff = currentY.current - startY.current;
      if (diff > 0) {
        setDragOffset(diff);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentY.current - startY.current;
    const threshold = getCurrentHeight() * 0.3;

    if (diff > threshold) {
      onClose();
    }

    setDragOffset(0);
  }, [isDragging, getCurrentHeight, onClose]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const sheetHeight = getCurrentHeight();
  const translateY = dragOffset;

  return (
    <div className={styles.container}>
      {showBackdrop && (
        <div
          className={styles.backdrop}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      <div
        ref={sheetRef}
        className={`${styles.sheet} ${className} ${isDragging ? styles.dragging : ''}`}
        style={{
          height: `${sheetHeight}px`,
          transform: `translateY(${translateY}px)`,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title || '바텀 시트'}
      >
        {showHandle && (
          <div
            className={styles.handleContainer}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div className={styles.handle} />
          </div>
        )}
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
