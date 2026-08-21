import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/Primitives";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/app/$")({
  head: () => ({
    meta: [
      { title: "Section — CHS Academy" },
      { name: "description", content: "This CHS Academy section is being prepared." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlaceholderPage,
});

const TITLES: Record<string, string> = {
  "study-material": "Study Material",
  "live-classes": "Live Classes",
  "previous-papers": "Previous Papers",
  "practice-sets": "Practice Sets",
  profile: "Profile",
  settings: "Settings",
  "admin/exams": "Exams",
  "admin/questions": "Questions",
  "admin/students": "Students",
  "admin/reports": "Reports",
};

function PlaceholderPage() {
  const { _splat } = Route.useParams();
  const key = (_splat ?? "").replace(/\/$/, "");
  const title = TITLES[key] ?? "Section";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={title} subtitle="Not built yet" />
      <Panel>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Construction className="h-6 w-6 text-gold" />
          <p className="font-sans text-[12px] text-white/60">
            {title} has no implementation yet. The navigation entry is wired so it can be
            built without touching the layout.
          </p>
          <Link
            to="/app"
            className="rounded-md border border-gold/40 px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest text-gold transition hover:bg-gold/10"
          >
            Back to dashboard
          </Link>
        </div>
      </Panel>
    </div>
  );
}
