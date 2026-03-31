"use client";

import { useState, useEffect } from "react";
import { TerminalHeader } from "@/components/layout/TerminalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Heatmap } from "@/components/stats/Heatmap";
import { DayOfWeekChart } from "@/components/stats/DayOfWeekChart";

interface HeatmapEntry {
  date: string;
  count: number;
  pct: number;
}

interface Overview {
  daysTracked: number;
  avgPct: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
  topHabitStreak: { name: string; emoji: string; streak: number };
  dayOfWeek: { label: string; pct: number }[];
  completionRates: {
    d14: number; d30: number; d60: number; d90: number; d180: number; d365: number; all: number;
  };
}

type Window = "d14" | "d30" | "d60" | "d90" | "d180" | "d365" | "all";

const WINDOWS: { key: Window; label: string }[] = [
  { key: "d14", label: "14d" },
  { key: "d30", label: "30d" },
  { key: "d60", label: "60d" },
  { key: "d90", label: "90d" },
  { key: "d180", label: "180d" },
  { key: "d365", label: "365d" },
  { key: "all", label: "all" },
];

export default function StatsPage() {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<Window>("d30");

  useEffect(() => {
    Promise.all([
      fetch("/api/stats/heatmap").then((r) => r.json()),
      fetch("/api/stats/overview").then((r) => r.json()),
    ]).then(([hm, ov]) => {
      setHeatmap(hm.heatmap ?? []);
      setOverview(ov);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <TerminalHeader command="stats" subtitle="your overall tracking summary" />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick glance */}
            <section>
              <p className="text-green text-sm font-semibold mb-1">👁 quick glance</p>
              <p className="text-muted text-xs mb-3">// your overall tracking summary</p>
              <div className="space-y-1 text-sm">
                <TermLine label="days tracked" value={String(overview?.daysTracked ?? 0)} />
                <TermLine label="avg completion" value={`${overview?.avgPct ?? 0}%`} />
                <TermLine label="perfect days" value={String(overview?.perfectDays ?? 0)} />
              </div>
            </section>

            {/* Streaks */}
            <section>
              <p className="text-green text-sm font-semibold mb-1">🔥 streaks</p>
              <p className="text-muted text-xs mb-3">// consecutive days hitting your daily goal</p>
              <div className="space-y-1 text-sm">
                <TermLine
                  label="current streak"
                  value={`${overview?.currentStreak ?? 0} days`}
                  valueColor={overview?.currentStreak ? "text-green" : "text-muted"}
                />
                <TermLine
                  label="best streak"
                  value={`${overview?.longestStreak ?? 0} days`}
                  valueColor={overview?.longestStreak ? "text-green" : "text-muted"}
                />
                {overview?.topHabitStreak?.streak ? (
                  <TermLine
                    label="top habit streak"
                    value={`${overview.topHabitStreak.emoji} ${overview.topHabitStreak.name} — ${overview.topHabitStreak.streak} days`}
                    valueColor="text-amber"
                  />
                ) : null}
              </div>
            </section>

            {/* Completion rates */}
            <section>
              <p className="text-green text-sm font-semibold mb-1">📊 completion rates</p>
              <p className="text-muted text-xs mb-2">// how often you complete scheduled habits</p>
              <div className="flex gap-2 flex-wrap mb-3">
                {WINDOWS.map((w) => (
                  <button
                    key={w.key}
                    onClick={() => setWindow(w.key)}
                    className={`text-xs px-2 py-0.5 rounded transition-colors ${
                      window === w.key
                        ? "text-green border border-green"
                        : "text-muted border border-border hover:border-muted"
                    }`}
                  >
                    [{w.label}]
                  </button>
                ))}
              </div>
              <div className="space-y-1 text-sm">
                <TermLine
                  label={`${window.replace("d", "")}${window !== "all" ? "d" : ""}`}
                  value={`${overview?.completionRates[window] ?? 0}%`}
                  valueColor="text-green"
                />
              </div>
            </section>

            {/* Contributions heatmap */}
            <section>
              <p className="text-green text-sm font-semibold mb-1">📅 contributions</p>
              <p className="text-muted text-xs mb-3">// your activity over the past year</p>
              <Heatmap data={heatmap} />
            </section>

            {/* Day of week */}
            <section>
              <p className="text-green text-sm font-semibold mb-1">📆 day of week</p>
              <p className="text-muted text-xs mb-3">// completion rates broken down by day (30d)</p>
              <DayOfWeekChart data={overview?.dayOfWeek ?? []} />
            </section>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function TermLine({
  label,
  value,
  valueColor = "text-text",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-muted">{label}:</span>
      <span className={`font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}
