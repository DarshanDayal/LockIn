"use client";

interface DayData {
  label: string;
  pct: number;
}

interface DayOfWeekChartProps {
  data: DayData[];
}

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  // Reorder: Mon first
  const ordered = [
    ...data.slice(1), // Mon–Sat
    data[0],          // Sun
  ];

  return (
    <div className="space-y-2">
      {ordered.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-xs">
          <span className="text-muted w-5 text-right">{d.label.toLowerCase().slice(0, 2)}</span>
          <div className="flex-1 h-3 bg-surface border border-border rounded-sm overflow-hidden">
            <div
              className="h-full bg-green/70 transition-all duration-500"
              style={{ width: `${d.pct}%` }}
            />
          </div>
          <span className="text-text w-8 text-right">{d.pct}%</span>
        </div>
      ))}
    </div>
  );
}
