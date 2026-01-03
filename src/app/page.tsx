'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AppShell } from '@/components/layout/AppShell';
import { Calendar } from '@/components/calendar/Calendar';
import { ExpenseView } from '@/components/expense/ExpenseView';
import { WarningBanner, MonthlyReflectionModal } from '@/components/ui';
import { VercelLanding } from '@/components/VercelLanding';
import type { Warning, Settings, MonthlyReflection } from '@/types';

// ============================================
// BADGER - Home Page (Calendar)
// ============================================

export default function HomePage() {
  // Check if running on Vercel by hostname
  const [showLanding, setShowLanding] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [previousReflection, setPreviousReflection] = useState<string | null>(null);

  // Check if on Vercel and toggle landing page
  useEffect(() => {
    const hostname = window.location.hostname;
    // Show landing page if on Vercel domain, otherwise show app
    if (hostname.includes('vercel.app')) {
      setShowLanding(true);
    } else {
      setShowLanding(false);
    }
  }, []);

  // Show landing page on Vercel
  if (showLanding) {
    return <VercelLanding />;
  }

  // Fetch warnings
  useEffect(() => {
    async function fetchWarnings() {
      try {
        const [warningsRes, settingsRes] = await Promise.all([
          fetch('/api/analytics?type=warnings'),
          fetch('/api/settings'),
        ]);

        const warningsData = await warningsRes.json();
        const settingsData = await settingsRes.json();

        setWarnings(warningsData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching warnings:', error);
      }
    }

    fetchWarnings();
  }, [selectedDate]);

  // Check if monthly reflection is needed
  useEffect(() => {
    async function checkReflection() {
      try {
        const [hasReflectionRes, prevReflectionRes] = await Promise.all([
          fetch('/api/monthly-reflection?type=check-current'),
          fetch('/api/monthly-reflection?type=previous'),
        ]);

        const hasReflectionData = await hasReflectionRes.json();
        const prevReflectionData = await prevReflectionRes.json();

        setPreviousReflection(prevReflectionData?.reflection || null);

        // Show modal if no reflection for current month
        if (!hasReflectionData.hasReflection) {
          setShowReflectionModal(true);
        }
      } catch (error) {
        console.error('Error checking reflection:', error);
      }
    }

    checkReflection();
  }, []);

  return (
    <AppShell>
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6">
          <WarningBanner warnings={warnings} currency={settings?.currency} />
        </div>
      )}

      {/* Content */}
      {selectedDate ? (
        <ExpenseView date={selectedDate} onClose={() => setSelectedDate(null)} />
      ) : (
        <Calendar
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
        />
      )}

      {/* Monthly Reflection Modal */}
      <MonthlyReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        month={new Date().getMonth()}
        year={new Date().getFullYear()}
        previousReflection={previousReflection}
      />
    </AppShell>
  );
}
