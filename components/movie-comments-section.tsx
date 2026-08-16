"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import {
  createComment,
  getEpisodeComments,
  getMovieComments,
  toggleCommentLike,
  type CommentFeedItem,
  type CommentFeedPagination,
  type CommentViewer,
} from "@/lib/actions/comment.actions";
import { COMMENT_MAX_DEPTH } from "@/lib/comments/limits";
import { getVisiblePages } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentComposer } from "@/components/comments/comment-composer";
import { CommentThread } from "@/components/comments/comment-thread";
import {
  COMMENTS_PAGE_SIZE,
  canReceiveReply,
  normalizeComment,
  sortNewestFirst,
  sortOldestFirst,
} from "@/components/comments/comment-utils";

type MovieCommentsSectionProps = {
  movieSlug: string;
  movieName: string;
  episodeName?: string;
  className?: string;
};

const EMPTY_PAGINATION: CommentFeedPagination = {
  page: 1,
  pageSize: COMMENTS_PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export function MovieCommentsSection({
  movieSlug,
  movieName,
  episodeName,
  className,
}: MovieCommentsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewer, setViewer] = useState<CommentViewer>(null);
  const [comments, setComments] = useState<CommentFeedItem[]>([]);
  const [pagination, setPagination] =
    useState<CommentFeedPagination>(EMPTY_PAGINATION);
  const [currentPage, setCurrentPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingReplyTo, setSubmittingReplyTo] = useState<string | null>(
    null,
  );
  const [likingCommentIds, setLikingCommentIds] = useState<Set<string>>(
    new Set(),
  );
  const submittingRootRef = useRef(false);
  const submittingReplyIdRef = useRef<string | null>(null);
  const commentsRef = useRef(comments);
  commentsRef.current = comments;

  const isEpisodeScope = Boolean(episodeName);
  const normalizedComicName = movieName?.trim() || "";
  const searchParamString = searchParams.toString();
  const signInHref = useMemo(() => {
    const callbackPath = pathname || "/";
    const callbackUrl = searchParamString
      ? `${callbackPath}?${searchParamString}`
      : callbackPath;

    return `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }, [pathname, searchParamString]);
  const redirectToSignIn = useCallback(() => {
    router.push(signInHref);
  }, [router, signInHref]);

  const scopeMeta = useMemo(
    () =>
      isEpisodeScope
        ? {
            title: `Bình luận về tập ${episodeName}`,
            subtitle: "Chỉ có bình luận của tập này được hiển thị tại đây.",
          }
        : {
            title: "Bình luận",
            subtitle: "Tất cả bình luận của phim đều được hiển thị tại đây",
          },
    [episodeName, isEpisodeScope],
  );

  const childrenByParentId = useMemo(() => {
    const map = new Map<string, CommentFeedItem[]>();
    for (const comment of comments) {
      if (!comment.parentCommentId) continue;
      const current = map.get(comment.parentCommentId) || [];
      current.push(comment);
      map.set(comment.parentCommentId, current);
    }

    for (const [key, value] of map.entries()) {
      map.set(key, value.sort(sortOldestFirst));
    }

    return map;
  }, [comments]);

  const rootComments = useMemo(
    () =>
      comments
        .filter((comment) => !comment.parentCommentId)
        .sort(sortNewestFirst),
    [comments],
  );

  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, pagination.totalPages, 5),
    [currentPage, pagination.totalPages],
  );

  const loadComments = useCallback(
    async (requestedPage: number) => {
      if (!movieSlug) {
        setComments([]);
        setViewer(null);
        setPagination(EMPTY_PAGINATION);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const feedData =
          isEpisodeScope && episodeName
            ? await getEpisodeComments(
                movieSlug,
                episodeName,
                requestedPage,
                COMMENTS_PAGE_SIZE,
              )
            : await getMovieComments(
                movieSlug,
                requestedPage,
                COMMENTS_PAGE_SIZE,
              );

        setViewer(feedData.viewer);
        setComments(feedData.comments.map(normalizeComment));
        setPagination(feedData.pagination);
        if (feedData.pagination.page !== requestedPage) {
          setCurrentPage(feedData.pagination.page);
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
        toast.error("Could not load comments right now.");
      } finally {
        setIsLoading(false);
      }
    },
    [episodeName, movieSlug, isEpisodeScope],
  );

  useEffect(() => {
    setCurrentPage(1);
    setExpandedThreads(new Set());
    setActiveReplyId(null);
    setReplyDrafts({});
  }, [episodeName, movieSlug, isEpisodeScope]);

  useEffect(() => {
    loadComments(currentPage);
  }, [currentPage, loadComments]);

  const setThreadExpanded = (rootId: string, expanded: boolean) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (expanded) next.add(rootId);
      else next.delete(rootId);
      return next;
    });
  };

  const handleStartReply = (comment: CommentFeedItem) => {
    if (!viewer) {
      toast.error("Vui lòng đăng nhập để trả lời bình luận.");
      redirectToSignIn();
      return;
    }

    if (!canReceiveReply(comment)) {
      toast.error(`Chỉ được trả lời tối đa ${COMMENT_MAX_DEPTH} cấp.`);
      return;
    }

    setActiveReplyId(comment.id);
    setThreadExpanded(comment.id, true);
  };

  const upsertComment = (comment: CommentFeedItem) => {
    setComments((prev) => {
      if (prev.some((item) => item.id === comment.id)) return prev;
      return [comment, ...prev];
    });
  };

  const handleSubmitRootComment = async () => {
    if (submittingRootRef.current || isSubmitting) return;

    const content = newComment.trim();
    if (!content) {
      toast.error("Please enter a comment before posting.");
      return;
    }

    if (!viewer) {
      toast.error("Vui lòng đăng nhập để bình luận.");
      redirectToSignIn();
      return;
    }

    submittingRootRef.current = true;
    setIsSubmitting(true);
    setNewComment("");

    try {
      const result = await createComment({
        movieSlug,
        movieName: normalizedComicName || undefined,
        content,
        targetType: isEpisodeScope ? "episode" : "movie",
        episodeName: episodeName || undefined,
      });

      if (!result.success) {
        setNewComment(content);
        toast.error(result.message);
        if (result.requiresSignIn) redirectToSignIn();
        return;
      }

      toast.success(result.message);

      if (result.comment) {
        const normalized = normalizeComment(result.comment as CommentFeedItem);
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          const alreadyVisible = commentsRef.current.some(
            (item) => item.id === normalized.id,
          );
          upsertComment(normalized);
          if (!alreadyVisible) {
            setPagination((prev) => {
              const totalItems = prev.totalItems + 1;
              const totalPages = Math.max(
                1,
                Math.ceil(totalItems / prev.pageSize),
              );
              return {
                ...prev,
                totalItems,
                totalPages,
                hasNextPage: 1 < totalPages,
                hasPrevPage: false,
              };
            });
          }
        }
      } else if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        void loadComments(1);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      setNewComment(content);
      toast.error("Could not post your comment. Please try again.");
    } finally {
      submittingRootRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (targetComment: CommentFeedItem) => {
    if (submittingReplyIdRef.current) return;

    if (!viewer) {
      toast.error("Vui lòng đăng nhập để trả lời bình luận.");
      redirectToSignIn();
      return;
    }

    if (!canReceiveReply(targetComment)) {
      toast.error(`Chỉ được trả lời tối đa ${COMMENT_MAX_DEPTH} cấp.`);
      return;
    }

    const draft = (replyDrafts[targetComment.id] || "").trim();
    if (!draft) {
      toast.error("Hãy điền bình luận trước khi đăng");
      return;
    }

    submittingReplyIdRef.current = targetComment.id;
    setSubmittingReplyTo(targetComment.id);
    setReplyDrafts((prev) => ({ ...prev, [targetComment.id]: "" }));

    try {
      const result = await createComment({
        movieSlug,
        movieName: normalizedComicName || undefined,
        content: draft,
        parentCommentId: targetComment.id,
      });

      if (!result.success) {
        setReplyDrafts((prev) => ({ ...prev, [targetComment.id]: draft }));
        toast.error(result.message);
        if (result.requiresSignIn) redirectToSignIn();
        return;
      }

      setActiveReplyId(null);
      setThreadExpanded(targetComment.id, true);

      if (result.comment) {
        const normalizedReply = normalizeComment(
          result.comment as CommentFeedItem,
        );
        const safeReply = normalizedReply.parentCommentId
          ? normalizedReply
          : { ...normalizedReply, parentCommentId: targetComment.id };
        setComments((prev) => {
          if (prev.some((item) => item.id === safeReply.id)) return prev;
          return [...prev, safeReply];
        });
      } else {
        void loadComments(currentPage);
      }
      toast.success(result.message);
    } catch (error) {
      console.error("Failed to reply to comment:", error);
      setReplyDrafts((prev) => ({ ...prev, [targetComment.id]: draft }));
      toast.error("Could not post your reply. Please try again.");
    } finally {
      submittingReplyIdRef.current = null;
      setSubmittingReplyTo(null);
    }
  };

  const handleToggleLike = async (comment: CommentFeedItem) => {
    if (!viewer) {
      toast.error("Vui lòng đăng nhập để thích bình luận.");
      redirectToSignIn();
      return;
    }

    if (likingCommentIds.has(comment.id)) return;

    const optimisticLiked = !comment.likedByViewer;
    const optimisticLikeCount = Math.max(
      0,
      comment.likeCount + (optimisticLiked ? 1 : -1),
    );

    setLikingCommentIds((prev) => new Set(prev).add(comment.id));
    setComments((prev) =>
      prev.map((item) =>
        item.id === comment.id
          ? {
              ...item,
              likedByViewer: optimisticLiked,
              likeCount: optimisticLikeCount,
            }
          : item,
      ),
    );

    try {
      const result = await toggleCommentLike(comment.id);
      if (!result.success) {
        setComments((prev) =>
          prev.map((item) =>
            item.id === comment.id
              ? {
                  ...item,
                  likedByViewer: comment.likedByViewer,
                  likeCount: comment.likeCount,
                }
              : item,
          ),
        );
        toast.error(result.message);
        if (result.requiresSignIn) redirectToSignIn();
        return;
      }

      setComments((prev) =>
        prev.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                likedByViewer:
                  typeof result.liked === "boolean"
                    ? result.liked
                    : item.likedByViewer,
                likeCount:
                  typeof result.likeCount === "number"
                    ? result.likeCount
                    : item.likeCount,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
      setComments((prev) =>
        prev.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                likedByViewer: comment.likedByViewer,
                likeCount: comment.likeCount,
              }
            : item,
        ),
      );
      toast.error("Could not update like right now.");
    } finally {
      setLikingCommentIds((prev) => {
        const next = new Set(prev);
        next.delete(comment.id);
        return next;
      });
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    if (nextPage === currentPage) return;
    setExpandedThreads(new Set());
    setActiveReplyId(null);
    setReplyDrafts({});
    setCurrentPage(nextPage);
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-gradient-to-b from-card via-card to-secondary/45 p-4 shadow-lg shadow-black/15 md:p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <MessageSquareText className="h-5 w-5 text-primary" />
            {scopeMeta.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {scopeMeta.subtitle}
          </p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary">
          {pagination.totalItems} bình luận
        </Badge>
      </div>

      <div className="rounded-xl border border-primary/25 bg-background/45 p-3 md:p-4">
        <CommentComposer
          viewer={viewer}
          signInHref={signInHref}
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleSubmitRootComment}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-border/70 bg-background/25 py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : rootComments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-background/25 py-10 text-center text-sm text-muted-foreground">
            Chưa có bình luận nào
          </div>
        ) : (
          <div className="space-y-4">
            {rootComments.map((parent) => (
              <CommentThread
                key={parent.id}
                root={parent}
                replies={childrenByParentId.get(parent.id) || []}
                isExpanded={expandedThreads.has(parent.id)}
                activeReplyId={activeReplyId}
                replyDrafts={replyDrafts}
                submittingReplyTo={submittingReplyTo}
                likingCommentIds={likingCommentIds}
                onToggleExpanded={(expanded) =>
                  setThreadExpanded(parent.id, expanded)
                }
                onStartReply={handleStartReply}
                onCancelReply={() => setActiveReplyId(null)}
                onReplyDraftChange={(commentId, value) =>
                  setReplyDrafts((prev) => ({ ...prev, [commentId]: value }))
                }
                onReplySubmit={handleReplySubmit}
                onLike={handleToggleLike}
              />
            ))}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
          <p className="text-xs text-muted-foreground">
            Trang {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-1">
              {visiblePages.map((pageNum) => (
                <Button
                  key={pageNum}
                  type="button"
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="icon"
                  disabled={isLoading}
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

