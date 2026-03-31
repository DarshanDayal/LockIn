import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { last365, toDateStr } from "@/lib/date";
import { subDays } from "date-fns";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.lkUser.findUnique({ where: { supabaseId: user.id } });
  if (!profile) return NextResponse.json({ heatmap: [] });

  const since = toDateStr(subDays(new Date(), 364));

  const [logs, totalHabits] = await Promise.all([
    prisma.lkLog.findMany({
      where: { userId: profile.id, date: { gte: since } },
      select: { date: true },
    }),
    prisma.lkHabit.count({ where: { userId: profile.id, isActive: true } }),
  ]);

  // Count completions per day
  const countMap: Record<string, number> = {};
  for (const log of logs) {
    countMap[log.date] = (countMap[log.date] ?? 0) + 1;
  }

  // Build full 365-day array
  const days = last365();
  const heatmap = days.map((date) => {
    const count = countMap[date] ?? 0;
    const pct = totalHabits > 0 ? count / totalHabits : 0;
    return { date, count, pct };
  });

  return NextResponse.json({ heatmap, totalHabits });
}
