import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { authSchema } from "@/lib/domain";
import type { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Taskforge" },
      { name: "description", content: "Sign in or create your Taskforge account." },
      { property: "og:title", content: "Sign in — Taskforge" },
      { property: "og:description", content: "Sign in or create your Taskforge account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof authSchema>>({ resolver: zodResolver(authSchema) });

  const onSubmit = handleSubmit(async (v) => {
    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: v.email, password: v.password,
        options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: v.full_name ?? "" } },
      });
      if (error) { toast.error(error.message); return; }
      if (!data.session) { toast.success("Check your email to confirm your account."); setMode("login"); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
      if (error) { toast.error(error.message); return; }
    }
    navigate({ to: "/dashboard" });
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-sm" noValidate>
        <div>
          <h1 className="font-display text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="text-sm text-muted-foreground">Taskforge project & task manager</p>
        </div>
        {mode === "register" && (
          <div className="space-y-1"><Label htmlFor="full_name">Full name</Label><Input id="full_name" {...register("full_name")} /></div>
        )}
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label><Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label><Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Register"}
        </Button>
        <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "No account? Register" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
