import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 text-blue-500',
    md: 'w-8 h-8 text-blue-600',
    lg: 'w-12 h-12 text-blue-600',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
