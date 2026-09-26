import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Empty, ErrorState, Loading, Pill } from "@/components/states";
import { supabase } from "@/integrations/supabase/client";
import { useAppSelector } from "@/store";
import type { Profile } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users — Taskforge" }, { name: "description", content: "Admin view of all users." }, { property: "og:title", content: "Users — Taskforge" }, { property: "og:description", content: "Admin view of all users." }] }),
  component: UsersPage,
});

function UsersPage() {
  const isAdmin = useAppSelector((s) => s.auth.isAdmin);
  const [rows, setRows] = useState<(Profile & { admin: boolean })[] | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([supabase.from("profiles").select("*").order("created_at"), supabase.from("user_roles").select("user_id, role")]).then(([p, r]) => {
      if (p.error || r.error) return setErr(true);
      setRows((p.data ?? []).map((u) => ({ ...u, admin: !!r.data?.some((x) => x.user_id === u.id && x.role === "admin") })));
    });
  }, [isAdmin]);

  if (!isAdmin) return <ErrorState text="Only admins can view users." />;
  if (err) return <ErrorState text="Unable to load users." />;
  if (!rows) return <Loading text="Loading users..." />;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Users</h1>
      {rows.length === 0 ? <Empty text="No users." /> : (
        <div className="divide-y rounded-lg border bg-card">
          {rows.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 text-sm">
              <div><div className="font-medium">{u.full_name || "—"}</div><div className="text-muted-foreground">{u.email}</div></div>
              <div className="flex items-center gap-3"><Pill value={u.admin ? "COMPLETED" : "LOW"} text={u.admin ? "Admin" : "User"} /><span className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
