import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Flame, FolderKanban, ListChecks, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Empty, ErrorState, Loading, Pill } from "@/components/states";
import { supabase } from "@/integrations/supabase/client";
import { useAppSelector } from "@/store";
import { isOverdue, label, type Task } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Taskforge" }, { name: "description", content: "Your project and task overview." }, { property: "og:title", content: "Dashboard — Taskforge" }, { property: "og:description", content: "Your project and task overview." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

type Mini = Pick<Task, "id" | "title" | "status" | "priority" | "due_date" | "project_id">;

function Dashboard() {
  const { items: projects, status: pStatus } = useAppSelector((s) => s.projects);
  const user = useAppSelector((s) => s.auth.user);
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
  const done = tasks.filter((t) => t.status === "COMPLETED").length;
  const overall = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const active = projects.filter((p) => p.status !== "ARCHIVED");
  const stats = [
    { k: "Projects", v: active.length, icon: FolderKanban },
    { k: "Pending tasks", v: tasks.length - done, icon: Clock },
    { k: "Completed", v: done, icon: CheckCircle2 },
    { k: "Overdue", v: overdue.length, icon: AlertTriangle, warn: overdue.length > 0 },
    { k: "High priority", v: tasks.filter((t) => (t.priority === "HIGH" || t.priority === "CRITICAL") && t.status !== "COMPLETED").length, icon: Flame },
    { k: "Total tasks", v: tasks.length, icon: ListChecks },
  ];
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{greet}</p>
            <h1 className="font-display text-3xl font-bold">{user?.full_name || user?.email?.split("@")[0] || "Welcome"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{active.length} active projects · {overall}% of all tasks done</p>
          </div>
          <Button asChild><Link to="/projects"><Plus className="h-4 w-4" /> New project</Link></Button>
        </div>
        <Progress value={overall} className="mt-5 h-2" />
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.k} className="rounded-xl border bg-card p-4">
            <s.icon className={`h-5 w-5 ${s.warn ? "text-destructive" : "text-primary"}`} />
            <div className="mt-3 font-display text-2xl font-bold">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.k}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Your projects</h2>
          <Link to="/projects" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {active.length === 0 ? <Empty text="No projects yet. Create your first project to get started." /> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {active.map((p) => {
              const pt = tasks.filter((t) => t.project_id === p.id);
              const d = pt.filter((t) => t.status === "COMPLETED").length;
              const od = pt.filter(isOverdue).length;
              const pct = pt.length ? Math.round((d / pt.length) * 100) : 0;
              return (
                <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="group flex flex-col rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-display font-bold text-primary">{p.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <h3 className="font-display font-semibold group-hover:text-primary">{p.name}</h3>
                        <Pill value={p.status} text={label(p.status)} />
                      </div>
                    </div>
                    <Pill value={p.priority} />
                  </div>
                  <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.description || "No description"}</p>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground"><span>{d}/{pt.length} tasks</span><span className="font-medium text-foreground">{pct}%</span></div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>{p.due_date ? `Due ${p.due_date}` : "No due date"}</span>
                    {od > 0 && <span className="text-destructive">{od} overdue</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Overdue tasks</h2>
        {overdue.length === 0 ? <Empty text="No overdue tasks. Great job!" /> : (
          <div className="divide-y rounded-xl border bg-card">
            {overdue.map((t) => (
              <Link key={t.id} to="/projects/$id" params={{ id: t.project_id }} className="flex items-center justify-between p-3 text-sm hover:bg-muted/50">
                <span>{t.title}</span><span className="flex items-center gap-2"><Pill value={t.priority} /><span className="text-destructive">{t.due_date}</span></span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
