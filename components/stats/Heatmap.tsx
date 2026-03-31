"use client";

import { useMemo } from "react";
import { format, startOfWeek, addDays, eachWeekOfInterval, subDays } from "date-fns";

interface HeatmapEntry {
  date: string;
  count: number;
  pct: number;
}

interface HeatmapProps {
  data: HeatmapEntry[];
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAY_LABELS = ["m", "", "w", "", "f", "", "s"];

function pctToClass(pct: number): string {
  if (pct === 0) return "bg-surface border border-border";
  if (pct < 0.25) return "bg-green/20";
  if (pct < 0.5) return "bg-green/40";
  if (pct < 0.75) return "bg-green/65";
  return "bg-green";
}

export function Heatmap({ data }: HeatmapProps) {
  const today = new Date();
  const yearAgo = subDays(today, 364);

  const dataMap = useMemo(() => {
    const m: Record<string, HeatmapEntry> = {};
    for (const d of data) m[d.date] = d;
    return m;
  }, [data]);

  const weeks = useMemo(() => {
    const start = startOfWeek(yearAgo, { weekStartsOn: 1 }); // Mon
    const weekStarts = eachWeekOfInterval({ start, end: today }, { weekStartsOn: 1 });
    return weekStarts.map((ws) =>
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(ws, i);
        if (d > today) return null;
        const key = format(d, "yyyy-MM-dd");
        const entry = dataMap[key];
        return { date: key, day: d, count: entry?.count ?? 0, pct: entry?.pct ?? 0 };
      })
    );
  }, [dataMap, today, yearAgo]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const first = week.find((d) => d !== null);
      if (!first) return;
      const month = first.day.getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month], weekIndex: wi });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  const completeDays = data.filter((d) => d.pct >= 1).length;

  return (
    <div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: "700px" }}>
          {/* Month labels */}
          <div className="flex mb-1 ml-5">
            {weeks.map((_, wi) => {
              const lbl = monthLabels.find((m) => m.weekIndex === wi);
              return (
                <div key={wi} className="w-3.5 flex-shrink-0">
                  {lbl ? <span className="text-[9px] text-muted">{lbl.label}</span> : null}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1 mt-0.5">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="h-3 w-4 flex items-center justify-end pr-0.5">
                  <span className="text-[9px] text-muted">{d}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) =>
                    day === null ? (
                      <div key={di} className="w-3 h-3 opacity-0" />
                    ) : (
                      <div
                        key={di}
                        title={`${day.date}: ${day.count} habits`}
                        className={`w-3 h-3 rounded-sm ${pctToClass(day.pct)}`}
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted">
        <span>less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <div key={p} className={`w-3 h-3 rounded-sm ${pctToClass(p)}`} />
        ))}
        <span>more</span>
        <span className="ml-auto">// {completeDays} perfect days</span>
      </div>
    </div>
  );
}
