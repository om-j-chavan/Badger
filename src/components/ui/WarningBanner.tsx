'use client';

import React from 'react';
import type { Warning } from '@/types';

// ============================================
// BADGER - Warning Banner Component
// ============================================

interface WarningBannerProps {
  warnings: Warning[];
  currency?: string;
}

export function WarningBanner({ warnings, currency = '₹' }: WarningBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-3">
      {warnings.map((warning, index) => (
        <div
          key={index}
          className={`
            flex items-start gap-3 px-4 py-3 rounded-xl
            ${
              warning.severity === 'error'
                ? 'bg-error/10 border border-error/30'
                : 'bg-warning/10 border border-warning/30'
            }
          `}
        >
          <span className="text-xl flex-shrink-0">
            {warning.severity === 'error' ? '⚠️' : '💡'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">
              {warning.message}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {currency}
              {warning.currentValue.toLocaleString()} / {currency}
              {warning.limitValue.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Inline warning indicator
interface WarningIndicatorProps {
  show: boolean;
  message?: string;
}

export function WarningIndicator({ show, message }: WarningIndicatorProps) {
  if (!show) return null;

  return (
    <span
      className="inline-flex items-center text-warning"
      title={message || 'Warning'}
    >
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}
