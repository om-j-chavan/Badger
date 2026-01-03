'use client';

import { useApp } from '@/contexts/AppContext';
import type { AppMode } from '@/types';

export default function ModeSwitcher() {
  const { appMode, updateAppMode } = useApp();

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAppMode(e.target.value as AppMode);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={appMode}
        onChange={handleModeChange}
        className="px-3 py-2 text-sm rounded-lg bg-card border border-divider text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      >
        <option value="simple">Simple Mode</option>
        <option value="advanced">Advanced Mode</option>
      </select>
    </div>
  );
}
