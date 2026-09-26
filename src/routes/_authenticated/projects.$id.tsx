import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Empty, Loading, Pill, selectCls } from "@/components/states";
import { ProjectDialog, TaskDialog } from "@/components/forms";
import { Confirm } from "@/components/ConfirmButton";
import { TaskList } from "@/components/TaskList";
import { usePeople } from "@/hooks/use-people";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { fetchMembers, removeProject, upsertProject, useAppDispatch, useAppSelector } from "@/store";
import { label, type Task, type TaskInput } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  head: () => ({ meta: [{ title: "Project — Taskforge" }, { name: "description", content: "Project details, members and tasks." }, { property: "og:title", content: "Project — Taskforge" }, { property: "og:description", content: "Project details, members and tasks." }] }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const project = useAppSelector((s) => s.projects.items.find((p) => p.id === id));
  const pStatus = useAppSelector((s) => s.projects.status);
  const members = useAppSelector((s) => s.projects.members[id]) ?? [];
  const people = usePeople();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [delTask, setDelTask] = useState<Task | null>(null);
  const [removeMember, setRemoveMember] = useState<string | null>(null);
  const [addId, setAddId] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => { dispatch(fetchMembers(id)); }, [dispatch, id]);

  const isOwner = project?.owner_id === user?.id;
  const team = useMemo(() => {
    const ids = new Set([project?.owner_id, ...members.map((m) => m.user_id)]);
    return people.filter((p) => ids.has(p.id));
  }, [people, members, project]);

  if (!project) return pStatus === "loading" || pStatus === "idle" ? <Loading text="Loading project..." /> : <Empty text="Project not found or you don't have access." />;

  const saveProject = async (patch: TablesUpdate<"projects">) => {
    const { data, error } = await supabase.from("projects").update(patch).eq("id", id).select().single();
    if (error) { toast.error(error.message); return false; }
    dispatch(upsertProject(data)); return true;
  };

  const saveTask = async (v: TaskInput) => {
    const row = { title: v.title, description: v.description, status: v.status, priority: v.priority, assigned_to: v.assigned_to || null, due_date: v.due_date || null };
    const { error } = editing
      ? await supabase.from("tasks").update(row).eq("id", editing.id)
      : await supabase.from("tasks").insert({ ...row, project_id: id, created_by: user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Task updated" : "Task created");
    setTaskOpen(false); setEditing(null); setRefresh((r) => r + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/projects" className="text-sm text-muted-foreground hover:underline">← Projects</Link>
          <h1 className="font-display text-2xl font-bold">{project.name}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{project.description || "No description"}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Pill value={project.status} text={label(project.status)} /><Pill value={project.priority} />
            <span>Start {project.start_date ?? "—"} · Due {project.due_date ?? "—"}</span>
            <span>· Owner {people.find((p) => p.id === project.owner_id)?.email ?? ""}</span>
            <span>· Updated {new Date(project.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>Edit</Button>
            {project.status !== "ARCHIVED" && <Button variant="outline" onClick={async () => { if (await saveProject({ status: "ARCHIVED" })) toast.success("Project archived"); }}>Archive</Button>}
            <Button variant="destructive" onClick={() => setConfirmDel(true)}>Delete</Button>
          </div>
        )}
      </div>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-display font-semibold">Members</h2>
        <div className="flex flex-wrap gap-2">
          {team.map((p) => (
            <span key={p.id} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
              {p.full_name || p.email}{p.id === project.owner_id && <span className="text-xs text-primary">owner</span>}
              {isOwner && p.id !== project.owner_id && <button className="text-muted-foreground hover:text-destructive" onClick={() => setRemoveMember(p.id)} aria-label="Remove">×</button>}
            </span>
          ))}
        </div>
        {isOwner && (
          <div className="mt-3 flex gap-2">
            <select className={`${selectCls} max-w-xs`} value={addId} onChange={(e) => setAddId(e.target.value)}>
              <option value="">Add a user...</option>
              {people.filter((p) => !team.some((t) => t.id === p.id)).map((p) => <option key={p.id} value={p.id}>{p.full_name ? `${p.full_name} (${p.email})` : p.email}</option>)}
            </select>
            <Button disabled={!addId} onClick={async () => {
              const { error } = await supabase.from("project_members").insert({ project_id: id, user_id: addId });
              if (error) return toast.error(error.message);
              toast.success("Member added"); setAddId(""); dispatch(fetchMembers(id));
            }}>Add</Button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Tasks</h2>
          <Button onClick={() => { setEditing(null); setTaskOpen(true); }}>New task</Button>
        </div>
        <TaskList
          projectId={id} people={team} refreshKey={refresh}
          canEdit={(t) => isOwner || t.assigned_to === user?.id}
          onEdit={isOwner ? (t) => { setEditing(t); setTaskOpen(true); } : undefined}
          onDelete={isOwner ? setDelTask : undefined}
        />
      </section>

      <ProjectDialog open={editOpen} onOpenChange={setEditOpen}
        initial={{ name: project.name, description: project.description, status: project.status, priority: project.priority, start_date: project.start_date ?? "", due_date: project.due_date ?? "" }}
        onSubmit={async (v) => { if (await saveProject({ ...v, start_date: v.start_date || null, due_date: v.due_date || null })) { toast.success("Project updated"); setEditOpen(false); } }} />
      <TaskDialog open={taskOpen} onOpenChange={(o) => { setTaskOpen(o); if (!o) setEditing(null); }} people={team} onSubmit={saveTask}
        initial={editing ? { title: editing.title, description: editing.description, status: editing.status, priority: editing.priority, assigned_to: editing.assigned_to ?? "", due_date: editing.due_date ?? "" } : undefined} />
      <Confirm open={confirmDel} onOpenChange={setConfirmDel} title="Delete project?" description="This permanently deletes the project and all its tasks."
        onConfirm={async () => {
          const { error } = await supabase.from("projects").delete().eq("id", id);
          if (error) return toast.error(error.message);
          dispatch(removeProject(id)); toast.success("Project deleted"); navigate({ to: "/projects" });
        }} />
      <Confirm open={!!delTask} onOpenChange={(o) => !o && setDelTask(null)} title="Delete task?" description={delTask?.title}
        onConfirm={async () => {
          const { error } = await supabase.from("tasks").delete().eq("id", delTask!.id);
          if (error) return toast.error(error.message);
          toast.success("Task deleted"); setDelTask(null); setRefresh((r) => r + 1);
        }} />
      <Confirm open={!!removeMember} onOpenChange={(o) => !o && setRemoveMember(null)} title="Remove member?" description="They will lose access to this project." action="Remove"
        onConfirm={async () => {
          const { error } = await supabase.from("project_members").delete().eq("project_id", id).eq("user_id", removeMember!);
          if (error) return toast.error(error.message);
          toast.success("Member removed"); setRemoveMember(null); dispatch(fetchMembers(id));
        }} />
    </div>
  );
}
