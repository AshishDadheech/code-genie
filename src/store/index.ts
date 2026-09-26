import { configureStore, createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { supabase } from "@/integrations/supabase/client";
import { errMsg, todayISO, type Member, type Notification, type Profile, type Project, type Task } from "@/lib/domain";

type Status = "idle" | "loading" | "succeeded" | "failed";

/* ---------------- auth ---------------- */
export const loadCurrentUser = createAsyncThunk("auth/load", async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", data.user.id),
  ]);
  return {
    profile: (profile ?? { id: data.user.id, email: data.user.email ?? "", full_name: "", created_at: "" }) as Profile,
    isAdmin: !!roles?.some((r) => r.role === "admin"),
  };
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null as Profile | null, isAdmin: false, status: "idle" as Status },
  reducers: { signedOut: (s) => { s.user = null; s.isAdmin = false; s.status = "idle"; } },
  extraReducers: (b) => {
    b.addCase(loadCurrentUser.pending, (s) => { s.status = "loading"; });
    b.addCase(loadCurrentUser.fulfilled, (s, a) => {
      s.status = "succeeded"; s.user = a.payload?.profile ?? null; s.isAdmin = a.payload?.isAdmin ?? false;
    });
    b.addCase(loadCurrentUser.rejected, (s) => { s.status = "failed"; });
  },
});

/* ---------------- projects ---------------- */
export const fetchProjects = createAsyncThunk("projects/fetch", async () => {
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Project[];
});
export const fetchMembers = createAsyncThunk("projects/members", async (projectId: string) => {
  const { data, error } = await supabase.from("project_members").select("*, profile:profiles(*)").eq("project_id", projectId);
  if (error) throw new Error(error.message);
  return { projectId, members: data as Member[] };
});

const projectsSlice = createSlice({
  name: "projects",
  initialState: { items: [] as Project[], status: "idle" as Status, error: null as string | null, members: {} as Record<string, Member[]> },
  reducers: {
    upsertProject: (s, a: PayloadAction<Project>) => {
      const i = s.items.findIndex((p) => p.id === a.payload.id);
      if (i >= 0) s.items[i] = a.payload; else s.items.unshift(a.payload);
    },
    removeProject: (s, a: PayloadAction<string>) => { s.items = s.items.filter((p) => p.id !== a.payload); },
  },
  extraReducers: (b) => {
    b.addCase(fetchProjects.pending, (s) => { s.status = "loading"; s.error = null; });
    b.addCase(fetchProjects.fulfilled, (s, a) => { s.status = "succeeded"; s.items = a.payload; });
    b.addCase(fetchProjects.rejected, (s, a) => { s.status = "failed"; s.error = a.error.message ?? "Failed"; });
    b.addCase(fetchMembers.fulfilled, (s, a) => { s.members[a.payload.projectId] = a.payload.members; });
  },
});

/* ---------------- tasks ---------------- */
export type TaskQuery = {
  projectId?: string; search: string; status: string; priority: string; assignee: string;
  due: string; sort: string; page: number; pageSize: number;
};
export const fetchTasks = createAsyncThunk("tasks/fetch", async (q: TaskQuery) => {
  let query = supabase.from("tasks").select("*", { count: "exact" });
  if (q.projectId) query = query.eq("project_id", q.projectId);
  if (q.search) query = query.ilike("title", `%${q.search}%`);
  if (q.status) query = query.eq("status", q.status as Task["status"]);
  if (q.priority) query = query.eq("priority", q.priority as Task["priority"]);
  if (q.assignee === "none") query = query.is("assigned_to", null);
  else if (q.assignee) query = query.eq("assigned_to", q.assignee);
  const today = todayISO();
  if (q.due === "overdue") query = query.lt("due_date", today).neq("status", "COMPLETED");
  else if (q.due === "today") query = query.eq("due_date", today);
  else if (q.due === "week") {
    const w = new Date(); w.setDate(w.getDate() + 7);
    query = query.gte("due_date", today).lte("due_date", w.toISOString().slice(0, 10));
  } else if (q.due === "none") query = query.is("due_date", null);
  const [col, dir] = (q.sort || "created_at:desc").split(":");
  query = query.order(col === "priority" ? "priority_rank" : col, { ascending: dir === "asc", nullsFirst: false });
  const from = (q.page - 1) * q.pageSize;
  const { data, error, count } = await query.range(from, from + q.pageSize - 1);
  if (error) throw new Error(error.message);
  return { items: data as Task[], total: count ?? 0 };
});

/** Optimistic: reducer applies the change on pending and rolls back on rejected. */
export const updateTaskStatus = createAsyncThunk(
  "tasks/updateStatus",
  async (arg: { id: string; status: Task["status"]; prev: Task["status"] }) => {
    const { data, error } = await supabase.from("tasks").update({ status: arg.status }).eq("id", arg.id).select().maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("You are not allowed to update this task");
    return data as Task;
  },
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState: { items: [] as Task[], total: 0, status: "idle" as Status, error: null as string | null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTasks.pending, (s) => { s.status = "loading"; s.error = null; });
    b.addCase(fetchTasks.fulfilled, (s, a) => { s.status = "succeeded"; s.items = a.payload.items; s.total = a.payload.total; });
    b.addCase(fetchTasks.rejected, (s, a) => { s.status = "failed"; s.error = a.error.message ?? "Failed"; });
    b.addCase(updateTaskStatus.pending, (s, a) => {
      const t = s.items.find((x) => x.id === a.meta.arg.id); if (t) t.status = a.meta.arg.status;
    });
    b.addCase(updateTaskStatus.rejected, (s, a) => {
      const t = s.items.find((x) => x.id === a.meta.arg.id); if (t) t.status = a.meta.arg.prev;
    });
    b.addCase(updateTaskStatus.fulfilled, (s, a) => {
      const i = s.items.findIndex((x) => x.id === a.payload.id); if (i >= 0) s.items[i] = a.payload;
    });
  },
});

/* ---------------- notifications ---------------- */
export const fetchNotifications = createAsyncThunk("notifications/fetch", async () => {
  await supabase.rpc("generate_due_notifications");
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data as Notification[];
});
export const markRead = createAsyncThunk("notifications/read", async (id: string) => {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) throw new Error(error.message);
  return id;
});
export const markAllRead = createAsyncThunk("notifications/readAll", async (userId: string) => {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  if (error) throw new Error(errMsg(error));
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { items: [] as Notification[], status: "idle" as Status },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchNotifications.pending, (s) => { s.status = "loading"; });
    b.addCase(fetchNotifications.fulfilled, (s, a) => { s.status = "succeeded"; s.items = a.payload; });
    b.addCase(fetchNotifications.rejected, (s) => { s.status = "failed"; });
    b.addCase(markRead.fulfilled, (s, a) => { const n = s.items.find((x) => x.id === a.payload); if (n) n.is_read = true; });
    b.addCase(markAllRead.fulfilled, (s) => { s.items.forEach((n) => { n.is_read = true; }); });
  },
});

export const { signedOut } = authSlice.actions;
export const { upsertProject, removeProject } = projectsSlice.actions;

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authSlice.reducer,
      projects: projectsSlice.reducer,
      tasks: tasksSlice.reducer,
      notifications: notificationsSlice.reducer,
    },
  });
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
