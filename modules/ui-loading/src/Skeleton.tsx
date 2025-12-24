/**
 * Skeleton Component
 * Placeholder loading animation
 */

import React from 'react';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
  count = 1,
}) => {
  const getStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (width) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }

    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }

    return style;
  };

  const renderSkeleton = (key?: number) => (
    <div
      key={key}
      className={`${styles.skeleton} ${styles[variant]} ${styles[animation]} ${className}`}
      style={getStyle()}
      aria-hidden="true"
    />
  );

  if (count > 1) {
    return (
      <div className={styles.group}>
        {Array.from({ length: count }, (_, i) => renderSkeleton(i))}
      </div>
    );
  }

  return renderSkeleton();
};

export default Skeleton;
