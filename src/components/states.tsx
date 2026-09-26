import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function Loading({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> {text}
    </div>
  );
}
export function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">{text}</div>;
}
export function ErrorState({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 py-8 text-center">
      <p className="text-destructive">{text}</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

const tone: Record<string, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-secondary text-secondary-foreground",
  HIGH: "bg-accent text-accent-foreground",
  CRITICAL: "bg-destructive text-destructive-foreground",
  COMPLETED: "bg-primary text-primary-foreground",
  ARCHIVED: "bg-muted text-muted-foreground",
};
export function Pill({ value, text }: { value: string; text?: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone[value] ?? "bg-secondary text-secondary-foreground"}`}>
      {text ?? value.replace(/_/g, " ")}
    </span>
  );
}

export const selectCls =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
