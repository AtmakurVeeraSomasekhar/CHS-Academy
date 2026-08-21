import type { ReactNode } from "react";

/** Shared page chrome for every /app/* screen: title row + scrollable body. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[22px] font-bold tracking-wide text-gold">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 font-sans text-[12px] text-white/55">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-navy-panel/70 p-4 ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && (
            <h2 className="font-sans text-[11px] font-black uppercase tracking-[0.18em] text-white/60">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-panel/70 px-4 py-3">
      <div className="font-sans text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-gold">{value}</div>
      {hint && <div className="font-sans text-[10px] text-white/40">{hint}</div>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 px-4 py-8 text-center font-sans text-[12px] text-white/45">
      {children}
    </div>
  );
}

export function DifficultyBadge({ value }: { value: string }) {
  const tone =
    value === "Easy"
      ? "border-emerald-400/40 text-emerald-300"
      : value === "Hard"
        ? "border-brand-red/50 text-brand-red"
        : "border-gold/40 text-gold";
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-sans text-[9px] font-black uppercase tracking-widest ${tone}`}
    >
      {value}
    </span>
  );
}
