import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getStatusBadgeClass } from '../../utils/formatters';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'primary' | 'secondary' | 'outline';
  status?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'status',
  status,
  className,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  let variantClass = '';
  if (variant === 'status' || status) {
    variantClass = getStatusBadgeClass(status || (typeof children === 'string' ? children : ''));
  } else if (variant === 'primary') {
    variantClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (variant === 'secondary') {
    variantClass = 'bg-slate-100 text-slate-700 border-slate-200';
  } else if (variant === 'outline') {
    variantClass = 'bg-transparent text-slate-600 border-slate-300';
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-full border ring-1 ring-inset',
          sizeStyles[size],
          variantClass,
          className
        )
      )}
    >
      {children}
    </span>
  );
};
