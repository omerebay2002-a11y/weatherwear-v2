import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-parchment">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
