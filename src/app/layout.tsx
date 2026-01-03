import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { PWAInstaller } from '@/components/PWAInstaller';

// ============================================
// BADGER - Root Layout
// ============================================

export const metadata: Metadata = {
  title: 'Badger - Personal Finance Manager',
  description: 'A local-only personal finance manager for people who are bad at managing money',
  manifest: '/manifest.json',
  themeColor: '#7FC8A9',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Badger',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <AppProvider>
          {children}
          <PWAInstaller />
        </AppProvider>
      </body>
    </html>
  );
}
