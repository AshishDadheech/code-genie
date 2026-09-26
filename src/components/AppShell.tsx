import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, FolderKanban, LayoutDashboard, ListChecks, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchNotifications, fetchProjects, signedOut, useAppDispatch, useAppSelector } from "@/store";

export function AppShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAdmin } = useAppSelector((s) => s.auth);
  const unread = useAppSelector((s) => s.notifications.items.filter((n) => !n.is_read).length);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const signOut = async () => {
    await supabase.auth.signOut();
    dispatch(signedOut());
    navigate({ to: "/auth", replace: true });
  };

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/tasks", label: "Tasks", icon: ListChecks },
    ...(isAdmin ? [{ to: "/users", label: "Users", icon: Users }] : []),
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link to="/dashboard" className="font-display text-lg font-bold text-primary">Taskforge</Link>
          <nav className="flex flex-1 gap-1 overflow-x-auto">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted" activeProps={{ className: "bg-muted !text-foreground font-medium" }}>
                <n.icon className="h-4 w-4" /><span className="hidden sm:inline">{n.label}</span>
              </Link>
            ))}
          </nav>
          <Link to="/notifications" className="relative rounded-md p-2 hover:bg-muted" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{unread}</span>}
          </Link>
          <div className="hidden text-right text-xs md:block">
            <div className="font-medium">{user?.full_name || user?.email}</div>
            <div className="text-muted-foreground">{isAdmin ? "Admin" : "User"}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6"><Outlet /></main>
    </div>
  );
}
