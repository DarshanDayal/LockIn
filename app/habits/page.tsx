"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import { TerminalHeader } from "@/components/layout/TerminalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { WeekStrip } from "@/components/habits/WeekStrip";
import { HabitGroupBlock } from "@/components/habits/HabitGroupBlock";
import { AddHabitModal } from "@/components/habits/AddHabitModal";

interface Habit {
  id: string;
  name: string;
  description?: string | null;
  emoji: string;
  groupId?: string | null;
  targetDays: number[];
  logs: { date: string }[];
  streak?: number;
}

interface Group {
  id: string;
  name: string;
  icon: string;
}

function toDateStr(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [todayStr, setTodayStr] = useState("");
  const [weekData, setWeekData] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    const res = await fetch("/api/habits");
    const data = await res.json();
    setHabits(data.habits ?? []);
    setGroups(data.groups ?? []);
    setTodayStr(data.today ?? toDateStr(new Date()));
    setLoading(false);
  }, []);

  // Fetch last-7-days heatmap data for the week strip
  const fetchWeekData = useCallback(async () => {
    const res = await fetch("/api/stats/heatmap");
    const data = await res.json();
    const map: Record<string, number> = {};
    for (const entry of (data.heatmap ?? [])) {
      map[entry.date] = entry.pct;
    }
    setWeekData(map);
  }, []);

  useEffect(() => {
    fetchHabits();
    fetchWeekData();
  }, [fetchHabits, fetchWeekData]);

  async function handleToggle(id: string, isDone: boolean) {
    // Optimistic update — flip the log state immediately
    setHabits((prev) =>
      prev.map((h) =>
        h.id !== id
          ? h
          : {
              ...h,
              logs: isDone
                ? h.logs.filter((l) => l.date !== todayStr)
                : [...h.logs, { date: todayStr }],
            }
      )
    );

    if (isDone) {
      await fetch(`/api/log/${id}?date=${todayStr}`, { method: "DELETE" });
    } else {
      await fetch(`/api/log/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr }),
      });
    }
    fetchHabits();
    fetchWeekData();
  }

  // Filter habits for today
  const todayDow = new Date().getDay();
  const todayHabits = habits.filter(
    (h) => h.targetDays.length === 0 || h.targetDays.includes(todayDow)
  );

  const totalDone = todayHabits.filter((h) => h.logs.some((l) => l.date === todayStr)).length;
  const totalHabits = todayHabits.length;

  // Milestone message
  const totalCompletions = habits.reduce((sum, h) => sum + h.logs.length, 0);
  function getMilestoneMsg() {
    if (totalCompletions === 0) return "start your first habit below.";
    if (totalCompletions < 10) return `${totalCompletions} completions. just getting started.`;
    if (totalCompletions < 50) return `${totalCompletions} completions. building momentum.`;
    if (totalCompletions < 100) return `${totalCompletions} completions. the data is starting to mean something.`;
    return `${totalCompletions} completions. locked in.`;
  }

  // Group habits
  const grouped: { group: Group | null; habits: Habit[] }[] = [];
  const ungrouped = todayHabits.filter((h) => !h.groupId);

  for (const group of groups) {
    const groupHabits = todayHabits.filter((h) => h.groupId === group.id);
    if (groupHabits.length > 0) grouped.push({ group, habits: groupHabits });
  }
  if (ungrouped.length > 0) grouped.push({ group: null, habits: ungrouped });

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <TerminalHeader command="daily" subtitle={getMilestoneMsg()} />

        {/* Streak badge */}
        <div className="flex items-center gap-3 mb-4 text-xs text-muted">
          <span>🔥 {/* streak shown on stats page */} 0 days</span>
          <span>✦</span>
          <span className="text-green">{totalDone}/{totalHabits}</span>
        </div>

        <WeekStrip weekData={weekData} />

        {loading ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : totalHabits === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted text-sm mb-3">// no habits yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-green text-sm hover:underline"
            >
              $ add your first habit
            </button>
          </div>
        ) : (
          <div className="mt-2">
            {grouped.map(({ group, habits: gHabits }, i) =>
              group ? (
                <HabitGroupBlock
                  key={group.id}
                  icon={group.icon}
                  name={group.name}
                  habits={gHabits}
                  todayStr={todayStr}
                  onToggle={handleToggle}
                />
              ) : (
                <HabitGroupBlock
                  key="ungrouped"
                  icon="📋"
                  name="Other"
                  habits={gHabits}
                  todayStr={todayStr}
                  onToggle={handleToggle}
                />
              )
            )}
          </div>
        )}

        {/* Add button */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 text-muted text-sm hover:text-green transition-colors"
        >
          + add habit
        </button>
      </div>

      <BottomNav />

      {showModal && (
        <AddHabitModal
          groups={groups}
          onCreated={() => { fetchHabits(); setShowModal(false); }}
          onGroupCreated={fetchHabits}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
