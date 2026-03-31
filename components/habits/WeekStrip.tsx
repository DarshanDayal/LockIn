"use client";

import { format, subDays, startOfWeek, addDays } from "date-fns";

interface DayData {
  date: string;
  label: string;
  pct: number;
  isToday: boolean;
}

interface WeekStripProps {
  // date → completion pct (0-1)
  weekData: Record<string, number>;
}

export function WeekStrip({ weekData }: WeekStripProps) {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Build Mon–Sun week containing today
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Mon
  const days: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const dateStr = format(d, "yyyy-MM-dd");
    return {
      date: dateStr,
      label: format(d, "EEE").toLowerCase(),
      pct: weekData[dateStr] ?? 0,
      isToday: dateStr === todayStr,
    };
  });

  function barColor(pct: number): string {
    if (pct === 0) return "bg-border";
    if (pct < 0.5) return "bg-amber opacity-60";
    if (pct < 1) return "bg-green opacity-70";
    return "bg-green";
  }

  return (
    <div className="mb-5">
      <div className="flex gap-2">
        {days.map((day) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
            <span
              className={`text-xs ${
                day.isToday ? "text-green font-semibold" : "text-muted"
              }`}
            >
              {day.label}
            </span>
            <div className="w-full h-6 bg-surface border border-border rounded-sm overflow-hidden relative">
              <div
                className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${barColor(day.pct)}`}
                style={{ height: `${Math.max(day.pct * 100, day.pct > 0 ? 15 : 0)}%` }}
              />
            </div>
            <span
              className={`text-xs font-bold ${
                day.isToday
                  ? "text-green"
                  : day.pct > 0
                  ? "text-text"
                  : "text-muted"
              }`}
            >
              {day.isToday ? `*${format(new Date(day.date + "T12:00"), "d")}` : format(new Date(day.date + "T12:00"), "d")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
