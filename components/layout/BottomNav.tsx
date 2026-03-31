"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/habits", label: "habits" },
  { href: "/stats", label: "stats" },
  { href: "/profile", label: "profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40">
      <div className="flex max-w-lg mx-auto">
        {NAV.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 py-4 text-center text-sm transition-colors ${
                active ? "text-green border-t border-green" : "text-muted hover:text-text"
              }`}
            >
              {active ? <span className="font-semibold">{label}</span> : label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
