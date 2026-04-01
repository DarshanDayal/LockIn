import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { today } from "@/lib/date";

async function getProfile(supabaseUserId: string) {
  return prisma.lkUser.findUnique({ where: { supabaseId: supabaseUserId } });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let profile = await getProfile(user.id);
  if (!profile) {
    profile = await prisma.lkUser.create({
      data: {
        supabaseId: user.id,
        email: user.email!,
        username: user.email!.split("@")[0],
      },
    });
  }

  const todayStr = today();

  const [groups, habits] = await Promise.all([
    prisma.lkGroup.findMany({
      where: { userId: profile.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.lkHabit.findMany({
      where: { userId: profile.id, isActive: true },
      orderBy: [{ groupId: "asc" }, { sortOrder: "asc" }],
      include: {
        logs: {
          where: { date: todayStr },
        },
      },
    }),
  ]);

  return NextResponse.json({ groups, habits, today: todayStr });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfile(user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await req.json();
  const { name, description, emoji, groupId, targetDays } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  try {
    const habit = await prisma.lkHabit.create({
      data: {
        userId: profile.id,
        name: name.trim(),
        description: description?.trim() ?? null,
        emoji: emoji ?? "✅",
        groupId: groupId ?? null,
        targetDays: targetDays ?? [],
      },
    });
    return NextResponse.json({ habit });
  } catch (err) {
    console.error("Failed to create habit:", err);
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
