import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Flag,
  Timer as TimerIcon,
  ChevronDown,
} from "lucide-react";
import { useMotionDuration } from "@/hooks/useReducedMotionSafe";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTime } from "@/hooks/useSessionTimer";

type Mode = "stopwatch" | "countdown" | "question";

const MODE_LABEL: Record<Mode, string> = {
  stopwatch: "Stopwatch",
  countdown: "Countdown",
  question: "Question Timer",
};

export function TeachingTimer() {
  const [mode, setMode] = useState<Mode>("stopwatch");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdownTarget, setCountdownTarget] = useState(600); // 10 min
  const [laps, setLaps] = useState<number[]>([]);
  const dur = useMotionDuration(0.22);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - elapsed * 1000;
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const remaining =
    mode === "countdown" ? Math.max(0, countdownTarget - elapsed) : elapsed;

  useEffect(() => {
    if (mode === "countdown" && running && remaining === 0) {
      setRunning(false);
    }
  }, [mode, running, remaining]);

  const display = formatTime(mode === "countdown" ? remaining : elapsed);
  const warn = mode === "countdown" && remaining <= 30 && remaining > 0;

  const handleStartPause = () => setRunning((v) => !v);
  const handleStop = () => {
    setRunning(false);
  };
  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };
  const handleLap = () => setLaps((l) => [elapsed, ...l].slice(0, 6));

  return (
    <motion.div
      layout
      transition={{ duration: dur }}
      className="flex items-center gap-2 rounded-xl bg-navy-elevated/70 border border-gold/40 backdrop-blur px-3 py-1.5 shadow-lg shadow-black/30"
    >
      <TimerIcon
        className={`h-4 w-4 ${warn ? "text-brand-red animate-pulse" : "text-gold"}`}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-1 rounded-md bg-navy-deep/60 px-2 py-0.5 text-[10px] font-black tracking-widest uppercase text-gold hover:bg-navy-deep transition"
            title="Timer mode"
          >
            {MODE_LABEL[mode]}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-navy-panel text-white border-gold/30">
          {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
            <DropdownMenuItem
              key={m}
              onClick={() => {
                setMode(m);
                setElapsed(0);
                setRunning(false);
              }}
            >
              {MODE_LABEL[m]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={display}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: dur / 2 }}
          className={`font-mono font-bold text-lg tabular-nums tracking-wide ${
            warn ? "text-brand-red" : "text-white"
          }`}
        >
          {display}
        </motion.span>
      </AnimatePresence>

      {mode === "countdown" && !running && (
        <select
          value={countdownTarget}
          onChange={(e) => {
            setCountdownTarget(Number(e.target.value));
            setElapsed(0);
          }}
          className="bg-navy-deep/60 border border-gold/30 text-white text-[11px] rounded px-1.5 py-0.5"
          aria-label="Countdown length"
        >
          <option value={60}>1m</option>
          <option value={180}>3m</option>
          <option value={300}>5m</option>
          <option value={600}>10m</option>
          <option value={900}>15m</option>
          <option value={1800}>30m</option>
          <option value={2700}>45m</option>
        </select>
      )}

      <div className="flex items-center gap-1">
        <TinyBtn onClick={handleStartPause} title={running ? "Pause" : "Start"}>
          {running ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </TinyBtn>
        <TinyBtn onClick={handleStop} title="Stop">
          <Square className="h-3.5 w-3.5" />
        </TinyBtn>
        <TinyBtn onClick={handleReset} title="Reset">
          <RotateCcw className="h-3.5 w-3.5" />
        </TinyBtn>
        <TinyBtn
          onClick={handleLap}
          title="Lap"
          disabled={!running || mode === "countdown"}
        >
          <Flag className="h-3.5 w-3.5" />
        </TinyBtn>
      </div>

      {laps.length > 0 && (
        <div className="hidden xl:flex items-center gap-1 pl-2 border-l border-white/10 max-w-[220px] overflow-hidden">
          {laps.slice(0, 4).map((l, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono tabular-nums text-gold/80"
            >
              {formatTime(l)}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function TinyBtn({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="h-6 w-6 flex items-center justify-center rounded-md bg-navy-deep/60 text-white/90 hover:bg-navy-deep hover:text-gold disabled:opacity-30 disabled:hover:bg-navy-deep/60 transition"
    >
      {children}
    </button>
  );
}
