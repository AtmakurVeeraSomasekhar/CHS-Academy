import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileStack,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Newspaper,
  NotebookPen,
  PenSquare,
  Presentation,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

type Item = { label: string; to: string; icon: typeof LayoutDashboard };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/app", icon: LayoutDashboard },
      { label: "Mock Tests", to: "/app/mock-tests", icon: ClipboardList },
      { label: "My Results", to: "/app/results", icon: Trophy },
      { label: "Answer Review", to: "/app/review", icon: ListChecks },
      { label: "Current Affairs", to: "/app/current-affairs", icon: Newspaper },
    ],
  },
  {
    title: "Study",
    items: [
      { label: "Study Material", to: "/app/study-material", icon: BookOpen },
      { label: "Theory", to: "/", icon: NotebookPen },
      { label: "Live Classes", to: "/app/live-classes", icon: Presentation },
      { label: "Previous Papers", to: "/app/previous-papers", icon: FileStack },
      { label: "Practice Sets", to: "/app/practice-sets", icon: FileText },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", to: "/app/profile", icon: UserRound },
      { label: "Settings", to: "/app/settings", icon: Settings },
    ],
  },
  {
    title: "Teacher / Admin",
    items: [
      { label: "Admin Dashboard", to: "/app/admin", icon: ShieldCheck },
      { label: "Exams", to: "/app/admin/exams", icon: GraduationCap },
      { label: "Questions", to: "/app/admin/questions", icon: PenSquare },
      { label: "Theory Library", to: "/", icon: BookOpen },
      { label: "Students", to: "/app/admin/students", icon: Users },
      { label: "Reports", to: "/app/admin/reports", icon: BarChart3 },
    ],
  },
];

const KEY = "chs:nav:collapsed";

/**
 * Collapsible primary navigation. Icons-only when collapsed; the collapsed
 * state is remembered in localStorage (read after hydration to stay SSR-safe).
 */
export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      try {
        window.localStorage.setItem(KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  };

  const isActive = (to: string) =>
    to === "/app" ? pathname === "/app" : pathname.startsWith(to) && to !== "/";

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-gold/25 bg-navy-deep transition-[width] duration-200 ${
        collapsed ? "w-[62px]" : "w-[228px]"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-gold/25 px-3 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold font-display text-sm font-black text-navy-deep">
          C
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate font-display text-[13px] font-bold tracking-wide text-gold">
              CHS Academy
            </div>
            <div className="truncate font-sans text-[9px] uppercase tracking-[0.18em] text-white/45">
              Competitive Hub by Soma
            </div>
          </div>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {GROUPS.map((g) => (
          <div key={g.title} className="mb-4">
            {!collapsed && (
              <div className="px-2 pb-1.5 font-sans text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
                {g.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(it.to);
                return (
                  <li key={it.label}>
                    <Link
                      to={it.to}
                      title={it.label}
                      aria-label={it.label}
                      className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 font-sans text-[12px] transition ${
                        active
                          ? "bg-gold/15 font-semibold text-gold"
                          : "text-white/65 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <it.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{it.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <button
        onClick={toggle}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        title={collapsed ? "Expand navigation" : "Collapse navigation"}
        className="flex items-center justify-center gap-2 border-t border-gold/25 py-2 font-sans text-[10px] uppercase tracking-widest text-white/50 transition hover:bg-white/5 hover:text-gold"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}
