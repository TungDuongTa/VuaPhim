import Link from "next/link";
import { MessageCircle, ThumbsUp } from "lucide-react";
import type { HomeRecentCommentItem } from "@/lib/actions/comment.actions";
import { Badge } from "@/components/ui/badge";
import { RelativeTime } from "@/components/relative-time";
import { CosmeticAvatar } from "@/components/cosmetics/cosmetic-avatar";
import { UserDisplayName } from "@/components/cosmetics/user-display-name";

interface CommentsSectionProps {
  comments: HomeRecentCommentItem[];
}

const getUserInitial = (name: string) => {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "U";
  return trimmed.charAt(0).toUpperCase();
};

const formatEpisodeLabel = (episodeName: string | null) => episodeName;

export function CommentsSection({ comments }: CommentsSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <header className="mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">
          Bình luận mới nhất
        </h3>
      </header>

      {comments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-6 text-center text-sm text-muted-foreground">
          Chưa có bình luận nào
        </p>
      ) : (
        <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const episodeLabel = formatEpisodeLabel(comment.episodeName);

            return (
              <article
                key={comment.id}
                className="rounded-lg border border-border/60 bg-secondary/40 p-3"
              >
                <div className="flex items-start gap-3">
                  <CosmeticAvatar
                    src={comment.userImage}
                    alt={comment.userName}
                    fallback={getUserInitial(comment.userName)}
                    frameSrc={comment.cosmetics.avatarFrameSrc}
                    frameScale={comment.cosmetics.avatarFrameScale}
                    avatarClassName="h-9 w-9"
                    fallbackClassName="text-xs"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <UserDisplayName
                          name={comment.userName}
                          cosmetics={comment.cosmetics}
                          nameClassName="text-sm"
                        />
                        <Badge
                          variant="secondary"
                          className="h-5 shrink-0 px-1.5 text-[10px] font-medium"
                        >
                          Lv.{comment.userLevel}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <Link
                        href={`/phim/${comment.movieSlug}`}
                        className="truncate font-medium text-primary hover:underline"
                      >
                        {comment.movieName}
                      </Link>
                      {episodeLabel && (
                        <Link
                          href={`/phim/${comment.movieSlug}/tap/${encodeURIComponent(comment.episodeName || "")}`}
                          className="truncate font-medium text-rose-500 hover:text-rose-400 dark:text-rose-300 dark:hover:text-rose-200"
                        >
                          - {episodeLabel}
                        </Link>
                      )}
                    </div>

                    <p className="wrap-break-words text-sm text-muted-foreground">
                      {comment.content}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{comment.likeCount}</span>
                      </div>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        <RelativeTime value={comment.createdAt} />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
