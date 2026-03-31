import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { today } from "@/lib/date";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.lkUser.findUnique({ where: { supabaseId: user.id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { habitId } = await params;
  const body = await req.json().catch(() => ({}));
  const date = body.date ?? today();

  // Verify habit belongs to user
  const habit = await prisma.lkHabit.findFirst({
    where: { id: habitId, userId: profile.id, isActive: true },
  });
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  const log = await prisma.lkLog.upsert({
    where: { habitId_date: { habitId, date } },
    update: {},
    create: { habitId, userId: profile.id, date },
  });

  return NextResponse.json({ log });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.lkUser.findUnique({ where: { supabaseId: user.id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { habitId } = await params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? today();

  await prisma.lkLog.deleteMany({
    where: { habitId, userId: profile.id, date },
  });

  return NextResponse.json({ ok: true });
}
