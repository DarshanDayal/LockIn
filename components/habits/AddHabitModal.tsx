"use client";

import { useState } from "react";

const EMOJIS = ["✅", "🏃", "📚", "🧘", "💪", "🍎", "💧", "🧠", "🌅", "🌙", "☕", "✍️", "🎯", "📵", "💻"];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface Group {
  id: string;
  name: string;
  icon: string;
}

interface AddHabitModalProps {
  groups: Group[];
  onCreated: () => void;
  onGroupCreated: () => void;
  onClose: () => void;
}

export function AddHabitModal({ groups, onCreated, onGroupCreated, onClose }: AddHabitModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("✅");
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [targetDays, setTargetDays] = useState<number[]>([]);
  const [error, setError] = useState("");

  // New group creation
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("📁");

  function toggleDay(d: number) {
    setTargetDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    setNewGroupName("");
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName.trim(), icon: newGroupIcon }),
    });
    if (!res.ok) { setError("failed to create group"); return; }
    const { group } = await res.json();
    setGroupId(group.id);
    onGroupCreated();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("name required"); return; }
    // Close immediately, sync in background
    onClose();
    fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        emoji,
        groupId: groupId || null,
        targetDays,
      }),
    }).then((res) => {
      if (res.ok) onCreated();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0">
      <div className="bg-surface border border-border rounded-lg w-full max-w-md p-5 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-green text-sm font-semibold">$ new habit</p>
          <button onClick={onClose} className="text-muted hover:text-text text-xs">✕ close</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji picker */}
          <div>
            <p className="text-muted text-xs mb-1.5">// emoji</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded text-lg flex items-center justify-center transition-colors ${
                    emoji === e ? "bg-green/20 border border-green" : "bg-bg border border-border hover:border-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <p className="text-muted text-xs mb-1">// name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wake up by 7am"
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm placeholder-muted focus:outline-none focus:border-green transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <p className="text-muted text-xs mb-1">// description (optional)</p>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="no snoozing"
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm placeholder-muted focus:outline-none focus:border-green transition-colors"
            />
          </div>

          {/* Group */}
          <div>
            <p className="text-muted text-xs mb-1.5">// group</p>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm focus:outline-none focus:border-green"
            >
              <option value="">— no group —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
              ))}
            </select>
            {/* Quick create group */}
            <div className="flex gap-2 mt-2">
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="new group name..."
                className="flex-1 bg-bg border border-border rounded px-2 py-1.5 text-text text-xs placeholder-muted focus:outline-none focus:border-green"
              />
              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="text-xs text-green hover:text-text disabled:opacity-40 border border-green/30 rounded px-2 py-1.5"
              >
                + group
              </button>
            </div>
          </div>

          {/* Target days */}
          <div>
            <p className="text-muted text-xs mb-1.5">// target days (empty = every day)</p>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`flex-1 py-1.5 text-xs rounded transition-colors ${
                    targetDays.includes(i)
                      ? "bg-green text-bg font-semibold"
                      : "bg-bg border border-border text-muted hover:border-green/50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">// error: {error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-green text-bg text-sm font-semibold rounded hover:opacity-90 transition-opacity"
          >
            $ add habit
          </button>
        </form>
      </div>
    </div>
  );
}
