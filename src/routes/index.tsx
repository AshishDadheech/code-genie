import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taskforge — Project & Task Management" },
      { name: "description", content: "Plan projects, invite members, track tasks with filters, dashboards and notifications." },
      { property: "og:title", content: "Taskforge — Project & Task Management" },
      { property: "og:description", content: "Plan projects, invite members, track tasks with filters, dashboards and notifications." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const user = useAppSelector((s) => s.auth.user);
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 py-24">
        <span className="font-display text-xl font-bold text-primary">Taskforge</span>
        <h1 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Projects, people and tasks —<br /><span className="text-primary">in one clear place.</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Create projects, add members, assign tasks, and see progress, overdue work and notifications at a glance.
        </p>
        <div className="flex gap-3">
          {user ? (
            <Button asChild size="lg"><Link to="/dashboard">Open dashboard</Link></Button>
          ) : (
            <>
              <Button asChild size="lg"><Link to="/auth">Get started</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/auth">Sign in</Link></Button>
            </>
          )}
        </div>
        <div className="mt-8 grid w-full gap-4 md:grid-cols-3">
          {[
            ["Roles & permissions", "Admins, owners and members each see exactly what they should."],
            ["Search & filters", "Combine search, status, priority, assignee and due date with pagination."],
            ["Live progress", "Dashboard progress and overdue tasks calculated from real task data."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border bg-card p-5">
              <h3 className="font-display font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
