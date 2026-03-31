import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { today, toDateStr, computeCurrentStreak, computeLongestStreak } from "@/lib/date";
import { subDays } from "date-fns";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.lkUser.findUnique({ where: { supabaseId: user.id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const since = toDateStr(subDays(new Date(), 364));

  const [logs, habits] = await Promise.all([
    prisma.lkLog.findMany({
      where: { userId: profile.id, date: { gte: since } },
      select: { date: true, habitId: true },
    }),
    prisma.lkHabit.findMany({
      where: { userId: profile.id, isActive: true },
      select: { id: true, name: true, emoji: true },
    }),
  ]);

  const totalHabits = habits.length;

  const dateMap: Record<string, number> = {};
  for (const log of logs) {
    dateMap[log.date] = (dateMap[log.date] ?? 0) + 1;
  }

  const daysTracked = Object.values(dateMap).filter((c) => c > 0).length;
  const avgPct = daysTracked === 0 || totalHabits === 0
    ? 0
    : Math.round(
        (Object.values(dateMap).reduce((sum, c) => sum + Math.min(c / totalHabits, 1), 0) /
          Math.max(daysTracked, 1)) * 100
      );
  const perfectDays = totalHabits === 0
    ? 0
    : Object.values(dateMap).filter((c) => c >= totalHabits).length;

  const currentStreak = computeCurrentStreak(dateMap, totalHabits);
  const longestStreak = computeLongestStreak(dateMap);

  // Per-habit streaks
  const habitLogMap: Record<string, Record<string, number>> = {};
  for (const log of logs) {
    if (!habitLogMap[log.habitId]) habitLogMap[log.habitId] = {};
    habitLogMap[log.habitId][log.date] = 1;
  }

  let topHabitStreak = { name: "", emoji: "", streak: 0 };
  for (const habit of habits) {
    const hdm = habitLogMap[habit.id] ?? {};
    const s = computeCurrentStreak(hdm, 1);
    if (s > topHabitStreak.streak) {
      topHabitStreak = { name: habit.name, emoji: habit.emoji, streak: s };
    }
  }

  // Day-of-week breakdown (30d)
  const since30 = toDateStr(subDays(new Date(), 29));
  const recentLogs = logs.filter((l) => l.date >= since30);
  const dowCounts: number[] = Array(7).fill(0);
  const dowTotal: number[] = Array(7).fill(0);
  for (const log of recentLogs) {
    const dow = new Date(log.date + "T12:00:00").getDay();
    dowCounts[dow]++;
  }
  for (let i = 0; i < 30; i++) {
    const dow = new Date(toDateStr(subDays(new Date(), i)) + "T12:00:00").getDay();
    dowTotal[dow] += totalHabits;
  }
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, i) => ({
    label,
    pct: dowTotal[i] > 0 ? Math.round((dowCounts[i] / dowTotal[i]) * 100) : 0,
  }));

  function windowRate(days: number): number {
    const since = toDateStr(subDays(new Date(), days - 1));
    const windowLogs = logs.filter((l) => l.date >= since);
    const windowDates = new Set(windowLogs.map((l) => l.date));
    if (windowDates.size === 0 || totalHabits === 0) return 0;
    const total = windowDates.size * totalHabits;
    return Math.round((windowLogs.length / total) * 100);
  }

  return NextResponse.json({
    daysTracked,
    avgPct,
    perfectDays,
    currentStreak,
    longestStreak,
    topHabitStreak,
    dayOfWeek,
    completionRates: {
      d14: windowRate(14), d30: windowRate(30), d60: windowRate(60),
      d90: windowRate(90), d180: windowRate(180), d365: windowRate(365), all: avgPct,
    },
    totalHabits,
  });
}
