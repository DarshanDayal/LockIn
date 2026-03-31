"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TerminalHeader } from "@/components/layout/TerminalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { format } from "date-fns";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setEmail(user.email ?? "");
      setCreatedAt(user.created_at ? new Date(user.created_at) : null);
      setLoading(false);
    });
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <TerminalHeader command="profile" subtitle="account info" />

        {loading ? (
          <div className="space-y-3">
            <div className="h-6 bg-surface rounded w-48 animate-pulse" />
            <div className="h-6 bg-surface rounded w-36 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-1 text-sm">
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
            </section>

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
        )}
      </div>
      <BottomNav />
    </div>
  );
}
