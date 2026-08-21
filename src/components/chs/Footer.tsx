import { Flame, Youtube } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { TeachingTimer } from "@/components/chs/TeachingTimer";

export function Footer() {
  const streak = useStreak();
  return (
    <footer className="h-[64px] shrink-0 bg-navy-deep border-t-2 border-gold/60 px-6 flex items-center justify-between gap-4 font-sans no-capture">
      {/* Left: streak + tagline */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="inline-flex items-center gap-1 rounded-full bg-brand-red/15 border border-brand-red/40 px-2 py-0.5">
          <Flame className="h-3.5 w-3.5 text-brand-red" />
          <span className="text-[11px] font-black text-white tabular-nums">
            {streak}
          </span>
          <span className="text-[9px] font-bold tracking-widest text-white/70 uppercase">
            day{streak === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Center: Teaching Timer */}
      <div className="flex-1 flex justify-center">
        <TeachingTimer />
      </div>

      {/* Right: brand */}
      <div className="flex items-center gap-3 min-w-[220px] justify-end">
        <div className="leading-tight text-right hidden sm:block">
          <div className="text-[12px] font-black text-white tracking-wide">
            CHS ACADEMY
          </div>
          <div className="text-[10px] text-white/60 tracking-widest uppercase">
            Discipline · Success
          </div>
        </div>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-[color:var(--brand-red)] px-2.5 py-1 shadow-lg shadow-red-900/40 hover:brightness-110 transition"
        >
          <Youtube className="h-4 w-4 text-white" />
          <span className="text-[11px] font-black text-white tracking-wide uppercase">
            Subscribe
          </span>
        </a>
      </div>
    </footer>
  );
}
