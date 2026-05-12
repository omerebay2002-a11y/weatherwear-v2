"use client";

import type { Thread } from "@/lib/storage";

export default function Sidebar({
  threads,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  threads: Thread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-bg flex flex-col h-screen sticky top-0">
      <div className="p-3 border-b border-border">
        <button
          onClick={onNew}
          className="w-full bg-accent text-black font-medium rounded-md py-2 text-sm hover:opacity-90"
        >
          + New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {threads.length === 0 && (
          <div className="text-xs text-zinc-500 px-2 py-4">No chats yet.</div>
        )}
        {threads.map((t) => (
          <div
            key={t.id}
            className={`group rounded-md px-2 py-2 text-sm cursor-pointer flex items-center gap-2 ${
              t.id === activeId ? "bg-surface text-zinc-100" : "text-zinc-400 hover:bg-surface/60"
            }`}
            onClick={() => onSelect(t.id)}
          >
            <span className="flex-1 truncate">{t.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(t.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 text-xs"
              aria-label="Delete chat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-border text-[11px] text-zinc-500">
        Local-only · stored in your browser
      </div>
    </aside>
  );
}
