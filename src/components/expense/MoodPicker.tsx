'use client';

// ============================================
// BADGER - Mood Picker Component
// ============================================

import type { Mood } from '@/types';

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
  disabled?: boolean;
}

export default function MoodPicker({ value, onChange, disabled = false }: MoodPickerProps) {
  const moods: { value: Mood; emoji: string; label: string }[] = [
    { value: 'happy', emoji: '😄', label: 'Happy' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'sad', emoji: '😞', label: 'Sad' },
  ];

  const handleMoodClick = (mood: Mood) => {
    if (disabled) return;
    // Toggle: if same mood is clicked, deselect it
    onChange(value === mood ? null : mood);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        How do you feel about this purchase?
      </label>
      <div className="flex gap-2">
        {moods.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => handleMoodClick(mood.value)}
            disabled={disabled}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              value === mood.value
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs font-medium text-gray-700">
                {mood.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
