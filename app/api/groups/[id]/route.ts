import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.lkUser.findUnique({ where: { supabaseId: user.id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const { name, icon } = body;

  await prisma.lkGroup.updateMany({
    where: { id, userId: profile.id },
    data: {
      ...(name !== undefined && { name }),
      ...(icon !== undefined && { icon }),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.lkUser.findUnique({ where: { supabaseId: user.id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id } = await params;
  // Ungroup habits first, then delete group
  await prisma.lkHabit.updateMany({ where: { groupId: id, userId: profile.id }, data: { groupId: null } });
  await prisma.lkGroup.deleteMany({ where: { id, userId: profile.id } });

  return NextResponse.json({ ok: true });
}
