import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';

// ============================================
// BADGER - Root Layout
// ============================================

export const metadata: Metadata = {
  title: 'Badger - Personal Finance Manager',
  description: 'A local-only personal finance manager for people who are bad at managing money',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
