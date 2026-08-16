"use client";

import type { CommentFeedItem, CommentViewer } from "@/lib/actions/comment.actions";
import { COMMENT_MAX_DEPTH } from "@/lib/comments/limits";

export const COMMENTS_PAGE_SIZE = 10;

export const sortNewestFirst = (a: CommentFeedItem, b: CommentFeedItem) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export const sortOldestFirst = (a: CommentFeedItem, b: CommentFeedItem) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

export const normalizeComment = (comment: CommentFeedItem): CommentFeedItem => ({
  ...comment,
  id: String(comment.id),
  parentCommentId: comment.parentCommentId
    ? String(comment.parentCommentId)
    : null,
});

export const getViewerInitial = (viewer: CommentViewer) => {
  if (!viewer) return "U";
  const source = viewer.name || viewer.id || "U";
  return source.charAt(0).toUpperCase();
};

/** Top-level comments accept replies when max depth allows it. */
export const canReceiveReply = (comment: CommentFeedItem) =>
  COMMENT_MAX_DEPTH > 0 && !comment.parentCommentId;
