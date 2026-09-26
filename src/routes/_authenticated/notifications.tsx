import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Empty, ErrorState, Loading } from "@/components/states";
import { fetchNotifications, markAllRead, markRead, useAppDispatch, useAppSelector } from "@/store";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Taskforge" }, { name: "description", content: "Your notifications." }, { property: "og:title", content: "Notifications — Taskforge" }, { property: "og:description", content: "Your notifications." }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((s) => s.notifications);
  const user = useAppSelector((s) => s.auth.user);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        <Button variant="outline" disabled={!items.some((n) => !n.is_read) || !user} onClick={() => dispatch(markAllRead(user!.id))}>Mark all as read</Button>
      </div>
      {status === "loading" && items.length === 0 ? <Loading text="Loading notifications..." /> :
       status === "failed" ? <ErrorState text="Unable to load notifications." onRetry={() => dispatch(fetchNotifications())} /> :
       items.length === 0 ? <Empty text="No notifications yet." /> : (
        <div className="divide-y rounded-lg border bg-card">
          {items.map((n) => (
            <div key={n.id} className={`flex items-center justify-between gap-3 p-3 text-sm ${n.is_read ? "text-muted-foreground" : "font-medium"}`}>
              <div className="flex items-center gap-2">
                {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                {n.link ? <a href={n.link} className="hover:underline">{n.message}</a> : n.message}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span>{new Date(n.created_at).toLocaleString()}</span>
                {!n.is_read && <Button size="sm" variant="ghost" onClick={() => dispatch(markRead(n.id))}>Mark read</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
