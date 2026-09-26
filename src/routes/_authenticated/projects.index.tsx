import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Empty, ErrorState, Loading, Pill } from "@/components/states";
import { ProjectDialog } from "@/components/forms";
import { supabase } from "@/integrations/supabase/client";
import { fetchProjects, upsertProject, useAppDispatch, useAppSelector } from "@/store";
import { label, type Project } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({ meta: [{ title: "Projects — Taskforge" }, { name: "description", content: "All your projects." }, { property: "og:title", content: "Projects — Taskforge" }, { property: "og:description", content: "All your projects." }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((s) => s.projects);
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const visible = items.filter((p) => showArchived || p.status !== "ARCHIVED");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold">Projects</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowArchived((v) => !v)}>{showArchived ? "Hide archived" : "Show archived"}</Button>
          <Button onClick={() => setOpen(true)}>New project</Button>
        </div>
      </div>
      {status === "loading" && items.length === 0 ? <Loading text="Loading projects..." /> :
       status === "failed" ? <ErrorState text="Unable to load projects. Please try again." onRetry={() => dispatch(fetchProjects())} /> :
       visible.length === 0 ? <Empty text="No projects found. Create your first one." /> : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p: Project) => (
            <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="rounded-xl border bg-card p-4 hover:border-primary">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold">{p.name}</h3><Pill value={p.priority} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description || "No description"}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <Pill value={p.status} text={label(p.status)} />
                <span>{p.owner_id === user?.id ? "Owner" : "Member"}{p.due_date ? ` · Due ${p.due_date}` : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <ProjectDialog open={open} onOpenChange={setOpen} onSubmit={async (v) => {
        const { data, error } = await supabase.from("projects").insert({
          name: v.name, description: v.description, status: v.status, priority: v.priority,
          start_date: v.start_date || null, due_date: v.due_date || null, owner_id: user!.id,
        }).select().single();
        if (error) { toast.error(error.message); return; }
        dispatch(upsertProject(data)); toast.success("Project created"); setOpen(false);
      }} />
    </div>
  );
}
