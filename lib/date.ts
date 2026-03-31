import { format, subDays, parseISO, differenceInCalendarDays } from "date-fns";

export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function last365(): string[] {
  const days: string[] = [];
  for (let i = 364; i >= 0; i--) {
    days.push(toDateStr(subDays(new Date(), i)));
  }
  return days;
}

export function last7(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(toDateStr(subDays(new Date(), i)));
  }
  return days;
}

/** Compute current streak: consecutive days ending today (or yesterday) with pct > 0 */
export function computeCurrentStreak(
  dateMap: Record<string, number>,
  totalHabits: number
): number {
  if (totalHabits === 0) return 0;
  let streak = 0;
  let i = 0;
  // allow today to not be completed yet (start from yesterday if today empty)
  const todayStr = today();
  const todayDone = (dateMap[todayStr] ?? 0) > 0;
  if (!todayDone) i = 1; // start checking from yesterday

  while (true) {
    const d = toDateStr(subDays(new Date(), i));
    if ((dateMap[d] ?? 0) === 0) break;
    streak++;
    i++;
  }
  return streak;
}

export function computeLongestStreak(dateMap: Record<string, number>): number {
  const sorted = Object.keys(dateMap)
    .filter((d) => (dateMap[d] ?? 0) > 0)
    .sort();
  if (sorted.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}
