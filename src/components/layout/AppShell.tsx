import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

const ROUTE_TITLE: Record<string, string> = {
  "/": "הארון שלי",
  "/today": "היום שלי",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const title = ROUTE_TITLE[pathname] ?? "WeatherWear";

  return (
    <div className="min-h-[100dvh] bg-parchment">
      {/* slim top bar */}
      <header className="fixed top-0 inset-x-0 z-40 h-11 flex items-center justify-center px-4 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(245,239,230,0.82) 60%, transparent)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            maskImage: "linear-gradient(to bottom, black 60%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent)",
          }}
        />
        <span className="relative font-display text-sm font-medium text-ebony/70 tracking-wide">
          {title}
        </span>
      </header>
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
