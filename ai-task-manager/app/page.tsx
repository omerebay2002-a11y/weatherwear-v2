import Chat from "@/components/Chat";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <h1 className="text-sm font-medium tracking-wide">AI Task Manager</h1>
        <span className="ml-auto text-xs text-zinc-500">
          router → specialized agent
        </span>
      </header>
      <Chat />
    </main>
  );
}
