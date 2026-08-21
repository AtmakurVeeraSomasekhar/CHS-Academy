import { Link } from "@tanstack/react-router";
import { BookOpen, LayoutDashboard } from "lucide-react";

interface Props {
  examLabel?: string;
  rightExtra?: React.ReactNode;
}

export function Header({ examLabel, rightExtra }: Props) {
  return (
    <header className="relative h-[72px] shrink-0 bg-navy-deep border-b-2 border-gold/60 px-5 flex items-center justify-between gap-4">
      {/* Left: Logo + brand */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center shadow-lg shadow-gold/20 ring-2 ring-gold/40 shrink-0">
          <BookOpen className="h-6 w-6 text-navy-deep" strokeWidth={2.5} />
        </div>
        <div className="leading-tight min-w-0">
          <div className="font-display text-lg font-semibold tracking-wide text-white truncate">
            CHS <span className="text-gold">ACADEMY</span>
          </div>
          <div className="text-[10px] font-sans font-semibold tracking-[0.25em] text-gold/90 uppercase truncate">
            Competitive Hub by Soma
          </div>
        </div>
        {examLabel && (
          <div className="ml-3 hidden md:inline-flex items-center gap-1.5 rounded-md bg-navy-elevated/80 border border-gold/30 px-2.5 py-1">
            <span className="text-[11px] font-black text-white tracking-wide uppercase">
              {examLabel}
            </span>
          </div>
        )}
      </div>

      {/* Right: timer + overflow */}
      <div className="flex items-center gap-2 shrink-0 no-capture">
        <Link
          to="/app"
          title="Open student & admin dashboard"
          aria-label="Open student and admin dashboard"
          className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-gold/40 px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest text-gold transition hover:bg-gold/10"
        >
          <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
        </Link>
        {rightExtra}
      </div>
    </header>
  );
}
