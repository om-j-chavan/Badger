# 🎨 UI/UX Refinements - Implementation Status

## ✅ Completed (Phase 1)

### 1. Type System ✓
**File:** `src/types/index.ts`
- Added `AppMode`: 'simple' | 'advanced'
- Added `Language`: 'en' | 'mr'
- Added `Theme`: 'light' | 'dark'
- Updated `Settings` interface with new fields

### 2. Database Schema ✓
**File:** `src/lib/db.ts`
- Migration 5 created for UI/UX preferences
- Added columns:
  - `appMode` (default: 'advanced')
  - `theme` (default: 'light')
  - `language` (default: 'en')
  - `enableImpulseTimer` (default: 1)
  - `enableAutoBackupReminder` (default: 1)

### 3. Settings Operations ✓
**File:** `src/lib/operations/settings.ts`
- Updated `getSettings()` to return new fields
- Updated `updateSettings()` to handle new fields
- Added proper type imports

---

## 🔄 Remaining Work (Phase 2)

### 1. Theme System (CRITICAL)

**Create:** `src/lib/theme.ts`
```typescript
export const themes = {
  simple: {
    light: {
      primary: '#ADEBB3',      // Mint
      accent: '#D3AF37',       // Gold
      background: '#F6FBF8',
      card: '#FFFFFF',
      textPrimary: '#1A1F1E',
      textSecondary: '#6B7280',
    },
    dark: {
      background: '#121615',
      card: '#1A1F1E',
      textPrimary: '#E6F0EC',
      textSecondary: '#A5B5AF',
      divider: '#2A3331',
      primary: '#6FBF96',      // Muted mint
      accent: '#BFA246',       // Muted gold
    }
  },
  advanced: {
    light: {
      primary: '#D3AF37',      // Gold (inverted)
      accent: '#ADEBB3',       // Mint (inverted)
      background: '#F6FBF8',
      card: '#FFFFFF',
      textPrimary: '#1A1F1E',
      textSecondary: '#6B7280',
    },
    dark: {
      background: '#121615',
      card: '#1A1F1E',
      textPrimary: '#E6F0EC',
      textSecondary: '#A5B5AF',
      divider: '#2A3331',
      primary: '#BFA246',      // Muted gold (inverted)
      accent: '#6FBF96',       // Muted mint (inverted)
    }
  }
};
```

**Create:** `src/contexts/ThemeContext.tsx`
- Provider that reads settings
- Applies CSS variables based on mode + theme
- Handles smooth transitions (150ms)

**Update:** `src/app/globals.css`
- Convert to CSS variables
- Add dark mode styles
- Add transition classes

### 2. Language System

**Create:** `src/lib/translations.ts`
```typescript
export const translations = {
  en: {
    // Navigation
    home: 'Home',
    analytics: 'Analytics',
    income: 'Income',
    liabilities: 'Liabilities',
    settings: 'Settings',
    help: 'Help',

    // Simple Mode overrides
    unnecessary: 'Optional',
    overspend: 'Spent a bit more',
    creditLiability: 'Upcoming Bill',

    // Messages
    doingOkay: "You're doing okay",
    bitHigher: 'A bit higher than usual',

    // ... all UI strings
  },
  mr: {
    // Marathi translations
    home: 'मुख्यपृष्ठ',
    analytics: 'विश्लेषण',
    // ... all strings in Marathi
  }
};

export function t(key: string, language: Language): string {
  return translations[language][key] || key;
}
```

**Create:** `src/contexts/LanguageContext.tsx`
- Provider for language
- `useTranslation()` hook
- Reads from settings

### 3. App Mode Context

**Create:** `src/contexts/AppModeContext.tsx`
```typescript
export const AppModeContext = createContext<{
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isSimpleMode: boolean;
}>({
  appMode: 'advanced',
  setAppMode: () => {},
  isSimpleMode: false,
});

export function useAppMode() {
  return useContext(AppModeContext);
}
```

### 4. Mode Switcher Component

**Create:** `src/components/ui/ModeSwitcher.tsx`
- Dropdown in top navigation
- Shows current mode
- Updates settings on change
- Triggers theme switch

### 5. Simple Mode Visibility Logic

