import { useMemo, useState } from "react";
import {
  ChevronRight,
  FileText,
  Layers,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TheorySelection, TheorySubject } from "@/data/theory";

interface Props {
  subjects: TheorySubject[];
  selection: TheorySelection | null;
  onSelect: (s: TheorySelection) => void;
  onAddSubject: (title: string) => void;
  onAddTopic: (subjectId: string, title: string) => void;
  onAddChapter: (subjectId: string, topicId: string, title: string) => void;
}

type AddKind = "subject" | "topic" | "chapter";

/**
 * Compact left-side theory navigator: a single ⋮ button that opens a
 * Subjects → Topics → Chapters drawer. Content itself stays data-driven.
 */
export function TheoryNav({
  subjects,
  selection,
  onSelect,
  onAddSubject,
  onAddTopic,
  onAddChapter,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openSubject, setOpenSubject] = useState<string | null>(
    selection?.subjectId ?? subjects[0]?.id ?? null,
  );
  const [openTopic, setOpenTopic] = useState<string | null>(selection?.topicId ?? null);
  const [add, setAdd] = useState<{ kind: AddKind; subjectId?: string; topicId?: string } | null>(
    null,
  );
  const [draft, setDraft] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return subjects;
    return subjects
      .map((s) => ({
        ...s,
        topics: s.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            s.title.toLowerCase().includes(q) ||
            t.chapters.some((c) => c.title.toLowerCase().includes(q)),
        ),
      }))
      .filter((s) => s.topics.length > 0 || s.title.toLowerCase().includes(q));
  }, [subjects, q]);

  const submitAdd = () => {
    const title = draft.trim();
    if (!title || !add) return setAdd(null);
    if (add.kind === "subject") onAddSubject(title);
    else if (add.kind === "topic" && add.subjectId) onAddTopic(add.subjectId, title);
    else if (add.kind === "chapter" && add.subjectId && add.topicId)
      onAddChapter(add.subjectId, add.topicId, title);
    setDraft("");
    setAdd(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-navy-elevated text-gold transition hover:brightness-125"
            title="Browse subjects & chapters"
            aria-label="Browse subjects and chapters"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[320px] border-gold/30 bg-navy-deep p-0 text-white sm:max-w-[320px]"
        >
          <SheetTitle className="sr-only">Theory navigation</SheetTitle>
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center gap-2 border-b border-gold/30 px-3 py-3">
              <div className="min-w-0">
                <div className="font-display text-sm font-semibold tracking-wide">
                  CHS <span className="text-gold">ACADEMY</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-gold/80">
                  Subjects
                </div>
              </div>
              <button
                onClick={() => {
                  setDraft("");
                  setAdd({ kind: "subject" });
                }}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-md border border-gold/40 bg-navy-elevated text-gold hover:brightness-125"
                title="Add subject"
                aria-label="Add subject"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-white/10 px-3 py-2">
              <div className="flex items-center gap-2 rounded-md border border-white/15 bg-navy-elevated px-2 py-1.5">
                <Search className="h-3.5 w-3.5 text-gold/80" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search topics…"
                  className="w-full bg-transparent font-sans text-[12px] text-white outline-none placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="chs-scroll min-h-0 flex-1 overflow-y-auto px-2 py-2">
              {filtered.map((s) => {
                const sOpen = openSubject === s.id || !!q;
                return (
                  <div key={s.id} className="mb-1">
                    <div className="flex items-center">
                      <button
                        onClick={() => setOpenSubject(sOpen && !q ? null : s.id)}
                        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition hover:bg-white/10"
                      >
                        <ChevronRight
                          className={`h-3.5 w-3.5 shrink-0 text-gold transition ${sOpen ? "rotate-90" : ""}`}
                        />
                        <Layers className="h-3.5 w-3.5 shrink-0 text-gold/70" />
                        <span className="truncate font-sans text-[12px] font-bold uppercase tracking-wider">
                          {s.title}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setDraft("");
                          setAdd({ kind: "topic", subjectId: s.id });
                        }}
                        className="mr-1 flex h-6 w-6 items-center justify-center rounded text-gold/70 hover:bg-white/10 hover:text-gold"
                        title={`Add topic to ${s.title}`}
                        aria-label={`Add topic to ${s.title}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {sOpen && (
                      <div className="ml-4 border-l border-white/10 pl-2">
                        {s.topics.map((t) => {
                          const tOpen = openTopic === t.id;
                          return (
                            <div key={t.id}>
                              <div className="flex items-center">
                                <button
                                  onClick={() => setOpenTopic(tOpen ? null : t.id)}
                                  className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1 text-left transition hover:bg-white/10 ${
                                    selection?.topicId === t.id ? "text-gold" : "text-white/85"
                                  }`}
                                >
                                  <ChevronRight
                                    className={`h-3 w-3 shrink-0 transition ${tOpen ? "rotate-90" : ""}`}
                                  />
                                  <span className="truncate font-sans text-[12px]">{t.title}</span>
                                  {t.chapters.length > 0 && (
                                    <span className="ml-auto shrink-0 rounded bg-white/10 px-1 font-sans text-[10px] tabular-nums">
                                      {t.chapters.length}
                                    </span>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setDraft("");
                                    setAdd({ kind: "chapter", subjectId: s.id, topicId: t.id });
                                  }}
                                  className="mr-1 flex h-6 w-6 items-center justify-center rounded text-gold/60 hover:bg-white/10 hover:text-gold"
                                  title={`Add chapter to ${t.title}`}
                                  aria-label={`Add chapter to ${t.title}`}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              {tOpen && (
                                <div className="ml-4 border-l border-white/10 pl-2">
                                  {t.chapters.length === 0 && (
                                    <div className="px-2 py-1 font-sans text-[11px] text-white/40">
                                      No chapters yet
                                    </div>
                                  )}
                                  {t.chapters.map((c) => {
                                    const active = selection?.chapterId === c.id;
                                    return (
                                      <button
                                        key={c.id}
                                        onClick={() => {
                                          onSelect({
                                            subjectId: s.id,
                                            topicId: t.id,
                                            chapterId: c.id,
                                          });
                                          setOpen(false);
                                        }}
                                        className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left transition ${
                                          active
                                            ? "bg-gold text-navy-deep"
                                            : "text-white/80 hover:bg-white/10"
                                        }`}
                                      >
                                        <FileText className="h-3 w-3 shrink-0" />
                                        <span className="truncate font-sans text-[12px]">
                                          {c.title}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!add} onOpenChange={(v) => !v && setAdd(null)}>
        <DialogContent className="max-w-sm border-gold/30 bg-navy-panel text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-base tracking-wide">
              Add {add?.kind}
            </DialogTitle>
          </DialogHeader>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAdd()}
            placeholder={`New ${add?.kind ?? ""} name`}
            className="w-full rounded-md border border-gold/40 bg-navy-elevated px-3 py-2 font-sans text-sm text-white outline-none focus:ring-2 focus:ring-gold/40"
          />
          <DialogFooter>
            <button
              onClick={submitAdd}
              className="rounded-md bg-gold px-3 py-1.5 font-sans text-[11px] font-black uppercase tracking-widest text-navy-deep hover:brightness-110"
            >
              Add
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
