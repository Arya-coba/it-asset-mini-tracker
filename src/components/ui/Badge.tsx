import React from 'react';
import { AssetStatus } from '../../../types/asset.ts';

interface BadgeProps {
  status?: AssetStatus | string;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'aktif' | 'rusak' | 'perbaikan';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, children, variant, className = '' }) => {
  if (status === 'aktif' || variant === 'aktif') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {children || 'Aktif'}
      </span>
    );
  }

  if (status === 'rusak' || variant === 'rusak') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        {children || 'Rusak'}
      </span>
    );
  }

  if (status === 'perbaikan' || variant === 'perbaikan') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {children || 'Perbaikan'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80 ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