**Create:** `src/lib/simpleMode.ts`
```typescript
export const simpleModeSh

ows = {
  calendar: true,
  dailyEntries: true,
  addDuplicate: true,
  totalToday: true,
  totalMonth: true,
  monthlySavings: true,
  weeklyVibe: true,  // if enabled
  silentWins: true,
  basicCategoryChart: true,
};

export const simpleModeHides = {
  advancedAnalytics: true,
  trendCharts: true,
  forecasting: true,
  cutAnalysis: true,
  creditStatementsDetail: true,
  moodCorrelations: true,
  regretTracking: true,
  vibeScore: true,
  streaks: true,
  reflectionHistory: true,
  budgetAdherence: true,
  impulseTimer: true,
};

export function shouldShow(component: string, appMode: AppMode): boolean {
  if (appMode === 'advanced') return true;
  return simpleModeSh

ows[component] === true;
}
```

### 6. Update Analytics Page

**File:** `src/app/analytics/page.tsx`
- Wrap advanced components with visibility checks
- Show only allowed components in Simple Mode
- Apply Simple Mode styling (larger fonts, more spacing)

**Simple Mode Shows:**
```typescript
if (isSimpleMode) {
  return (
    <>
      <Calendar />
      <MonthlySavingsCard /> {/* Number only, no % */}
      <SimpleCategoryChart /> {/* Basic pie chart only */}
      <GentleMessage /> {/* "You're doing okay" / "A bit higher than usual" */}
    </>
  );
}
```

### 7. Update Settings Page

**File:** `src/app/settings/page.tsx`

Add new sections:
```typescript
// Preferences Tab
<Select
  label="App Mode"
  value={settings.appMode}
  onChange={(value) => updateSettings({ appMode: value })}
  options={[
    { value: 'simple', label: 'Simple Mode' },
    { value: 'advanced', label: 'Advanced Mode' },
  ]}
/>

<Toggle
  label="Dark Mode"
  value={settings.theme === 'dark'}
  onChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })}
/>

<Select
  label="Language"
  value={settings.language}
  onChange={(value) => updateSettings({ language: value })}
  options={[
    { value: 'en', label: 'English' },
    { value: 'mr', label: 'मराठी (Marathi)' },
  ]}
/>

<Toggle
  label="Enable Mood Tracking"
  value={settings.enableMoodTracking}
  onChange={(checked) => updateSettings({ enableMoodTracking: checked })}
/>

<Toggle
  label="Enable Regret Tracking"
  value={settings.enableRegretTracking}
  onChange={(checked) => updateSettings({ enableRegretTracking: checked })}
/>

<Toggle
  label="Enable Impulse Timer"
  value={settings.enableImpulseTimer}
  onChange={(checked) => updateSettings({ enableImpulseTimer: checked })}
/>

// Data Safety Tab
<Toggle
  label="Auto Backup Reminder"
  value={settings.enableAutoBackupReminder}
  onChange={(checked) => updateSettings({ enableAutoBackupReminder: checked })}
/>
```

### 8. Update Entry Form

**File:** `src/components/expense/EntryForm.tsx`
- Check `settings.enableImpulseTimer` before showing timer
- Check `settings.enableMoodTracking` before showing mood picker
- Check `settings.enableRegretTracking` before showing regret checkbox
- Use translated labels from language context

### 9. Simple Mode Language Changes

**Create:** `src/lib/simpleLanguage.ts`
```typescript
export function getSimpleLabel(key: string, appMode: AppMode, language: Language): string {
  if (appMode === 'simple' && language === 'en') {
    const simpleLabs = {
      'unnecessary': 'Optional',
      'overspend': 'Spent a bit more',
      'credit_liability': 'Upcoming Bill',
    };
    return simpleLabs[key] || key;
  }
  return t(key, language);
}
```

### 10. Apply CSS Variables

