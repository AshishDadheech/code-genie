import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { selectCls } from "@/components/states";
import {
  label, PROJECT_PRIORITIES, PROJECT_STATUSES, projectSchema, TASK_PRIORITIES, TASK_STATUSES, taskSchema,
  type Profile, type ProjectInput, type TaskInput,
} from "@/lib/domain";

const Err = ({ m }: { m?: string | undefined }) => (m ? <p className="text-xs text-destructive">{m}</p> : null);

export function ProjectDialog({ open, onOpenChange, initial, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; initial?: Partial<ProjectInput> | undefined; onSubmit: (v: ProjectInput) => Promise<void>;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    values: { name: "", description: "", status: "PLANNING", priority: "MEDIUM", start_date: "", due_date: "", ...initial } as ProjectInput,
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial?.name ? "Edit project" : "New project"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="space-y-1"><Label>Project name</Label><Input {...register("name")} /><Err m={errors.name?.message} /></div>
          <div className="space-y-1"><Label>Description</Label><Textarea rows={3} {...register("description")} /><Err m={errors.description?.message} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Status</Label><select className={selectCls} {...register("status")}>{PROJECT_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></div>
            <div className="space-y-1"><Label>Priority</Label><select className={selectCls} {...register("priority")}>{PROJECT_PRIORITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></div>
            <div className="space-y-1"><Label>Start date</Label><Input type="date" {...register("start_date")} /><Err m={errors.start_date?.message} /></div>
            <div className="space-y-1"><Label>Due date</Label><Input type="date" {...register("due_date")} /><Err m={errors.due_date?.message} /></div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save project"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TaskDialog({ open, onOpenChange, initial, people, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; initial?: Partial<TaskInput> | undefined; people: Profile[]; onSubmit: (v: TaskInput) => Promise<void>;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    values: { title: "", description: "", status: "TODO", priority: "MEDIUM", assigned_to: "", due_date: "", ...initial } as TaskInput,
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial?.title ? "Edit task" : "New task"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="space-y-1"><Label>Task title</Label><Input {...register("title")} /><Err m={errors.title?.message} /></div>
          <div className="space-y-1"><Label>Description</Label><Textarea rows={3} {...register("description")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Status</Label><select className={selectCls} {...register("status")}>{TASK_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></div>
            <div className="space-y-1"><Label>Priority</Label><select className={selectCls} {...register("priority")}>{TASK_PRIORITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></div>
            <div className="space-y-1"><Label>Assign to</Label>
              <select className={selectCls} {...register("assigned_to")}><option value="">Unassigned</option>{people.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}</select>
            </div>
            <div className="space-y-1"><Label>Due date</Label><Input type="date" {...register("due_date")} /><Err m={errors.due_date?.message} /></div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save task"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
