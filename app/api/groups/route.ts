import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.lkUser.findUnique({ where: { supabaseId: user.id } });
  if (!profile) return NextResponse.json({ groups: [] });

  const groups = await prisma.lkGroup.findMany({
    where: { userId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.lkUser.findUnique({ where: { supabaseId: user.id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, icon } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  try {
    const count = await prisma.lkGroup.count({ where: { userId: profile.id } });
    const group = await prisma.lkGroup.create({
      data: {
        userId: profile.id,
        name: name.trim(),
        icon: icon ?? "📁",
        sortOrder: count,
      },
    });
    return NextResponse.json({ group });
  } catch (err) {
    console.error("Failed to create group:", err);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
