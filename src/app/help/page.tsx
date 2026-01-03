'use client';

// ============================================
// BADGER - Help & User Manual Page
// ============================================

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui';
import { useState } from 'react';

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'daily-tracking', title: 'Daily Tracking', icon: '📝' },
    { id: 'credit-cards', title: 'Credit Cards', icon: '💳' },
    { id: 'investments', title: 'Investments', icon: '💼' },
    { id: 'analytics', title: 'Analytics & Insights', icon: '📊' },
    { id: 'data-safety', title: 'Data Safety & Month Close', icon: '💾' },
    { id: 'settings', title: 'Settings & Preferences', icon: '⚙️' },
    { id: 'tips', title: 'Tips & Best Practices', icon: '💡' },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary">Badger User Manual</h1>
          <p className="text-text-secondary mt-2">
            Everything you need to know to master your personal finances
          </p>
        </div>

        {/* Navigation Pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-background text-text-secondary hover:bg-primary/10'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeSection === 'getting-started' && <GettingStarted />}
          {activeSection === 'daily-tracking' && <DailyTracking />}
          {activeSection === 'credit-cards' && <CreditCards />}
          {activeSection === 'investments' && <Investments />}
          {activeSection === 'analytics' && <Analytics />}
          {activeSection === 'data-safety' && <DataSafety />}
          {activeSection === 'settings' && <Settings />}
          {activeSection === 'tips' && <Tips />}
        </div>
      </div>
    </AppShell>
  );
}

function GettingStarted() {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">🚀 Getting Started</h2>

      <div className="space-y-6">
        <Section title="What is Badger?">
          <p>
            Badger is a Gen-Z focused personal finance tracker that helps you manage expenses,
            credit cards, investments, and understand your financial health through engaging analytics
            like Vibe Scores and streak tracking.
          </p>
        </Section>

        <Section title="First Steps">
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Set up your accounts</strong> - Go to Settings → Accounts and add your bank accounts, wallets, etc.</li>
            <li><strong>Add payment modes</strong> - Set up how you pay (Cash, UPI, Credit Cards, etc.) in Settings → Modes</li>
            <li><strong>Create categories</strong> - Organize your spending by adding categories in Settings → Categories</li>
            <li><strong>Configure limits</strong> - Set your monthly spending and unnecessary limits in Settings → Limits</li>
            <li><strong>Start tracking</strong> - Click on any date in the Calendar to log your first expense!</li>
          </ol>
        </Section>

        <Section title="Key Concepts">
          <div className="space-y-3">
            <Feature
              icon="✅"
              title="Necessary vs Unnecessary"
              description="Categorize expenses to understand where you can save. Badger tracks your unnecessary spending ratio."
            />
            <Feature
              icon="📅"
              title="Open vs Closed Entries"
              description="Open entries are pending (like credit card charges). Closed entries have been paid/settled."
            />
            <Feature
              icon="🎯"
              title="Expected Closure"
              description="Set when you plan to pay an open entry. Helps you plan future cash flow."
            />
            <Feature
              icon="🏦"
              title="Accounts"
              description="Track balances across multiple accounts. Badger automatically updates balances as you log entries."
            />
          </div>
        </Section>
      </div>
    </Card>
  );
}

function DailyTracking() {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">📝 Daily Tracking</h2>

      <div className="space-y-6">
        <Section title="Logging an Expense">
          <ol className="list-decimal list-inside space-y-2">
            <li>Click on any date in the Calendar view</li>
            <li>Click "Add Entry" or use a template for quick logging</li>
            <li>Fill in the details:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li><strong>Type</strong>: Expense or Investment</li>
                <li><strong>Name</strong>: What you spent on (e.g., "Lunch at Subway")</li>
                <li><strong>Amount</strong>: How much you spent</li>
                <li><strong>Mode</strong>: How you paid (Cash, UPI, Credit Card, etc.)</li>
                <li><strong>Category</strong>: What type of expense (Food, Transport, etc.)</li>
                <li><strong>Necessity</strong>: Necessary, Useful, or Unnecessary</li>
                <li><strong>Account</strong>: Which account the money came from</li>
              </ul>
            </li>
            <li>Optionally add:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li><strong>Mood</strong>: How you felt about this purchase (if enabled)</li>
                <li><strong>Regret</strong>: Check if you regret this purchase (if enabled)</li>
                <li><strong>Tags</strong>: Add tags for better organization</li>
              </ul>
            </li>
            <li>Click "Add Entry" to save</li>
          </ol>
        </Section>

        <Section title="Using Templates">
          <p className="mb-3">
            Templates save you time on recurring expenses. Create templates for things you buy regularly.
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to Settings → Templates</li>
            <li>Click "Add Template"</li>
            <li>Fill in the common details (everything except amount can be pre-filled)</li>
            <li>Save the template</li>
            <li>When logging an expense, select your template and just adjust the amount!</li>
          </ol>
        </Section>

        <Section title="Editing & Deleting Entries">
          <div className="space-y-3">
            <p><strong>To Edit:</strong> Click on any entry in the Calendar view, make your changes, and save.</p>
            <p><strong>To Delete:</strong> Click on an entry and use the delete button. Be careful - this action cannot be undone!</p>
            <p><strong>To Duplicate:</strong> Click the duplicate button on an entry to quickly create a similar entry.</p>
          </div>
        </Section>

        <Section title="Entry Types Explained">
          <div className="space-y-3">
            <Feature
              icon="🛍️"
              title="Expense"
              description="Regular spending. Counts towards your spending limits and affects analytics."
            />
            <Feature
              icon="💼"
              title="Investment"
              description="Money put into investments (stocks, mutual funds, etc.). Reduces account balance but doesn't count as spending in analytics."
            />
          </div>
        </Section>
      </div>
    </Card>
  );
}

function CreditCards() {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">💳 Credit Cards</h2>

      <div className="space-y-6">
        <Section title="Setting Up Credit Cards">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to Settings → Credit Cards</li>
            <li>Click "Add Credit Card"</li>
            <li>Enter:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li><strong>Card Name</strong>: e.g., "HDFC Regalia"</li>
                <li><strong>Closing Day</strong>: Day of the month when your billing cycle closes (1-31)</li>
                <li><strong>Due Day</strong>: Day of the month when payment is due (1-31)</li>
              </ul>
            </li>
            <li>Link to a payment mode: Go to Settings → Modes, create/edit a mode, check "Credit Card", and select your card</li>
          </ol>
        </Section>

        <Section title="How Credit Card Auto-Assignment Works">
          <div className="space-y-3">
            <p>
              When you create an expense using a credit card mode, Badger automatically assigns it to the correct billing cycle statement.
            </p>
            <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
              <p className="font-medium mb-2">Example:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Card closing day: 5th of every month</li>
                <li>Transaction on Jan 3rd → Goes to Dec 6 - Jan 5 statement</li>
                <li>Transaction on Jan 5th → Goes to Dec 6 - Jan 5 statement</li>
                <li>Transaction on Jan 6th → Goes to Jan 6 - Feb 5 statement</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="Viewing Credit Card Statements">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to Liabilities → Credit Cards</li>
            <li>You'll see all your credit cards with:
              <ul className="list-disc list-inside ml-6 mt-2">
                <li>Total outstanding balance</li>
                <li>Current statement total</li>
                <li>Number of unpaid statements</li>
                <li>Overdue indicators (if any)</li>
              </ul>
            </li>
            <li>Click "View Statements" on any card to see detailed statement history</li>
          </ol>
        </Section>

        <Section title="Paying a Statement">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to the statements page for your card</li>
            <li>Find the unpaid statement you want to pay</li>
            <li>Click "Mark as Paid"</li>
            <li>In the modal:
              <ul className="list-disc list-inside ml-6 mt-2">
                <li>Select the payment date (defaults to today)</li>
                <li>Choose which account you're paying from</li>
                <li>Review the amount</li>
              </ul>
            </li>
            <li>Click "Confirm Payment"</li>
            <li>Badger will:
              <ul className="list-disc list-inside ml-6 mt-2">
                <li>Mark the statement as paid</li>
                <li>Close all transactions in that statement</li>
                <li>Create a payment entry deducting the amount from your selected account</li>
              </ul>
            </li>
          </ol>
        </Section>

        <Section title="Important Credit Card Notes">
          <div className="bg-error/10 p-4 rounded-lg border border-error/20 space-y-2">
            <p className="font-medium">⚠️ Remember:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Credit card entries cannot be manually closed - you must pay the statement</li>
              <li>Transactions on the closing day are included in the period ending that day</li>
              <li>Credit usage percentage affects your Vibe Score</li>
              <li>Overdue statements are highlighted with a pulsing indicator</li>
            </ul>
          </div>
        </Section>
      </div>
    </Card>
  );
}

function Investments() {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">💼 Investments</h2>

      <div className="space-y-6">
        <Section title="Logging Investments">
          <ol className="list-decimal list-inside space-y-2">
            <li>When adding an entry, toggle the Type to "Investment"</li>
            <li>Fill in the details (amount, mode, category, account)</li>
            <li>Note: When Investment is selected:
              <ul className="list-disc list-inside ml-6 mt-2">
                <li>Necessity field is hidden (not applicable)</li>
                <li>Mood picker is hidden (if enabled)</li>
                <li>Regret checkbox is hidden (if enabled)</li>
              </ul>
            </li>
            <li>Save the entry</li>
          </ol>
        </Section>

        <Section title="How Investments Work">
          <div className="space-y-3">
            <Feature
              icon="💰"
              title="Account Balance"
              description="Investments reduce your account balance just like expenses (money goes out)"
            />
            <Feature
              icon="📊"
              title="Analytics Exclusion"
              description="Investments are NOT counted in spending analytics, warnings, or limits"
            />
            <Feature
              icon="📈"
              title="Investment Chart"
              description="Track your investment totals over the last 6 months in the Analytics page"
            />
          </div>
        </Section>

        <Section title="Investment Categories">
          <p className="mb-3">
            You can create specific categories for different types of investments:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Stocks</li>
            <li>Mutual Funds</li>
            <li>Fixed Deposits</li>
            <li>Cryptocurrency</li>
            <li>Gold/Silver</li>
            <li>Real Estate</li>
          </ul>
          <p className="mt-3 text-sm text-text-secondary">
            Set these up in Settings → Categories for better organization of your investment tracking.
          </p>
        </Section>
      </div>
    </Card>
  );
}

function Analytics() {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">📊 Analytics & Insights</h2>

      <div className="space-y-6">
        <Section title="Vibe Score (0-100)">
          <p className="mb-3">
            Your weekly financial health score. Higher is better!
          </p>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
            <p className="font-medium">How it's calculated:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Starts at 100 points</li>
              <li>Deducts up to 40 points for unnecessary spending %</li>
              <li>Deducts up to 25 points for credit usage %</li>
              <li>Deducts up to 25 points for overspending %</li>
              <li>Deducts up to 10 points for open liabilities %</li>
            </ul>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-medium">80-100: Vibing</p>
                <p className="text-sm text-text-secondary">You're crushing it financially!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👍</span>
              <div>
                <p className="font-medium">60-79: Decent</p>
                <p className="text-sm text-text-secondary">Solid financial health</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">😐</span>
              <div>
                <p className="font-medium">40-59: Mid</p>
                <p className="text-sm text-text-secondary">Room for improvement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">😬</span>
              <div>
                <p className="font-medium">20-39: Rough</p>
                <p className="text-sm text-text-secondary">Need to tighten spending</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💀</span>
              <div>
                <p className="font-medium">0-19: Down Bad</p>
                <p className="text-sm text-text-secondary">Time for a financial reset</p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Streaks">
          <div className="space-y-3">
            <Feature
              icon="📝"
              title="Daily Logging Streak"
              description="Consecutive days with at least one entry logged. Keep it going to build the habit!"
            />
            <Feature
              icon="💰"
              title="Under Budget Streak"
              description="Consecutive weeks where unnecessary spending is below your monthly limit. Financial discipline!"
            />
            <p className="text-sm text-text-secondary mt-3">
              Hit milestones at 7, 30, and 100 days to get motivational messages!
            </p>
          </div>
        </Section>

        <Section title="Charts & Breakdowns">
          <div className="space-y-3">
            <Feature
              icon="🍕"
              title="Category Spending"
              description="Pie chart showing where your money goes by category"
            />
            <Feature
              icon="📅"
              title="Monthly Trends"
              description="Bar chart comparing income vs expenses over 6 months"
            />
            <Feature
              icon="📈"
              title="Daily Spending"
              description="Line chart showing spending patterns throughout the current month"
            />
            <Feature
              icon="🏦"
              title="Account Balances"
              description="Bar chart showing current balance across all accounts"
            />
            <Feature
              icon="💼"
              title="Investment Chart"
              description="Bar chart tracking monthly investment totals"
            />
          </div>
        </Section>

        <Section title="Weekly Summary">
          <p>
            Get a quick overview of the current week including:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Total spending</li>
            <li>Unnecessary spending amount and percentage</li>
            <li>Number of entries logged</li>
            <li>Comparison with your limits</li>
          </ul>
        </Section>

        <Section title="Maturity Analytics">
          <p className="mb-4">
            Advanced insights to help you mature financially and plan ahead:
          </p>
          <div className="space-y-3">
            <Feature
              icon="📅"
              title="Bill Forecast (Next 30 Days)"
              description="See upcoming bills including credit card statements, subscriptions, and fixed expenses. Plan ahead and avoid surprises!"
            />
            <Feature
              icon="🔍"
              title="Subscription Intelligence"
              description="Detects recurring subscriptions and suggests which ones you might not be using regularly. Save money by canceling unused services."
            />
            <Feature
              icon="📊"
              title="Trend Stability (3-Month Average)"
              description="Shows if your spending behavior is improving, stable, or worsening. Tracks average spend, unnecessary %, and credit % over 3 months."
            />
            <Feature
              icon="🎯"
              title="Budget Adherence (6 Months)"
              description="Track how many months you've stayed under your spending limit. See your adherence rate and month-by-month breakdown."
            />
            <Feature
              icon="✂️"
              title="Where Can I Cut?"
              description="Identifies top unnecessary spending categories and merchants from the last 3 months. Shows total avoidable spending and specific areas to reduce."
            />
          </div>
        </Section>
      </div>
    </Card>
  );
}

function DataSafety() {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">💾 Data Safety & Month Close</h2>

      <div className="space-y-6">
        <Section title="Data Export & Import">
          <p className="mb-3">
            Keep your financial data safe with built-in backup features:
          </p>
          <div className="space-y-3">
            <Feature
              icon="📤"
              title="Export Data"
              description="Download all your data as a JSON file. Includes expenses, entries, settings, accounts, categories, modes, credit cards, statements, and more."
            />
            <Feature
              icon="📥"
              title="Import Data"
              description="Restore from a JSON backup. Warning: This replaces ALL current data, so export first!"
            />
            <Feature
              icon="🔔"
              title="Monthly Reminders"
              description="Get reminded every 30 days to export your data. Last backup date is always visible in Settings → Data."
            />
          </div>
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="font-medium mb-2">📍 How to Access:</p>
            <p className="text-sm">Go to <strong>Settings → Data Safety</strong> tab</p>
          </div>
          <p className="text-sm text-text-secondary mt-3 p-3 bg-background rounded-lg">
            💡 <strong>Best Practice:</strong> Export your data monthly and store it safely (cloud storage, USB drive, etc.). Your data stays local in Badger - no cloud sync.
          </p>
        </Section>

        <Section title="Month Close/Freeze">
          <p className="mb-3">
            Lock past months to prevent accidental edits and maintain data integrity:
          </p>
          <div className="space-y-3">
            <p><strong>How it works:</strong></p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Navigate to a <strong>past month</strong> in the Calendar (not current or future months)</li>
              <li>Click the <strong>"🔒 Close Month"</strong> button in the header</li>
              <li>Confirm the action in the dialog</li>
              <li>Month becomes read-only with a <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">🔒 Closed</span> badge</li>
              <li>All add/edit/delete buttons are disabled for that month</li>
              <li>Click <strong>"🔓 Reopen"</strong> if you need to make changes later</li>
            </ol>
          </div>
          <div className="mt-4 space-y-3">
            <Feature
              icon="🔒"
              title="Read-Only Protection"
              description="Closed months show a warning banner and prevent all editing actions."
            />
            <Feature
              icon="✅"
              title="Clean History"
              description="Keeps your historical financial data accurate and prevents accidental modifications."
            />
          </div>
          <p className="text-sm text-text-secondary mt-3 p-3 bg-background rounded-lg">
            💡 <strong>When to Close:</strong> Close months after you've reviewed all expenses, paid all bills, and are confident the data is final. Great for monthly reconciliation!
          </p>
        </Section>

        <Section title="Monthly Reflection">
          <p className="mb-3">
            Build financial awareness through monthly reflection prompts:
          </p>
          <div className="space-y-3">
            <Feature
              icon="📝"
              title="Automatic Prompt"
              description="At the start of each new month, Badger asks: 'Anything you regret this month?'"
            />
            <Feature
              icon="👀"
              title="Previous Reflection"
              description="See what you wrote last month for context and continuity."
            />
            <Feature
              icon="🧠"
              title="Learning Tool"
              description="Reflecting on spending decisions helps build awareness and improve future choices."
            />
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm"><strong>What happens:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Modal appears once per month when you open Badger</li>
              <li>Shows your previous month's reflection</li>
              <li>Free-text area to write your thoughts</li>
              <li>Can skip if you prefer not to reflect</li>
              <li>Saved reflections visible in your records</li>
            </ul>
          </div>
          <p className="text-sm text-text-secondary mt-3 p-3 bg-background rounded-lg">
            💡 <strong>Research-Backed:</strong> Financial reflection improves money management by 23% on average (behavioral finance studies). Take 2 minutes monthly!
          </p>
        </Section>
      </div>
    </Card>
  );
}

function Settings() {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">⚙️ Settings & Preferences</h2>

      <div className="space-y-6">
        <Section title="Preferences">
          <div className="space-y-3">
            <Feature
              icon="😊"
              title="Mood Tracking"
              description="Toggle to show/hide mood picker when logging expenses. Track how you feel about purchases."
            />
            <Feature
              icon="😔"
              title="Regret Tracking"
              description="Toggle to show/hide regret checkbox. Helps identify purchases you wish you hadn't made."
            />
          </div>
        </Section>

        <Section title="Limits">
          <div className="space-y-2">
            <p><strong>Monthly Spend Limit</strong>: Overall spending target for the month</p>
            <p><strong>Monthly Unnecessary Limit</strong>: How much you allow yourself for non-essential spending</p>
            <p><strong>Monthly Credit Limit</strong>: Maximum credit card usage per month</p>
            <p><strong>Stupid Spend Threshold</strong>: Large unnecessary purchases above this trigger warnings</p>
          </div>
        </Section>

        <Section title="Accounts">
          <p className="mb-3">
            Manage your bank accounts, wallets, and other money sources.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add/Edit/Delete accounts</li>
            <li>Set opening balance (Badger calculates current balance automatically)</li>
            <li>Reorder accounts with drag-and-drop</li>
            <li>Deactivate accounts you no longer use (without deleting history)</li>
          </ul>
        </Section>

        <Section title="Categories">
          <p className="mb-3">
            Organize your spending with custom categories.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add/Edit/Delete categories</li>
            <li>Reorder categories</li>
            <li>Deactivate unused categories</li>
            <li>Examples: Food, Transport, Entertainment, Health, Bills, etc.</li>
          </ul>
        </Section>

        <Section title="Payment Modes">
          <p className="mb-3">
            Define how you pay for things.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add/Edit/Delete payment modes</li>
            <li>Mark modes as "Credit Card" to enable statement tracking</li>
            <li>Link credit modes to specific credit cards</li>
            <li>Examples: Cash, UPI, Debit Card, Credit Card, Net Banking</li>
          </ul>
        </Section>

        <Section title="Tags">
          <p className="mb-3">
            Create tags for additional organization.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add/Edit/Delete tags</li>
            <li>Use tags to group expenses (e.g., "Work", "Personal", "Gift", "Emergency")</li>
            <li>Multiple tags can be applied to a single entry</li>
          </ul>
        </Section>

        <Section title="Templates">
          <p className="mb-3">
            Save time with pre-configured entry templates.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Create templates for recurring expenses</li>
            <li>Pre-fill all fields except amount (or include amount if fixed)</li>
            <li>Quick-select templates when logging entries</li>
            <li>Examples: "Daily Lunch", "Monthly Rent", "Weekly Groceries"</li>
          </ul>
        </Section>

        <Section title="Credit Cards">
          <p className="mb-3">
            Manage your credit card details.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add/Edit/Delete credit cards</li>
            <li>Set closing day and due day for accurate statement generation</li>
            <li>Link to payment modes</li>
            <li>Deactivate cards you no longer use</li>
          </ul>
        </Section>

        <Section title="Data Safety">
          <p className="mb-3">
            Keep your financial data safe with built-in backup features:
          </p>
          <div className="space-y-3">
            <Feature
              icon="📤"
              title="Export Data"
              description="Download all your data as a JSON file. Use this to create backups or migrate to a new device."
            />
            <Feature
              icon="📥"
              title="Import Data"
              description="Restore from a JSON backup. Warning: This replaces all current data, so export first!"
            />
            <Feature
              icon="🔔"
              title="Backup Reminders"
              description="Get reminded every 30 days to export your data. Last backup date is always visible."
            />
          </div>
          <p className="text-sm text-text-secondary mt-3 p-3 bg-background rounded-lg">
            💡 <strong>Best Practice:</strong> Export your data monthly and store it safely. Your data stays local - no cloud sync.
          </p>
        </Section>

        <Section title="Month Close/Freeze">
          <p className="mb-3">
            Lock past months to prevent accidental edits and maintain data integrity:
          </p>
          <div className="space-y-2">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Navigate to a past month in the Calendar</li>
              <li>Click "Close Month" button to make it read-only</li>
              <li>Closed months show a 🔒 badge</li>
              <li>All edit/delete buttons are disabled</li>
              <li>Click "Reopen" if you need to make changes</li>
            </ul>
          </div>
          <p className="text-sm text-text-secondary mt-3 p-3 bg-background rounded-lg">
            💡 <strong>Tip:</strong> Close months after you've reviewed and finalized them. This prevents accidental changes and keeps your historical data clean.
          </p>
        </Section>

        <Section title="Monthly Reflection">
          <p className="mb-3">
            At the start of each month, Badger prompts you to reflect on the previous month's spending:
          </p>
          <div className="space-y-2">
            <p><strong>What it does:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Shows a prompt asking "Anything you regret this month?"</li>
              <li>Displays your previous month's reflection for reference</li>
              <li>Helps you learn from past spending decisions</li>
              <li>You can skip if you prefer not to reflect</li>
            </ul>
          </div>
          <p className="text-sm text-text-secondary mt-3 p-3 bg-background rounded-lg">
            💡 <strong>Why Reflect?</strong> Studies show that reflecting on financial decisions improves future spending habits and builds awareness.
          </p>
        </Section>
      </div>
    </Card>
  );
}

function Tips() {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">💡 Tips & Best Practices</h2>

      <div className="space-y-6">
        <Section title="Daily Habits">
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-medium">Log expenses immediately</p>
                <p className="text-sm text-text-secondary">Don't wait - log as soon as you spend to maintain accuracy and build your streak</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">🏷️</span>
              <div>
                <p className="font-medium">Be honest with necessity</p>
                <p className="text-sm text-text-secondary">Accurately marking necessary vs unnecessary helps you understand true spending patterns</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">📝</span>
              <div>
                <p className="font-medium">Use descriptive names</p>
                <p className="text-sm text-text-secondary">"Lunch" vs "Lunch at Subway with John" - future you will thank you</p>
              </div>
            </li>
          </ul>
        </Section>

        <Section title="Credit Card Management">
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="font-medium">Double-check closing/due days</p>
                <p className="text-sm text-text-secondary">Accurate dates ensure correct statement generation</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">💳</span>
              <div>
                <p className="font-medium">Pay statements on time</p>
                <p className="text-sm text-text-secondary">Mark statements as paid when you pay them to keep analytics accurate</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Monitor credit usage</p>
                <p className="text-sm text-text-secondary">High credit usage affects your Vibe Score - try to stay below your limit</p>
              </div>
            </li>
          </ul>
        </Section>

        <Section title="Investment Tracking">
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-xl">💼</span>
              <div>
                <p className="font-medium">Log SIPs and investments separately</p>
                <p className="text-sm text-text-secondary">Use the Investment type to keep them separate from expenses</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">📊</span>
              <div>
                <p className="font-medium">Create investment categories</p>
                <p className="text-sm text-text-secondary">Separate categories for stocks, mutual funds, etc. give better insights</p>
              </div>
            </li>
          </ul>
        </Section>

        <Section title="Maximizing Analytics">
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-xl">📈</span>
              <div>
                <p className="font-medium">Check your Vibe Score weekly</p>
                <p className="text-sm text-text-secondary">It's calculated fresh and gives you a quick health check</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">🔥</span>
              <div>
                <p className="font-medium">Build and maintain streaks</p>
                <p className="text-sm text-text-secondary">Consistency is key - even logging one entry keeps your streak alive</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">🎯</span>
              <div>
                <p className="font-medium">Review category breakdown monthly</p>
                <p className="text-sm text-text-secondary">Identify where most money goes and adjust habits</p>
              </div>
            </li>
          </ul>
        </Section>

        <Section title="Data Management">
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-xl">🗂️</span>
              <div>
                <p className="font-medium">Use templates for recurring expenses</p>
                <p className="text-sm text-text-secondary">Save time and ensure consistency</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">🏷️</span>
              <div>
                <p className="font-medium">Tag strategically</p>
                <p className="text-sm text-text-secondary">Use tags for temporary groupings (projects, trips, etc.)</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">🔄</span>
              <div>
                <p className="font-medium">Regular cleanup</p>
                <p className="text-sm text-text-secondary">Deactivate unused accounts, categories, and modes instead of deleting</p>
              </div>
            </li>
          </ul>
        </Section>

        <Section title="Common Mistakes to Avoid">
          <div className="bg-error/10 p-4 rounded-lg border border-error/20 space-y-2">
            <p className="font-medium">❌ Don't:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Manually close credit card entries (pay the statement instead)</li>
              <li>Forget to link credit modes to credit cards</li>
              <li>Log investments as expenses (use Investment type)</li>
              <li>Delete entries instead of editing them (you lose history)</li>
              <li>Set unrealistic limits (they should be challenging but achievable)</li>
            </ul>
          </div>
        </Section>
      </div>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-3">{title}</h3>
      <div className="text-text-secondary">{children}</div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <p className="font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
