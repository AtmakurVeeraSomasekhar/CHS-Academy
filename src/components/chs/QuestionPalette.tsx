import { Grid3x3 } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Question } from "@/data/questions";

export type Attempt = "correct" | "wrong" | undefined;

interface Props {
  questions: Question[];
  attempts: Record<number, Attempt>;
  favorites: number[];
  currentIndex: number;
  onJump: (i: number) => void;
}

export function QuestionPalette({
  questions,
  attempts,
  favorites,
  currentIndex,
  onJump,
}: Props) {
  const [favOnly, setFavOnly] = useState(false);
  const items = favOnly
    ? questions.map((q, i) => ({ q, i })).filter(({ q }) => favorites.includes(q.questionNo))
    : questions.map((q, i) => ({ q, i }));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Jump to question"
          className="inline-flex items-center gap-1 rounded-md bg-navy-elevated px-3 py-2 text-white text-sm font-bold hover:brightness-110 transition font-sans"
        >
          <Grid3x3 className="h-4 w-4" /> Jump
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 bg-navy-panel text-white border-gold/30">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-black tracking-widest uppercase text-gold">
            Question Palette
          </div>
          <label className="flex items-center gap-1 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={favOnly}
              onChange={(e) => setFavOnly(e.target.checked)}
              className="accent-[color:var(--gold)]"
            />
            <span className="text-white/70">★ favorites</span>
          </label>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {items.map(({ q, i }) => {
            const a = attempts[q.questionNo];
            const isFav = favorites.includes(q.questionNo);
            const bg =
              a === "correct"
                ? "bg-emerald-500 text-white"
                : a === "wrong"
                  ? "bg-red-500 text-white"
                  : "bg-navy-elevated text-white/85";
            return (
              <button
                key={q.questionNo}
                onClick={() => onJump(i)}
                className={`relative h-9 rounded-md text-xs font-bold ${bg} ${
                  currentIndex === i ? "ring-2 ring-gold" : ""
                } ${isFav ? "outline outline-1 outline-gold/60" : ""}`}
                title={`Q${q.questionNo} · ${q.topic}`}
              >
                {q.questionNo}
                {isFav && (
                  <span className="absolute -top-1 -right-1 text-[10px] text-gold">★</span>
                )}
              </button>
            );
          })}
          {items.length === 0 && (
            <div className="col-span-6 text-center text-xs text-white/60 py-6">
              No questions match this filter.
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px] text-white/60">
          <Legend color="bg-emerald-500" label="Correct" />
          <Legend color="bg-red-500" label="Wrong" />
          <Legend color="bg-navy-elevated" label="Unseen" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`h-2.5 w-2.5 rounded ${color}`} />
      {label}
    </div>
  );
}
