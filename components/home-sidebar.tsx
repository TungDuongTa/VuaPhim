import { RankingSidebarApi } from "@/components/ranking-sidebar-api";
import { UserRankingSidebar } from "@/components/user-ranking-sidebar";
import { CommentsSection } from "@/components/comments-section";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCachedMovieRankings,
  getCachedRecentHomeComments,
  getCachedUserRankings,
} from "@/lib/server/movie-cache";

export function HomeSidebarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function HomeSidebar() {
  const [rankings, userRankings, comments] = await Promise.all([
    getCachedMovieRankings(10),
    getCachedUserRankings(10),
    getCachedRecentHomeComments(10),
  ]);

  return (
    <div className="space-y-6">
      <RankingSidebarApi initialRankings={rankings} />
      <CommentsSection comments={comments} />
      <UserRankingSidebar users={userRankings} />
    </div>
  );
}
