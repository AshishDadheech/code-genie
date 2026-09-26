import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Empty, ErrorState, Loading, Pill } from "@/components/states";
import { supabase } from "@/integrations/supabase/client";
import { useAppSelector } from "@/store";
import { isOverdue, type Task } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Taskforge" }, { name: "description", content: "Your project and task overview." }, { property: "og:title", content: "Dashboard — Taskforge" }, { property: "og:description", content: "Your project and task overview." }] }),
  component: Dashboard,
});

type Mini = Pick<Task, "id" | "title" | "status" | "priority" | "due_date" | "project_id">;

function Dashboard() {
  const { items: projects, status: pStatus } = useAppSelector((s) => s.projects);
  const [tasks, setTasks] = useState<Mini[] | null>(null);
  const [err, setErr] = useState(false);

  const load = () => {
    setErr(false); setTasks(null);
    supabase.from("tasks").select("id,title,status,priority,due_date,project_id").then(({ data, error }) => {
      if (error) setErr(true); else setTasks(data ?? []);
    });
  };
  useEffect(load, []);

  if (err) return <ErrorState text="Unable to load dashboard. Please try again." onRetry={load} />;
  if (!tasks || pStatus === "loading") return <Loading text="Loading dashboard..." />;

  const overdue = tasks.filter(isOverdue);
  const stats = [
    ["Total projects", projects.length],
    ["Active projects", projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "PLANNING").length],
    ["Completed projects", projects.filter((p) => p.status === "COMPLETED").length],
    ["Total tasks", tasks.length],
    ["Pending tasks", tasks.filter((t) => t.status !== "COMPLETED").length],
    ["Completed tasks", tasks.filter((t) => t.status === "COMPLETED").length],
    ["Overdue tasks", overdue.length],
    ["High-priority tasks", tasks.filter((t) => (t.priority === "HIGH" || t.priority === "CRITICAL") && t.status !== "COMPLETED").length],
  ] as const;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="font-display text-3xl font-bold">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Project progress</h2>
          {projects.length === 0 ? <Empty text="No projects yet." /> : projects.map((p) => {
            const pt = tasks.filter((t) => t.project_id === p.id);
            const done = pt.filter((t) => t.status === "COMPLETED").length;
            const pct = pt.length ? Math.round((done / pt.length) * 100) : 0;
            return (
              <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="block rounded-lg border bg-card p-3 hover:bg-muted/50">
                <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{p.name}</span><span className="text-muted-foreground">{done}/{pt.length} · {pct}%</span></div>
                <Progress value={pct} />
              </Link>
            );
          })}
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Overdue tasks</h2>
          {overdue.length === 0 ? <Empty text="No overdue tasks." /> : (
            <div className="divide-y rounded-lg border bg-card">
              {overdue.map((t) => (
                <Link key={t.id} to="/projects/$id" params={{ id: t.project_id }} className="flex items-center justify-between p-3 text-sm hover:bg-muted/50">
                  <span>{t.title}</span><span className="flex items-center gap-2"><Pill value={t.priority} /><span className="text-destructive">{t.due_date}</span></span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
