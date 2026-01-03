'use client';

import React from 'react';

// ============================================
// BADGER - Card Component
// ============================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  onClick,
  hover = false,
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-card rounded-2xl shadow-soft
        ${paddingStyles[padding]}
        ${hover ? 'hover:shadow-md cursor-pointer transition-shadow' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Stat Card for displaying metrics
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-success/5 border border-success/20',
    warning: 'bg-warning/5 border border-warning/20',
    error: 'bg-error/5 border border-error/20',
  };

  return (
    <div className={`rounded-2xl p-5 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{label}</p>
          <p className="text-2xl font-semibold text-text-primary">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-1 ${
                trend.value >= 0 ? 'text-error' : 'text-success'
              }`}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%{' '}
              {trend.label && <span className="text-text-secondary">{trend.label}</span>}
            </p>
          )}
        </div>
        {icon && (
          <span className="text-2xl opacity-50">{icon}</span>
        )}
      </div>
    </div>
  );
}
