import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty, ErrorState, Loading, Pill, selectCls } from "@/components/states";
import { fetchTasks, updateTaskStatus, useAppDispatch, useAppSelector, type TaskQuery } from "@/store";
import { isOverdue, label, TASK_PRIORITIES, TASK_STATUSES, type Profile, type Task } from "@/lib/domain";

type Props = {
  projectId?: string;
  people: Profile[];
  canEdit: (t: Task) => boolean;
  onEdit?: (t: Task) => void;
  onDelete?: (t: Task) => void;
  refreshKey?: number;
};

export function TaskList({ projectId, people, canEdit, onEdit, onDelete, refreshKey = 0 }: Props) {
  const dispatch = useAppDispatch();
  const { items, total, status, error } = useAppSelector((s) => s.tasks);
  const projects = useAppSelector((s) => s.projects.items);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState<TaskQuery>({ projectId, search: "", status: "", priority: "", assignee: "", due: "", sort: "created_at:desc", page: 1, pageSize: 8 });

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => setQ((p) => (p.search === searchInput ? p : { ...p, search: searchInput, page: 1 })), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = () => dispatch(fetchTasks(q));
  useEffect(() => { load(); }, [q, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof TaskQuery) => (e: React.ChangeEvent<HTMLSelectElement>) => setQ((p) => ({ ...p, [k]: e.target.value, page: 1 }));
  const totalPages = Math.max(1, Math.ceil(total / q.pageSize));
  const name = (id: string | null) => (id ? people.find((p) => p.id === id)?.full_name || people.find((p) => p.id === id)?.email || "Unknown" : "Unassigned");

  const changeStatus = async (t: Task, next: Task["status"]) => {
    const r = await dispatch(updateTaskStatus({ id: t.id, status: next, prev: t.status }));
    if (updateTaskStatus.rejected.match(r)) toast.error(`Could not update task: ${r.error.message}`);
    else toast.success("Task updated");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-7">
        <Input className="sm:col-span-3 lg:col-span-2" placeholder="Search by title..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <select className={selectCls} value={q.status} onChange={set("status")} aria-label="Status">
          <option value="">All statuses</option>{TASK_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select className={selectCls} value={q.priority} onChange={set("priority")} aria-label="Priority">
          <option value="">All priorities</option>{TASK_PRIORITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select className={selectCls} value={q.assignee} onChange={set("assignee")} aria-label="Assignee">
          <option value="">Anyone</option><option value="none">Unassigned</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
        </select>
        <select className={selectCls} value={q.due} onChange={set("due")} aria-label="Due date">
          <option value="">Any due date</option><option value="overdue">Overdue</option><option value="today">Due today</option>
          <option value="week">Next 7 days</option><option value="none">No due date</option>
        </select>
        <select className={selectCls} value={q.sort} onChange={set("sort")} aria-label="Sort">
          <option value="created_at:desc">Newest first</option><option value="created_at:asc">Oldest first</option>
          <option value="priority:desc">Priority high→low</option><option value="priority:asc">Priority low→high</option>
          <option value="due_date:asc">Due soonest</option><option value="due_date:desc">Due latest</option>
        </select>
      </div>

      {status === "loading" && items.length === 0 ? <Loading text="Loading tasks..." /> :
       status === "failed" ? <ErrorState text="Unable to load tasks. Please try again." onRetry={load} /> :
       items.length === 0 ? <Empty text="No tasks found." /> : (
        <div className="divide-y rounded-lg border bg-card">
          {items.map((t) => {
            const editable = canEdit(t);
            return (
              <div key={t.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-medium ${t.status === "COMPLETED" ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
                    <Pill value={t.priority} />
                    {isOverdue(t) && <Pill value="CRITICAL" text="Overdue" />}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {!projectId && <>{projects.find((p) => p.id === t.project_id)?.name ?? "Project"} · </>}
                    {name(t.assigned_to)} · {t.due_date ? `Due ${t.due_date}` : "No due date"}
                  </div>
                </div>
                <select className={`${selectCls} sm:w-36`} value={t.status} disabled={!editable} onChange={(e) => changeStatus(t, e.target.value as Task["status"])} aria-label="Task status">
                  {TASK_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                </select>
                {onEdit && <Button size="sm" variant="ghost" onClick={() => onEdit(t)}>Edit</Button>}
                {onDelete && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(t)}>Delete</Button>}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} records · Page {q.page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={q.page <= 1} onClick={() => setQ((p) => ({ ...p, page: p.page - 1 }))}>Previous</Button>
          <Button size="sm" variant="outline" disabled={q.page >= totalPages} onClick={() => setQ((p) => ({ ...p, page: p.page + 1 }))}>Next</Button>
        </div>
      </div>
    </div>
  );
}
