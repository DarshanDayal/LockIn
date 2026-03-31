"use client";

import { format } from "date-fns";

interface TerminalHeaderProps {
  command: string;
  username?: string;
  subtitle?: string;
}

export function TerminalHeader({ command, username = "user", subtitle }: TerminalHeaderProps) {
  const now = new Date();
  const dateStr = format(now, "EEEE, MMMM d yyyy");

  return (
    <div className="mb-5">
      <p className="text-green text-sm font-semibold">
        <span className="text-muted">{username}[pro]</span>
        <span className="text-border">@</span>
        <span className="text-text">lockin</span>
        <span className="text-muted"> $ </span>
        <span>{command}</span>
      </p>
      {subtitle && <p className="text-muted text-xs mt-0.5">// {subtitle}</p>}
      <p className="text-muted text-xs mt-1">{dateStr}</p>
    </div>
  );
}
