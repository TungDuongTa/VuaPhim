"use client";

import { CornerDownRight, ThumbsUp } from "lucide-react";
import type { CommentFeedItem } from "@/lib/actions/comment.actions";
import { formatRelativeTime } from "@/lib/date-time";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CosmeticAvatar } from "@/components/cosmetics/cosmetic-avatar";
import { UserDisplayName } from "@/components/cosmetics/user-display-name";

type CommentRowProps = {
  comment: CommentFeedItem;
  nested?: boolean;
  canReply: boolean;
  isLiking: boolean;
  onLike: () => void;
  onReply: () => void;
};

export function CommentRow({
  comment,
  nested = false,
  canReply,
  isLiking,
  onLike,
  onReply,
}: CommentRowProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        nested && "rounded-lg border border-border/55 bg-background/30 p-3",
      )}
    >
      <CosmeticAvatar
        src={comment.userImage}
        alt={comment.userName}
        fallback={comment.userName.charAt(0).toUpperCase()}
        frameSrc={comment.cosmetics.avatarFrameSrc}
        frameScale={comment.cosmetics.avatarFrameScale}
        avatarClassName={nested ? "h-8 w-8" : "h-9 w-9"}
        fallbackClassName={nested ? "text-xs" : undefined}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <UserDisplayName
            name={comment.userName}
            cosmetics={comment.cosmetics}
            nameClassName="text-sm"
          />
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
            Lv.{comment.userLevel}
          </Badge>
          {comment.episodeName && (
            <Badge
              variant="secondary"
              className="bg-primary/15 text-primary hover:bg-primary/15"
            >
              {comment.episodeName}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/95">
          {comment.content}
        </p>

        <div className="mt-1.5 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1.5 px-2 text-xs",
              comment.likedByViewer && "text-primary",
            )}
            disabled={isLiking}
            onClick={onLike}
          >
            <ThumbsUp
              className={cn(
                "h-3.5 w-3.5",
                comment.likedByViewer && "fill-current",
              )}
            />
            {comment.likeCount}
          </Button>
          {canReply ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={onReply}
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              Trả lời
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
