import { NavLink } from "react-router-dom";
import { Cloud, Shirt, UserRound } from "lucide-react";
import { cn } from "../../lib/utils";

const TABS = [
  { to: "/avatar", label: "הבובה", Icon: UserRound },
  { to: "/", label: "הארון", Icon: Shirt },
  { to: "/today", label: "היום", Icon: Cloud },
] as const;

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 bg-parchment border-t border-parchment-dark">
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-2 px-2 py-1.5">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-sm px-3 py-2 transition active:scale-95",
                isActive ? "text-walnut-500" : "text-ebony-muted hover:text-walnut-400"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-5 w-5 transition", isActive ? "stroke-[2.2]" : "stroke-[1.6]")} />
                <span className={cn("text-[11px] leading-none", isActive ? "font-semibold" : "font-normal")}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
