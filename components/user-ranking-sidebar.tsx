import { Users } from "lucide-react";
import type { UserRankingItem } from "@/lib/server/user-rankings";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CosmeticAvatar } from "@/components/cosmetics/cosmetic-avatar";
import { UserDisplayName } from "@/components/cosmetics/user-display-name";

interface UserRankingSidebarProps {
  users: UserRankingItem[];
}

const getMedalClassName = (index: number) => {
  if (index === 0) return "bg-chart-3 text-background";
  if (index === 1) return "bg-gray-400 text-background";
  if (index === 2) return "bg-amber-700 text-background";
  return "bg-secondary text-muted-foreground";
};

const getUserInitial = (name: string) => {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "U";
  return trimmed.charAt(0).toUpperCase();
};

export function UserRankingSidebar({ users }: UserRankingSidebarProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Top khán giả</h3>
      </div>

      {users.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu xếp hạng.
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user, index) => (
            <div
              key={user.userId}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/70"
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  getMedalClassName(index),
                )}
              >
                {user.rank}
              </div>

              <CosmeticAvatar
                src={user.image}
                alt={user.name}
                fallback={getUserInitial(user.name)}
                frameSrc={user.cosmetics.avatarFrameSrc}
                frameScale={user.cosmetics.avatarFrameScale}
                avatarClassName="h-9 w-9"
                fallbackClassName="text-xs"
              />

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <UserDisplayName
                    name={user.name}
                    cosmetics={user.cosmetics}
                    nameClassName="text-sm"
                  />
                  <Badge
                    variant="secondary"
                    className="h-5 shrink-0 px-1.5 text-[10px] font-medium"
                  >
                    Lv.{user.level}
                  </Badge>
                </div>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {user.description || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
