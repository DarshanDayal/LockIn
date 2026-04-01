"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TerminalHeader } from "@/components/layout/TerminalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { format } from "date-fns";

interface Habit {
  id: string;
  name: string;
  emoji: string;
}

interface Group {
  id: string;
  name: string;
  icon: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "habit" | "group"; id: string; name: string } | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/habits");
    const data = await res.json();
    setHabits(data.habits ?? []);
    setGroups(data.groups ?? []);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setEmail(user.email ?? "");
      setCreatedAt(user.created_at ? new Date(user.created_at) : null);
      setAuthLoading(false);
    });
    fetchData();
  }, [router, fetchData]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleDelete() {
    if (!confirmDelete) return;
    if (confirmDelete.type === "habit") {
      setHabits((prev) => prev.filter((h) => h.id !== confirmDelete.id));
    } else {
      setGroups((prev) => prev.filter((g) => g.id !== confirmDelete.id));
    }
    setConfirmDelete(null);
    const url = confirmDelete.type === "habit"
      ? `/api/habits/${confirmDelete.id}`
      : `/api/groups/${confirmDelete.id}`;
    fetch(url, { method: "DELETE" });
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <TerminalHeader command="profile" subtitle="account & settings" />

        <div className="space-y-6">
          {/* Account info — shows as soon as auth resolves */}
          <section className="space-y-1 text-sm">
            {authLoading ? (
              <div className="space-y-2">
                <div className="h-5 bg-surface rounded w-48 animate-pulse" />
                <div className="h-5 bg-surface rounded w-36 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <span className="text-muted">email:</span>
                  <span className="text-text">{email}</span>
                </div>
                {createdAt && (
                  <div className="flex gap-2">
                    <span className="text-muted">member since:</span>
                    <span className="text-text">{format(createdAt, "MMM d, yyyy")}</span>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Habits — loads independently */}
          <section>
            <p className="text-muted text-xs mb-2">// habits</p>
            {habits.length === 0 ? (
              <p className="text-muted text-xs">no habits yet</p>
            ) : (
              <div className="space-y-1">
                {habits.map((h) => (
                  <div key={h.id} className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-sm text-text">{h.emoji} {h.name}</span>
                    <button
                      onClick={() => setConfirmDelete({ type: "habit", id: h.id, name: h.name })}
                      className="text-xs text-muted hover:text-red-400 transition-colors px-2"
                    >
                      delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Groups — loads independently */}
          <section>
            <p className="text-muted text-xs mb-2">// groups</p>
            {groups.length === 0 ? (
              <p className="text-muted text-xs">no groups yet</p>
            ) : (
              <div className="space-y-1">
                {groups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-sm text-text">{g.icon} {g.name}</span>
                    <button
                      onClick={() => setConfirmDelete({ type: "group", id: g.id, name: g.name })}
                      className="text-xs text-muted hover:text-red-400 transition-colors px-2"
                    >
                      delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Danger zone */}
          <div className="border-t border-border pt-4">
            <p className="text-muted text-xs mb-3">// danger zone</p>
            <button
              onClick={handleSignOut}
              className="text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded px-3 py-1.5 transition-colors"
            >
              $ sign out
            </button>
          </div>
        </div>
      </div>

      <BottomNav />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-surface border border-border rounded-lg w-full max-w-sm p-5 space-y-4">
            <p className="text-sm text-text">
              delete <span className="text-red-400">{confirmDelete.name}</span>?
            </p>
            <p className="text-xs text-muted">
              {confirmDelete.type === "habit"
                ? "// habit and all its history will be removed."
                : "// group will be deleted. habits in it will be ungrouped."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2 text-sm bg-red-500/20 text-red-400 border border-red-400/30 rounded hover:bg-red-500/30 transition-colors"
              >
                $ confirm delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 text-sm text-muted border border-border rounded hover:text-text transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
