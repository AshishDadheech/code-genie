import { createFileRoute } from "@tanstack/react-router";
import { TaskList } from "@/components/TaskList";
import { usePeople } from "@/hooks/use-people";
import { useAppSelector } from "@/store";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Taskforge" }, { name: "description", content: "Search, filter and sort all your tasks." }, { property: "og:title", content: "Tasks — Taskforge" }, { property: "og:description", content: "Search, filter and sort all your tasks." }] }),
  component: TasksPage,
});

function TasksPage() {
  const people = usePeople();
  const user = useAppSelector((s) => s.auth.user);
  const projects = useAppSelector((s) => s.projects.items);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">All tasks</h1>
      <TaskList people={people} canEdit={(t) => t.assigned_to === user?.id || projects.find((p) => p.id === t.project_id)?.owner_id === user?.id} />
    </div>
  );
}
