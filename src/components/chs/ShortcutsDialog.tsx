import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SHORTCUT_LIST } from "@/hooks/useCanvasShortcuts";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ShortcutsDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-navy-panel text-white border-gold/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gold tracking-widest text-sm uppercase">
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 grid grid-cols-1 gap-1.5">
          {SHORTCUT_LIST.map((s) => (
            <div
              key={s.keys}
              className="flex items-center justify-between rounded-md bg-navy-elevated/60 border border-white/10 px-3 py-1.5"
            >
              <span className="text-sm text-white/85">{s.label}</span>
              <kbd className="font-mono text-[11px] font-bold tracking-wide bg-navy-deep border border-gold/30 text-gold rounded px-2 py-0.5">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-white/50">
          Single-letter shortcuts only fire when the canvas has focus — typing in an
          input or text box will not trigger tools.
        </p>
      </DialogContent>
    </Dialog>
  );
}
