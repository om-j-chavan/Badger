'use client';

import React from 'react';
import { Navigation } from './Navigation';

// ============================================
// BADGER - App Shell Component
// ============================================

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Navigation />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
