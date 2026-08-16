import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginWall({
  icon: Icon,
  description,
  callbackUrl,
}: {
  icon: LucideIcon;
  description: string;
  callbackUrl?: string;
}) {
  const href = callbackUrl
    ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/sign-in";

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <Icon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Vui lòng đăng nhập
          </h1>
          <p className="mb-6 text-muted-foreground">{description}</p>
          <Link href={href}>
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
