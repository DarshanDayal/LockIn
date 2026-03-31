"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) setError(err.message);
      else setSent(true);
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else router.push("/habits");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Terminal header */}
        <div className="mb-8">
          <p className="text-muted text-sm">// terminal habit tracker</p>
          <h1 className="text-green text-2xl font-bold mt-1">lockin</h1>
        </div>

        {sent ? (
          <div className="border border-border rounded p-4 text-sm">
            <p className="text-green">// check your email</p>
            <p className="text-muted mt-1">confirmation link sent to {email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <p className="text-muted text-xs mb-1">$ email</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-surface border border-border rounded px-3 py-2 text-text text-sm placeholder-muted focus:outline-none focus:border-green transition-colors"
              />
            </div>
            <div>
              <p className="text-muted text-xs mb-1">$ password</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded px-3 py-2 text-text text-sm placeholder-muted focus:outline-none focus:border-green transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-xs">// error: {error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green text-bg font-semibold text-sm rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "..." : mode === "login" ? "$ login" : "$ create account"}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="w-full text-muted text-xs hover:text-text transition-colors text-center"
            >
              {mode === "login" ? "// no account? sign up" : "// have an account? log in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
