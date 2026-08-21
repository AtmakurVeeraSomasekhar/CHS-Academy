import { Timer, Pause, Play } from "lucide-react";
import { formatTime } from "@/hooks/useSessionTimer";

const WARN_SEC = 180;

interface Props {
  currentSec: number;
  running: boolean;
  onToggle: () => void;
}

export function SessionTimer({ currentSec, running, onToggle }: Props) {
  const warn = currentSec >= WARN_SEC;
  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-lg bg-navy-elevated/80 border border-gold/30 px-2.5 py-1.5 shadow hover:bg-navy-elevated transition"
      title={running ? "Pause timer" : "Start timer"}
    >
      <Timer className={`h-4 w-4 ${warn ? "text-brand-red" : "text-gold"}`} />
      <span
        className={`font-sans font-bold text-sm tabular-nums ${
          warn ? "text-brand-red" : "text-white"
        }`}
      >
        {formatTime(currentSec)}
      </span>
      {running ? (
        <Pause className="h-3 w-3 text-white/60" />
      ) : (
        <Play className="h-3 w-3 text-white/60" />
      )}
    </button>
  );
}
