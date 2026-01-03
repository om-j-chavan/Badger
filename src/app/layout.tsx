import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
