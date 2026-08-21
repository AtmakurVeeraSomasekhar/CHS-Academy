import { GraduationCap, NotebookPen, SquareStack } from "lucide-react";
import type { StudioMode } from "@/lib/annotation/types.modes";

interface Props {
  mode: StudioMode;
  onMode: (m: StudioMode) => void;
  annotate: boolean;
  onAnnotate: (v: boolean) => void;
}

/** MCQ ↔ Theory switcher plus the global annotation toggle. */
export function ModeSwitcher({ mode, onMode, annotate, onAnnotate }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-lg border border-gold/30 bg-navy-elevated/90 p-0.5">
        <button
          onClick={() => onMode("mcq")}
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-sans text-[11px] font-black uppercase tracking-widest transition ${
            mode === "mcq" ? "bg-gold text-navy-deep" : "text-white/80 hover:bg-white/10"
          }`}
          title="MCQ teaching mode"
        >
          <SquareStack className="h-3.5 w-3.5" />
          MCQ
        </button>
        <button
          onClick={() => onMode("theory")}
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-sans text-[11px] font-black uppercase tracking-widest transition ${
            mode === "theory" ? "bg-gold text-navy-deep" : "text-white/80 hover:bg-white/10"
          }`}
          title="Theory teaching mode"
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Theory
        </button>
      </div>
      <button
        onClick={() => onAnnotate(!annotate)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest transition ${
          annotate
            ? "border-gold bg-gold text-navy-deep"
            : "border-gold/40 bg-navy-elevated text-gold hover:brightness-125"
        }`}
        title="Write anywhere on the dashboard (Ctrl+Shift+A)"
      >
        <NotebookPen className="h-3.5 w-3.5" />
        {annotate ? "Annotating" : "Annotate"}
      </button>
    </div>
  );
}