**Update:** `src/app/globals.css`
```css
:root {
  /* Set by ThemeProvider based on mode + theme */
  --color-primary: #ADEBB3;
  --color-accent: #D3AF37;
  --color-background: #F6FBF8;
  --color-card: #FFFFFF;
  --color-text-primary: #1A1F1E;
  --color-text-secondary: #6B7280;

  /* Transitions */
  --transition-theme: 150ms ease;
}

[data-theme="dark"] {
  --color-background: #121615;
  --color-card: #1A1F1E;
  --color-text-primary: #E6F0EC;
  --color-text-secondary: #A5B5AF;
  --color-divider: #2A3331;
  --color-primary: #6FBF96;
  --color-accent: #BFA246;
}

[data-mode="advanced"] {
  /* Invert primary and accent */
  --color-primary: #D3AF37;
  --color-accent: #ADEBB3;
}

[data-mode="advanced"][data-theme="dark"] {
  --color-primary: #BFA246;
  --color-accent: #6FBF96;
}

/* Apply to all components */
* {
  transition: background-color var(--transition-theme),
              color var(--transition-theme),
              border-color var(--transition-theme);
}

/* Simple Mode Adjustments */
[data-mode="simple"] {
  --base-font-size: 16px;  /* Slightly larger */
  --spacing-base: 1.5rem;  /* More spacing */
}

[data-mode="advanced"] {
  --base-font-size: 14px;
  --spacing-base: 1rem;
}
```

### 11. Update Layout

**File:** `src/app/layout.tsx`
```typescript
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppModeProvider } from '@/contexts/AppModeContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <AppModeProvider>
              {children}
            </AppModeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 12. Update Top Navigation

**File:** `src/components/layout/Navigation.tsx`
- Add ModeSwitcher dropdown
- Show current mode
- Apply mode-based styling

---

## 📂 Files to Create

1. `src/lib/theme.ts` - Theme definitions
2. `src/lib/translations.ts` - Translation strings
3. `src/lib/simpleMode.ts` - Visibility logic
4. `src/lib/simpleLanguage.ts` - Simple mode labels
5. `src/contexts/ThemeContext.tsx` - Theme provider
6. `src/contexts/LanguageContext.tsx` - Language provider
7. `src/contexts/AppModeContext.tsx` - Mode provider
8. `src/components/ui/ModeSwitcher.tsx` - Mode dropdown
9. `src/components/ui/SimpleCategoryChart.tsx` - Simplified chart
10. `src/components/ui/GentleMessage.tsx` - Supportive message

## 📝 Files to Modify

1. ✅ `src/types/index.ts` - Types added
2. ✅ `src/lib/db.ts` - Migration added
3. ✅ `src/lib/operations/settings.ts` - Updated
4. `src/app/globals.css` - CSS variables
5. `src/app/layout.tsx` - Add providers
6. `src/app/analytics/page.tsx` - Conditional rendering
7. `src/app/settings/page.tsx` - New UI
8. `src/components/layout/Navigation.tsx` - Add switcher
9. `src/components/expense/EntryForm.tsx` - Check settings
10. All components - Use CSS variables

---

## 🧪 Testing Checklist

- [ ] Migration 5 runs successfully
- [ ] Settings updated and persisted
- [ ] Mode switcher changes mode
- [ ] Theme switcher changes theme
- [ ] Language switcher changes language
- [ ] Simple Mode hides advanced features
- [ ] Simple Mode shows correct labels
- [ ] Dark mode applies correctly
- [ ] Transitions are smooth (150ms)
- [ ] No page reload on mode/theme/language change
- [ ] Settings persist across sessions

---

## 🎯 Implementation Priority

**High Priority (Core Functionality):**
1. Theme system (CSS variables + provider)
2. App Mode context and switcher
3. Simple Mode visibility logic
4. Settings UI updates

**Medium Priority (UX):**
5. Language system
6. Simple Mode styling adjustments
7. Dark mode polish

**Low Priority (Nice to have):**
8. Marathi translations (can use placeholders)
9. Additional Simple Mode refinements

---

## ⚠️ Important Notes

- **Do not change data tracking or business logic**
- **All features remain available in Advanced Mode**
- **Simple Mode is purely UI/UX filtering**
- **Smooth transitions are critical (150ms)**
- **No page reloads on preference changes**
- **Dark mode: no pure black, no neon colors**
- **Simple Mode: supportive language only**

---

## 📊 Estimated Remaining Time

- Theme system: 30 min
- Language system: 20 min
- App Mode logic: 20 min
- Settings UI: 15 min
- Component updates: 30 min
- Testing: 20 min

**Total:** ~2-2.5 hours

---

**Status:** Phase 1 complete (database layer). Phase 2 ready to implement.
