import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

const ROUTE_TITLE: Record<string, string> = {
  "/": "הארון שלי",
  "/today": "היום שלי",
  "/avatar": "הבובה שלי",
};

// The app is mobile-first. On wider screens we render it inside a centered
// phone-width frame (with a warm dark surround) instead of stretching the
// layout full-bleed — which previously blew the room photo up huge and blurry.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const title = ROUTE_TITLE[pathname] ?? "WeatherWear";

  return (
    <div className="min-h-[100dvh] w-full flex justify-center" style={{ background: "#1e1b18" }}>
      <div className="relative w-full max-w-[440px] min-h-[100dvh] bg-parchment overflow-hidden shadow-2xl">
        {/* slim top bar — constrained to the phone frame */}
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 h-11 flex items-center justify-center px-4 pointer-events-none">
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
    </div>
  );
}
