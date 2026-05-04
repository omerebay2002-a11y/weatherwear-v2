import { NavLink } from "react-router-dom";
import { Cloud, Shirt } from "lucide-react";
import { cn } from "../../lib/utils";

const TABS = [
  { to: "/", label: "הארון", Icon: Shirt },
  { to: "/today", label: "היום", Icon: Cloud },
] as const;

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed bottom-0 inset-x-0 z-40 frost border-t border-walnut-100/60">
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-2 px-2 py-1.5">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-sm px-3 py-2 transition active:scale-95",
                isActive
                  ? "text-walnut-700"
                  : "text-walnut-400 hover:text-walnut-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "h-5 w-5 transition",
                    isActive ? "stroke-[2.2]" : "stroke-[1.6]"
                  )}
                />
                <span className="font-editorial italic text-[11px] leading-none">
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
