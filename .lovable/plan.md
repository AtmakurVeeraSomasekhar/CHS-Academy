# Teacher Dashboard UX Refinement

Targeted enhancement over the already-shipped shell (Header, OverflowMenu, resizable split, QuestionPanel, QuestionPalette, Whiteboard w/ Grid/Blank, SessionTimer, NotesPanel). No re-architecture — refine in place.

## Audit findings (extend vs. new)

| # | Section | Decision | Notes |
|---|---|---|---|
| 1 | Floating toolbar | **Refactor existing** `Whiteboard.tsx` toolbar | Add collapse + pin + missing tools |
| 2 | MCQ / Theory modes | **Extend** `QuestionPanel.tsx` | Add mode toggle; hide options in Theory |
| 3 | Teaching Timer | **New** `TeachingTimer.tsx` in footer | Keep header `SessionTimer` untouched |
| 4 | Inline metadata edit | **Extend** `QuestionPanel` Meta row | Persist via lifted state in `routes/index.tsx` |
| 5 | Numbered circles + editable exam | **Refine** `QuestionPalette` + Q chip | Reuse jump logic |
| 6 | Solution Workspace collapse | **Extend** `routes/index.tsx` split | Animate panel; preserve zoom/pan/scroll |
| 7 | Floating Text Box tool | **New** overlay layer on Whiteboard | Coexists with formula tool |
| 8 | Overflow consolidation | **Extend** `OverflowMenu` | Add: Achievements, Focus Mode, Preferences, Import/Export, OCR, AI Features, Voice Recognition, Analytics, Cloud Backup, Keyboard Shortcuts, Teacher Profile, Settings. Audit dupes. |
| 9 | Header audit | **Verify** existing `Header.tsx` | Add Mode badge; remove streak chip (moves out) |
| 10 | 65/70–30/35 default split | **Adjust default** in ResizablePanelGroup | |
| 11 | Framer Motion pass | **New dep** `framer-motion` | Confirmed needed |
| 12 | Responsive audit | Verify | Toolbar + textbox first |
| 13 | Keyboard shortcuts | **New** `useCanvasShortcuts` hook | Guard `activeElement` = input/textarea/contentEditable |
| 14 | Visual polish | Pass | Reuse tokens |

## Ground rules baked in
- Shortcut guard helper `isTypingTarget()` used by every single-letter binding.
- All animations wrapped in `useReducedMotion()` → duration 0 fallback.
- Each section lands in demoable state before moving on.

## Implementation order

**Step A — Deps & primitives**
- `bun add framer-motion`
- `src/hooks/useCanvasShortcuts.ts` (shortcut guard + registry)
- `src/hooks/useReducedMotionSafe.ts` wrapper

**Step B — Section 1 (Toolbar)**
Refactor Whiteboard toolbar into `WhiteboardToolbar.tsx`:
- Collapsed = pen FAB; expanded = full palette
- Pin toggle (📌); auto-collapse after tool select unless pinned
- Add missing tools: pencil, marker, dashed line, arrow, triangle, polygon, opacity slider
- Framer Motion `AnimatePresence` for expand/collapse

**Step C — Section 2 (Modes)**
- Add `mode: 'mcq' | 'theory'` in `routes/index.tsx`
- Segmented control at top of `QuestionPanel`
- Theory mode: hide options grid + reveal badge; show large `<textarea>`-style scratch area bound to per-question `theoryNotes` map (localStorage)

**Step D — Section 4 + 5 (Inline edits + numbered nav)**
- Lift questions to state in `routes/index.tsx` (seed from `@/data/questions`)
- Meta cells become click-to-edit (input for Topic/Concept, Select for Difficulty)
- Exam chip becomes editable input
- `QuestionPalette`: swap "Q{n}" labels for plain numbers; keep color coding

**Step E — Section 6 (Collapsible Solution Workspace)**
- Add `solutionCollapsed` state; when true, right ResizablePanel → 0% with motion
- Preserve Excalidraw scene ref; do not remount

**Step F — Section 3 (Teaching Timer)**
- Replace footer left+center content with `TeachingTimer` (modes: Countdown / Stopwatch / Question)
- Keep footer right (Subscribe/Youtube) as-is minus tagline
- Streak chip stays in header

**Step G — Section 7 (Text Box tool)**
- `TextBoxLayer.tsx` — absolute-positioned layer over Excalidraw
- Boxes: {id, x, y, w, h, rot, text, font, size, weight, italic, underline, align, color, bg, border, opacity}
- Drag/resize/rotate handles; toolbar popover for formatting; duplicate/delete
- Included in PNG/PDF export via `html-to-image` on wrapper (already effectively covered by existing exports composing DOM)

**Step H — Section 8 + 9 (Menu consolidation + header audit)**
- Extend `OverflowMenu` with new grouped sections (Studio / AI / Data / Account); dedupe existing entries
- Keyboard Shortcuts entry opens a Dialog listing bindings
- Header: add Mode badge (MCQ|Theory) next to exam label

**Step I — Section 10 + 11 + 14 (Split + motion + polish)**
- Default split 68/32
- Wrap panel collapse, mode switch, toolbar, timer mode change, menu, textbox place with Framer Motion
- Polish: shadow-elegant, rounded-2xl on floating elements, glass on toolbar

**Step J — Section 12 + 13 (Responsive + shortcuts)**
- Test 1280/1920/2560/3840 + tablet in Playwright
- Wire `useCanvasShortcuts` on whiteboard container; document in Shortcuts dialog

## Files touched / added

Added:
- `src/components/chs/WhiteboardToolbar.tsx`
- `src/components/chs/TeachingTimer.tsx`
- `src/components/chs/TextBoxLayer.tsx`
- `src/components/chs/ShortcutsDialog.tsx`
- `src/hooks/useCanvasShortcuts.ts`
- `src/hooks/useReducedMotionSafe.ts`

Modified:
- `src/components/chs/Whiteboard.tsx` (toolbar extraction, textbox layer mount, shortcuts)
- `src/components/chs/QuestionPanel.tsx` (mode toggle, inline metadata, numbered nav integration)
- `src/components/chs/QuestionPalette.tsx` (number-only labels)
- `src/components/chs/Header.tsx` (Mode badge)
- `src/components/chs/Footer.tsx` (replace tagline with TeachingTimer)
- `src/components/chs/OverflowMenu.tsx` (new items + shortcuts dialog trigger)
- `src/routes/index.tsx` (mode state, editable questions, collapse state, default split 68/32)
- `package.json` (framer-motion)

## Risks
- Excalidraw remount on collapse — mitigated by keeping panel mounted at width 0.
- Shortcut leakage into text tool — mitigated by `isTypingTarget()` used everywhere.
- Text box export fidelity — verified via existing DOM-based PNG capture path.

Reply "go" to implement, or call out sections to defer.