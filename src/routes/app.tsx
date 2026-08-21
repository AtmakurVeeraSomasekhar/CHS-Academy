import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Presentation } from "lucide-react";
import { AppSidebar } from "@/components/app/AppSidebar";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-navy-deep text-white">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-gold/25 bg-navy-deep/95 px-4">
          <div className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/45">
            CHS Academy · Competitive Hub by Soma
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest text-gold transition hover:bg-gold/10"
          >
            <Presentation className="h-3.5 w-3.5" /> Teaching Studio
          </Link>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-5">
          {/* Required: nested /app routes render here. */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
