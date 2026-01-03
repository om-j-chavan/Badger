'use client';

// ============================================
// BADGER - Silent Win Toast Component
// ============================================

import { useEffect, useState } from 'react';
import type { SilentWin } from '@/types';

interface SilentWinToastProps {
  wins: SilentWin[];
  onDismiss?: () => void;
}

export default function SilentWinToast({ wins, onDismiss }: SilentWinToastProps) {
  const [currentWinIndex, setCurrentWinIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (wins.length === 0) return;

    // Show first win
    setIsVisible(true);

    // Auto-dismiss after 3 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);

      // Show next win or dismiss all
      setTimeout(() => {
        if (currentWinIndex < wins.length - 1) {
          setCurrentWinIndex(currentWinIndex + 1);
        } else {
          onDismiss?.();
        }
      }, 300); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(dismissTimer);
  }, [currentWinIndex, wins, onDismiss]);

  if (wins.length === 0 || currentWinIndex >= wins.length) return null;

  const currentWin = wins[currentWinIndex];

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div
        className={`
          pointer-events-auto max-w-sm transform transition-all duration-500 ease-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl shadow-2xl p-4 border border-primary/30 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce-slow">
                <span className="text-2xl">{currentWin.icon}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white mb-1">Silent Win! 🎉</h4>
              <p className="text-sm text-white/90">{currentWin.message}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onDismiss?.(), 300);
              }}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-white/20 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-white rounded-full animate-progress"
              style={{ animationDuration: '3s' }}
            />
          </div>
        </div>

        {/* Badge indicator if multiple wins */}
        {wins.length > 1 && (
          <div className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
            {wins.length}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for using Silent Wins
export function useSilentWins() {
  const [wins, setWins] = useState<SilentWin[]>([]);

  const checkForWins = async () => {
    try {
      // This would call an API endpoint that checks for silent wins
      // For now, it's a placeholder
      const response = await fetch('/api/silent-wins');
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setWins(data.data);
      }
    } catch (error) {
      console.error('Error checking for silent wins:', error);
    }
  };

  const dismissWins = () => {
    setWins([]);
  };

  return { wins, checkForWins, dismissWins };
}
