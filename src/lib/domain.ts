import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type Profile = T["profiles"]["Row"];
export type Project = T["projects"]["Row"];
export type Task = T["tasks"]["Row"];
export type Member = T["project_members"]["Row"] & { profile?: Profile | null };
export type Notification = T["notifications"]["Row"];

export const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"] as const;
export const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const label = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** Overdue is derived, never stored: due date passed and not completed. */
export const isOverdue = (t: Pick<Task, "due_date" | "status">) =>
  !!t.due_date && t.status !== "COMPLETED" && t.due_date < todayISO();

const optDate = z.string().optional().or(z.literal("")).refine((v) => !v || !isNaN(Date.parse(v)), "Invalid date");

export const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72).regex(/[A-Za-z]/, "Include a letter").regex(/\d/, "Include a number"),
  full_name: z.string().trim().max(100).optional(),
});

export const projectSchema = z
  .object({
    name: z.string().trim().min(2, "Project name must be at least 2 characters").max(100),
    description: z.string().trim().max(2000),
    status: z.enum(PROJECT_STATUSES),
    priority: z.enum(PROJECT_PRIORITIES),
    start_date: optDate,
    due_date: optDate,
  })
  .refine((v) => !v.start_date || !v.due_date || v.due_date >= v.start_date, {
    message: "Due date must be on or after start date",
    path: ["due_date"],
  });
export type ProjectInput = z.infer<typeof projectSchema>;

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Task title must be at least 2 characters").max(200),
  description: z.string().trim().max(5000),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  assigned_to: z.string().optional(),
  due_date: optDate,
});
export type TaskInput = z.infer<typeof taskSchema>;

export const errMsg = (e: unknown) =>
  e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Something went wrong";
