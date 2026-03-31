"use client";

import { useState } from "react";

interface HabitRowProps {
  id: string;
  name: string;
  description?: string | null;
  emoji: string;
  isDone: boolean;
  streak: number;
  onToggle: (id: string, isDone: boolean) => void;
}

export function HabitRow({ id, name, description, emoji, isDone, streak, onToggle }: HabitRowProps) {
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    await onToggle(id, isDone);
    setPending(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className="w-full flex items-start gap-3 py-2 text-left group"
    >
      {/* Checkbox */}
      <span
        className={`text-sm flex-shrink-0 mt-0.5 w-6 text-center transition-colors ${
          isDone ? "text-green" : "text-muted group-hover:text-text"
        }`}
      >
        {isDone ? "[✓]" : "[ ]"}
      </span>

      {/* Emoji */}
      <span className="text-sm flex-shrink-0">{emoji}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm transition-colors ${
            isDone ? "text-muted line-through" : "text-text group-hover:text-green"
          }`}
          style={isDone ? {} : (streak > 0 ? { color: "#f59e0b" } : {})}
        >
          {name}
        </span>
        {description && (
          <p className="text-muted text-xs mt-0.5">// {description}</p>
        )}
      </div>

      {/* Streak */}
      {streak > 0 && (
        <span className="text-xs text-amber flex-shrink-0 flex items-center gap-0.5">
          🔥{streak}
        </span>
      )}
    </button>
  );
}
