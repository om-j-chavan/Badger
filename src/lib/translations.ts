// ============================================
// BADGER - Translation System
// ============================================

import type { Language, AppMode } from '@/types';

export const translations = {
  en: {
    // Navigation
    home: 'Calendar',
    analytics: 'Analytics',
    income: 'Income',
    liabilities: 'Liabilities',
    settings: 'Settings',
    help: 'Help',
    creditCards: 'Credit Cards',
    diary: 'Diary',

    // Common Actions
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    duplicate: 'Duplicate',
    export: 'Export',
    import: 'Import',
    saving: 'Saving...',
    saved: 'Saved',

    // Entry fields
    name: 'Name',
    amount: 'Amount',
    category: 'Category',
    mode: 'Payment Mode',
    account: 'Account',
    date: 'Date',
    tags: 'Tags',

    // Necessity (changes in Simple Mode)
    necessary: 'Necessary',
    unnecessary: 'Unnecessary',
    optional: 'Optional', // Simple Mode

    // Status
    open: 'Open',
    closed: 'Closed',

    // Messages
    totalToday: 'Total Today',
    totalMonth: 'Total This Month',
    monthlySavings: 'Monthly Savings',
    doingOkay: "You're doing okay",
    bitHigher: 'A bit higher than usual',
    savedThisMonth: 'Saved this month',
    overspentThisMonth: 'Overspent this month',
    spentBitMore: 'Spent a bit more', // Simple Mode

    // Settings Page
    settingsTitle: 'Settings',
    settingsDescription: 'Configure your Badger app preferences, limits, and data',

    // Settings Sections
    limitsThresholds: 'Limits & Thresholds',
    preferences: 'Preferences',
    dataSafety: 'Data Safety',
    creditCardSettings: 'Credit Card Settings',
    categoriesSettings: 'Categories',
    paymentModesSettings: 'Payment Modes',
    accountsSettings: 'Accounts',
    tagsSettings: 'Tags',
    templatesSettings: 'Templates',

    // Settings Section Descriptions
    limitsDescription: 'Configure spending limits and thresholds',
    preferencesDescription: 'Customize your Badger experience',
    dataSafetyDescription: 'Export, import, and backup your data',
    creditCardDescription: 'Manage your credit card settings',
    categoriesDescription: 'Organize your expense categories',
    paymentModesDescription: 'Set up payment methods',
    accountsDescription: 'Manage your bank accounts',
    tagsDescription: 'Create custom tags for expenses',
    templatesDescription: 'Manage expense templates',

    // Preferences Settings
    appMode: 'App Mode',
    simpleMode: 'Simple Mode',
    advancedMode: 'Advanced Mode',
    simpleModeDescription: 'Softer language, emotional accessibility',
    advancedModeDescription: 'Direct language, detailed analytics',
    theme: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    language: 'Language',
    currency: 'Currency',
    weekStartDay: 'Week Start Day',

    // Behavior Tracking
    enableMoodTracking: 'Enable Mood Tracking',
    moodTrackingDescription: 'Track your mood when logging expenses',
    enableRegretTracking: 'Enable Regret Tracking',
    regretTrackingDescription: 'Mark purchases you regret for reflection',
    enableImpulseTimer: 'Enable Impulse Timer',
    impulseTimerDescription: 'Wait before confirming large purchases',
    enableBackupReminder: 'Enable Backup Reminder',
    backupReminderDescription: 'Get reminded to backup your data',

    // Data Safety
    exportData: 'Export Data',
    exportDataDescription: 'Download all your data as JSON',
    importData: 'Import Data',
    importDataDescription: 'Restore data from a backup file',
    lastBackup: 'Last Backup',
    neverBackedUp: 'Never',

    // Credit & Liabilities
    creditLiability: 'Credit Liability',
    upcomingBill: 'Upcoming Bill', // Simple Mode
    statements: 'Statements',
    payStatement: 'Pay Statement',
    statementDate: 'Statement Date',
    dueDate: 'Due Date',
    totalDue: 'Total Due',
    minimumDue: 'Minimum Due',

    // Analytics Page
    analyticsTitle: 'Analytics',
    analyticsDescription: 'Insights into your spending patterns',
    vibeScore: 'Vibe Score',
    topCategories: 'Top Categories',
    spendingTrend: 'Spending Trend',
    savingsTrend: 'Savings Trend',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',

    // Calendar Page
    calendarTitle: 'Calendar',
    calendarDescription: 'Track your daily expenses',
    today: 'Today',
    yesterday: 'Yesterday',
    noExpenses: 'No expenses yet',
    addExpense: 'Add Expense',

    // Income Page
    incomeTitle: 'Income',
    incomeDescription: 'Track your income sources',
    addIncome: 'Add Income',
    noIncome: 'No income recorded yet',

    // Liabilities Page
    liabilitiesTitle: 'Liabilities',
    liabilitiesDescription: 'Manage your credit cards and bills',
    noCreditCards: 'No credit cards added yet',
    addCreditCard: 'Add Credit Card',

    // Help Page
    helpTitle: 'Help',
    helpDescription: 'Get help using Badger',
    gettingStarted: 'Getting Started',
    faqs: 'Frequently Asked Questions',
    contactSupport: 'Contact Support',

    // Diary Page
    diaryTitle: 'Monthly Diary',
    diaryDescription: 'Export your monthly financial diary',
    selectMonth: 'Select Month',
    exportPDF: 'Export as PDF',
    monthlySummaryTitle: 'Monthly Summary',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    netSavings: 'Net Savings',
    dailyLog: 'Daily Log',
    reflections: 'Reflections',
    exportingDiary: 'Exporting diary...',
    diaryExported: 'Diary exported successfully',

    // Days of week
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',

    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },
  mr: {
    // Navigation
    home: 'कॅलेंडर',
    analytics: 'विश्लेषण',
    income: 'उत्पन्न',
    liabilities: 'दायित्वे',
    settings: 'सेटिंग्ज',
    help: 'मदत',
    creditCards: 'क्रेडिट कार्ड',
    diary: 'डायरी',

    // Common Actions
    add: 'जोडा',
    edit: 'संपादित करा',
    delete: 'हटवा',
    cancel: 'रद्द करा',
    save: 'जतन करा',
    close: 'बंद करा',
    duplicate: 'डुप्लिकेट',
    export: 'निर्यात',
    import: 'आयात',
    saving: 'जतन करत आहे...',
    saved: 'जतन केले',

    // Entry fields
    name: 'नाव',
    amount: 'रक्कम',
    category: 'श्रेणी',
    mode: 'पेमेंट मोड',
    account: 'खाते',
    date: 'तारीख',
    tags: 'टॅग्ज',

    // Necessity
    necessary: 'आवश्यक',
    unnecessary: 'अनावश्यक',
    optional: 'पर्यायी',

    // Status
    open: 'उघडे',
    closed: 'बंद',

    // Messages
    totalToday: 'आजचा एकूण',
    totalMonth: 'या महिन्याचा एकूण',
    monthlySavings: 'मासिक बचत',
    doingOkay: 'तुम्ही चांगले चाललाय',
    bitHigher: 'नेहमीपेक्षा थोडे जास्त',
    savedThisMonth: 'या महिन्यात बचत केली',
    overspentThisMonth: 'या महिन्यात जास्त खर्च केला',
    spentBitMore: 'थोडे जास्त खर्च केले',

    // Settings Page
    settingsTitle: 'सेटिंग्ज',
    settingsDescription: 'तुमच्या बॅजर अॅपची प्राधान्ये, मर्यादा आणि डेटा कॉन्फिगर करा',

    // Settings Sections
    limitsThresholds: 'मर्यादा आणि थ्रेशोल्ड्स',
    preferences: 'प्राधान्ये',
    dataSafety: 'डेटा सुरक्षा',
    creditCardSettings: 'क्रेडिट कार्ड सेटिंग्ज',
    categoriesSettings: 'श्रेण्या',
    paymentModesSettings: 'पेमेंट मोड्स',
    accountsSettings: 'खाती',
    tagsSettings: 'टॅग्ज',
    templatesSettings: 'टेम्पलेट्स',

    // Settings Section Descriptions
    limitsDescription: 'खर्चाच्या मर्यादा आणि थ्रेशोल्ड्स कॉन्फिगर करा',
    preferencesDescription: 'तुमचा बॅजर अनुभव सानुकूलित करा',
    dataSafetyDescription: 'तुमचा डेटा निर्यात, आयात आणि बॅकअप करा',
    creditCardDescription: 'तुमच्या क्रेडिट कार्ड सेटिंग्ज व्यवस्थापित करा',
    categoriesDescription: 'तुमच्या खर्चाच्या श्रेण्या व्यवस्थित करा',
    paymentModesDescription: 'पेमेंट पद्धती सेट करा',
    accountsDescription: 'तुमची बँक खाती व्यवस्थापित करा',
    tagsDescription: 'खर्चासाठी सानुकूल टॅग तयार करा',
    templatesDescription: 'खर्च टेम्पलेट्स व्यवस्थापित करा',

    // Preferences Settings
    appMode: 'अॅप मोड',
    simpleMode: 'साधा मोड',
    advancedMode: 'प्रगत मोड',
    simpleModeDescription: 'मऊ भाषा, भावनिक प्रवेशयोग्यता',
    advancedModeDescription: 'थेट भाषा, तपशीलवार विश्लेषण',
    theme: 'थीम',
    lightTheme: 'लाइट',
    darkTheme: 'डार्क',
    language: 'भाषा',
    currency: 'चलन',
    weekStartDay: 'आठवडा सुरू दिवस',

    // Behavior Tracking
    enableMoodTracking: 'मूड ट्रॅकिंग सक्षम करा',
    moodTrackingDescription: 'खर्च नोंदवताना तुमचा मूड ट्रॅक करा',
    enableRegretTracking: 'पश्चात्ताप ट्रॅकिंग सक्षम करा',
    regretTrackingDescription: 'चिंतनासाठी पश्चात्ताप केलेल्या खरेदी चिन्हांकित करा',
    enableImpulseTimer: 'इम्पल्स टाइमर सक्षम करा',
    impulseTimerDescription: 'मोठ्या खरेदीची पुष्टी करण्यापूर्वी प्रतीक्षा करा',
    enableBackupReminder: 'बॅकअप रिमाइंडर सक्षम करा',
    backupReminderDescription: 'तुमचा डेटा बॅकअप करण्याची आठवण मिळवा',

    // Data Safety
    exportData: 'डेटा निर्यात करा',
    exportDataDescription: 'तुमचा सर्व डेटा JSON म्हणून डाउनलोड करा',
    importData: 'डेटा आयात करा',
    importDataDescription: 'बॅकअप फाइलमधून डेटा पुनर्संचयित करा',
    lastBackup: 'शेवटचा बॅकअप',
    neverBackedUp: 'कधीच नाही',

    // Credit & Liabilities
    creditLiability: 'क्रेडिट दायित्व',
    upcomingBill: 'आगामी बिल',
    statements: 'स्टेटमेंट्स',
    payStatement: 'स्टेटमेंट भरा',
    statementDate: 'स्टेटमेंट तारीख',
    dueDate: 'देय तारीख',
    totalDue: 'एकूण देय',
    minimumDue: 'किमान देय',

    // Analytics Page
    analyticsTitle: 'विश्लेषण',
    analyticsDescription: 'तुमच्या खर्चाच्या पॅटर्नमधील अंतर्दृष्टी',
    vibeScore: 'वाइब स्कोअर',
    topCategories: 'शीर्ष श्रेण्या',
    spendingTrend: 'खर्चाचा ट्रेंड',
    savingsTrend: 'बचतीचा ट्रेंड',
    thisMonth: 'हा महिना',
    lastMonth: 'गेला महिना',
    thisYear: 'हे वर्ष',

    // Calendar Page
    calendarTitle: 'कॅलेंडर',
    calendarDescription: 'तुमचे दररोजचे खर्च ट्रॅक करा',
    today: 'आज',
    yesterday: 'काल',
    noExpenses: 'अद्याप कोणतेही खर्च नाहीत',
    addExpense: 'खर्च जोडा',

    // Income Page
    incomeTitle: 'उत्पन्न',
    incomeDescription: 'तुमचे उत्पन्नाचे स्रोत ट्रॅक करा',
    addIncome: 'उत्पन्न जोडा',
    noIncome: 'अद्याप कोणतेही उत्पन्न नोंदवलेले नाही',

    // Liabilities Page
    liabilitiesTitle: 'दायित्वे',
    liabilitiesDescription: 'तुमचे क्रेडिट कार्ड आणि बिले व्यवस्थापित करा',
    noCreditCards: 'अद्याप कोणतेही क्रेडिट कार्ड जोडलेले नाहीत',
    addCreditCard: 'क्रेडिट कार्ड जोडा',

    // Help Page
    helpTitle: 'मदत',
    helpDescription: 'बॅजर वापरण्यासाठी मदत मिळवा',
    gettingStarted: 'सुरुवात करणे',
    faqs: 'वारंवार विचारले जाणारे प्रश्न',
    contactSupport: 'समर्थनाशी संपर्क साधा',

    // Diary Page
    diaryTitle: 'मासिक डायरी',
    diaryDescription: 'तुमची मासिक आर्थिक डायरी निर्यात करा',
    selectMonth: 'महिना निवडा',
    exportPDF: 'PDF म्हणून निर्यात करा',
    monthlySummaryTitle: 'मासिक सारांश',
    totalIncome: 'एकूण उत्पन्न',
    totalExpenses: 'एकूण खर्च',
    netSavings: 'निव्वळ बचत',
    dailyLog: 'दैनिक नोंद',
    reflections: 'प्रतिबिंब',
    exportingDiary: 'डायरी निर्यात करत आहे...',
    diaryExported: 'डायरी यशस्वीपणे निर्यात केली',

    // Days of week
    sunday: 'रविवार',
    monday: 'सोमवार',
    tuesday: 'मंगळवार',
    wednesday: 'बुधवार',
    thursday: 'गुरुवार',
    friday: 'शुक्रवार',
    saturday: 'शनिवार',

    // Months
    january: 'जानेवारी',
    february: 'फेब्रुवारी',
    march: 'मार्च',
    april: 'एप्रिल',
    may: 'मे',
    june: 'जून',
    july: 'जुलै',
    august: 'ऑगस्ट',
    september: 'सप्टेंबर',
    october: 'ऑक्टोबर',
    november: 'नोव्हेंबर',
    december: 'डिसेंबर',
  }
} as const;

type TranslationKey = keyof typeof translations.en;

export function t(key: string, language: Language = 'en', appMode?: AppMode): string {
  // Simple mode overrides for emotional accessibility
  if (appMode === 'simple') {
    if (key === 'unnecessary') return translations[language]['optional'] || (translations[language] as any)[key] || key;
    if (key === 'overspentThisMonth') return translations[language]['spentBitMore'] || (translations[language] as any)[key] || key;
    if (key === 'creditLiability') return translations[language]['upcomingBill'] || (translations[language] as any)[key] || key;
  }

  return (translations[language] as any)[key] || key;
}

// Hook for use in components
export function useTranslation(language: Language, appMode?: AppMode) {
  return (key: string) => t(key, language, appMode);
}
