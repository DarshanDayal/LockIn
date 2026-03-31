"use client";

import { useState } from "react";
import { HabitRow } from "./HabitRow";

interface Habit {
  id: string;
  name: string;
  description?: string | null;
  emoji: string;
  logs: { date: string }[];
  streak?: number;
}

interface HabitGroupBlockProps {
  icon: string;
  name: string;
  habits: Habit[];
  todayStr: string;
  onToggle: (id: string, isDone: boolean) => void;
}

export function HabitGroupBlock({ icon, name, habits, todayStr, onToggle }: HabitGroupBlockProps) {
  const [collapsed, setCollapsed] = useState(false);

  const done = habits.filter((h) => h.logs.some((l) => l.date === todayStr)).length;
  const total = habits.length;

  return (
    <div className="mb-4">
      {/* Group header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 w-full text-left mb-1 group"
      >
        <span className="text-sm">{icon}</span>
        <span className="text-green text-sm font-semibold">{name}</span>
        <span className="text-muted text-xs ml-auto">
          [{done}/{total}] {collapsed ? "▶" : "▼"}
        </span>
      </button>
      <p className="text-muted text-xs mb-2 pl-6">// {done === total && total > 0 ? "all done" : `${total - done} remaining`}</p>

      {!collapsed && (
        <div className="pl-2 border-l border-border space-y-0.5">
          {habits.map((habit) => {
            const isDone = habit.logs.some((l) => l.date === todayStr);
            return (
              <HabitRow
                key={habit.id}
                id={habit.id}
                name={habit.name}
                description={habit.description}
                emoji={habit.emoji}
                isDone={isDone}
                streak={habit.streak ?? 0}
                onToggle={onToggle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
