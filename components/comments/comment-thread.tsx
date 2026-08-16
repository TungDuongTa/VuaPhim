"use client";

import { CornerDownRight } from "lucide-react";
import type { CommentFeedItem } from "@/lib/actions/comment.actions";
import { Button } from "@/components/ui/button";
import { CommentReplyComposer } from "@/components/comments/comment-reply-composer";
import { CommentRow } from "@/components/comments/comment-row";
import { canReceiveReply } from "@/components/comments/comment-utils";

type CommentThreadProps = {
  root: CommentFeedItem;
  replies: CommentFeedItem[];
  isExpanded: boolean;
  activeReplyId: string | null;
  replyDrafts: Record<string, string>;
  submittingReplyTo: string | null;
  likingCommentIds: Set<string>;
  onToggleExpanded: (expanded: boolean) => void;
  onStartReply: (comment: CommentFeedItem) => void;
  onCancelReply: () => void;
  onReplyDraftChange: (commentId: string, value: string) => void;
  onReplySubmit: (comment: CommentFeedItem) => void;
  onLike: (comment: CommentFeedItem) => void;
};

export function CommentThread({
  root,
  replies,
  isExpanded,
  activeReplyId,
  replyDrafts,
  submittingReplyTo,
  likingCommentIds,
  onToggleExpanded,
  onStartReply,
  onCancelReply,
  onReplyDraftChange,
  onReplySubmit,
  onLike,
}: CommentThreadProps) {
  const totalReplies = replies.length;

  return (
    <article className="rounded-xl border border-border/70 bg-secondary/35 p-4">
      <CommentRow
        comment={root}
        canReply={canReceiveReply(root)}
        isLiking={likingCommentIds.has(root.id)}
        onLike={() => onLike(root)}
        onReply={() => onStartReply(root)}
      />

      {activeReplyId === root.id && (
        <CommentReplyComposer
          userName={root.userName}
          value={replyDrafts[root.id] || ""}
          isSubmitting={submittingReplyTo === root.id}
          onChange={(value) => onReplyDraftChange(root.id, value)}
          onCancel={onCancelReply}
          onSubmit={() => onReplySubmit(root)}
        />
      )}

      {totalReplies > 0 && (
        <div className="ml-11 mt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-primary hover:text-primary"
            onClick={() => onToggleExpanded(!isExpanded)}
          >
            <CornerDownRight className="mr-1 h-3.5 w-3.5" />
            {isExpanded
              ? "Ẩn bớt bình luận"
              : `Xem thêm ${totalReplies} bình luận`}
          </Button>
        </div>
      )}

      {isExpanded && totalReplies > 0 && (
        <div className="relative ml-11 mt-2 space-y-2 pl-4">
          <span className="absolute bottom-0 left-0 top-0 w-px bg-border/60" />
          {replies.map((reply) => (
            <div key={reply.id} className="relative">
              <span className="absolute -left-4 top-4 h-px w-4 bg-border/60" />
              <CommentRow
                comment={reply}
                nested
                canReply={false}
                isLiking={likingCommentIds.has(reply.id)}
                onLike={() => onLike(reply)}
                onReply={() => onStartReply(reply)}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
