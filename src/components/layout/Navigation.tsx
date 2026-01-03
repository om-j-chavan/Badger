'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/translations';

// ============================================
// BADGER - Navigation Component
// ============================================

const getNavItems = (appMode: 'simple' | 'advanced') => {
  const allItems = [
    // Calendar - Always visible
    {
      href: '/',
      labelKey: 'home',
      modes: ['simple', 'advanced'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    // Analytics - Simple: basic, Advanced: full
    {
      href: '/analytics',
      labelKey: 'analytics',
      modes: ['simple', 'advanced'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    // Diary Export - Always visible
    {
      href: '/diary',
      labelKey: 'diary',
      modes: ['simple', 'advanced'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    // Liabilities - Advanced only
    {
      href: '/liabilities',
      labelKey: 'liabilities',
      modes: ['advanced'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      subItems: [
        {
          href: '/liabilities/credit-cards',
          labelKey: 'creditCards',
        },
      ],
    },
    // Income - Advanced only
    {
      href: '/income',
      labelKey: 'income',
      modes: ['advanced'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    // Settings - Always visible (but content filtered inside)
    {
      href: '/settings',
      labelKey: 'settings',
      modes: ['simple', 'advanced'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    // Help - Advanced only
    {
      href: '/help',
      labelKey: 'help',
      modes: ['advanced'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Filter by mode
  return allItems.filter(item => item.modes.includes(appMode));
};

export function Navigation() {
  const pathname = usePathname();
  const { language, appMode } = useApp();
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
  const navItems = getNavItems(appMode);

  // Auto-expand parent if on sub-item page
  React.useEffect(() => {
    navItems.forEach((item) => {
      if (item.subItems && item.subItems.some((sub) => pathname.startsWith(sub.href))) {
        setExpandedItem(item.href);
      }
    });
  }, [pathname, navItems]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-divider z-30 md:relative md:border-t-0 md:border-r md:h-screen md:w-64 md:flex-shrink-0">
      {/* Desktop header */}
      <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-divider">
        <span className="text-3xl">🦡</span>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Badger</h1>
          <p className="text-xs text-text-secondary">Personal Finance</p>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex md:flex-col md:p-4 md:gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const isExpanded = expandedItem === item.href;
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.href} className="flex-1 md:flex-initial">
              {/* Main nav item */}
              <div className="relative">
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (hasSubItems) {
                      e.preventDefault();
                      setExpandedItem(isExpanded ? null : item.href);
                    }
                  }}
                  className={`
                    flex flex-col md:flex-row items-center justify-center md:justify-start
                    gap-1 md:gap-3 py-3 md:py-3 px-2 md:px-4
                    rounded-none md:rounded-xl
                    transition-all duration-200
                    ${
                      isActive
                        ? 'text-text-primary bg-primary/20 md:bg-primary/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-primary/10'
                    }
                  `}
                >
                  {item.icon}
                  <span className="text-xs md:text-sm font-medium">{t(item.labelKey, language, appMode)}</span>
                  {hasSubItems && (
                    <svg
                      className={`hidden md:block w-4 h-4 ml-auto transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
              </div>

              {/* Sub-items (desktop only) */}
              {hasSubItems && isExpanded && (
                <div className="hidden md:block ml-4 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = pathname.startsWith(subItem.href);
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`
                          flex items-center gap-3 py-2 px-4 rounded-lg
                          transition-all duration-200 text-sm
                          ${
                            isSubActive
                              ? 'text-text-primary bg-primary/10 font-medium'
                              : 'text-text-secondary hover:text-text-primary hover:bg-primary/5'
                          }
                        `}
                      >
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {t(subItem.labelKey, language, appMode)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
