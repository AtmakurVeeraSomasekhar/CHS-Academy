import { Star } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Question } from "@/data/questions";

interface Props {
  questions: Question[];
  favoriteIds: number[];
  onJump: (index: number) => void;
}

export function FavoritesDrawer({ questions, favoriteIds, onJump }: Props) {
  const favs = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => favoriteIds.includes(q.questionNo));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="inline-flex items-center gap-1 rounded-md bg-navy-elevated/80 border border-gold/30 px-2.5 py-1.5 text-xs font-bold text-gold hover:bg-navy-elevated transition"
          title="Favorites"
        >
          <Star className="h-4 w-4" fill="currentColor" /> {favoriteIds.length}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-navy-panel text-white border-l-gold/40">
        <SheetHeader>
          <SheetTitle className="text-white font-display">My Favorites</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {favs.length === 0 && (
            <p className="text-sm text-white/60">
              No favorites yet — star a question to save it here.
            </p>
          )}
          {favs.map(({ q, i }) => (
            <button
              key={q.questionNo}
              onClick={() => onJump(i)}
              className="w-full text-left rounded-md border border-white/10 bg-navy-elevated/60 hover:border-gold/50 hover:bg-navy-elevated px-3 py-2 transition"
            >
              <div className="text-xs font-black text-gold tracking-widest uppercase">
                Q{q.questionNo} · {q.topic}
              </div>
              <div className="text-sm text-white/85 line-clamp-2 font-serif">
                {q.question.replace(/\$/g, "")}
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
