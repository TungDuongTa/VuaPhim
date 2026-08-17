import { cn } from "@/lib/utils";

export function chipClassName(selected: boolean) {
  return cn(
    "rounded-md border px-2.5 py-1 text-sm transition-colors",
    selected
      ? "border-primary bg-card font-medium text-primary"
      : "border-border bg-card text-muted-foreground hover:text-foreground",
  );
}
