"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { CommentLikeModel } from "@/database/models/comment-like.model";
import { CommentModel } from "@/database/models/comment.model";
import {
  COMMENT_CREATE_HOURLY_RATE,
  COMMENT_CREATE_RATE,
  COMMENT_DUPLICATE_WINDOW_MS,
  COMMENT_LIKE_RATE,
  COMMENT_MAX_DEPTH,
  COMMENT_MAX_LENGTH,
} from "@/lib/comments/limits";
import { EMPTY_COSMETICS_PUBLIC } from "@/lib/cosmetics/types";
import type { UserCosmeticsPublic } from "@/lib/cosmetics/types";
import { normalizePageAndSize } from "@/lib/pagination";
import { getUserCosmeticsMap } from "@/lib/server/user-cosmetics";
import { getUserLevelMap } from "@/lib/server/user-level";
import { getSessionUser } from "@/lib/server/session";

export type CommentViewer = {
  id: string;
  name: string;
  image: string;
  level: number;
  cosmetics: UserCosmeticsPublic;
} | null;

export type CommentFeedItem = {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  movieSlug: string;
  targetType: "movie" | "episode";
  episodeName: string | null;
  parentCommentId: string | null;
  userLevel: number;
  cosmetics: UserCosmeticsPublic;
  likeCount: number;
  likedByViewer: boolean;
  createdAt: string;
};

export type CommentFeedPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CommentFeedResponse = {
  viewer: CommentViewer;
  comments: CommentFeedItem[];
  pagination: CommentFeedPagination;
};

export type HomeRecentCommentItem = {
  id: string;
  userName: string;
  userImage: string;
  userLevel: number;
  cosmetics: UserCosmeticsPublic;
  content: string;
  movieSlug: string;
  movieName: string;
  episodeName: string | null;
  likeCount: number;
  createdAt: string;
};

type CreateCommentInput = {
  movieSlug: string;
  movieName?: string;
  content: string;
  targetType?: "movie" | "episode";
  episodeName?: string;
  parentCommentId?: string;
};

type CreateCommentResult = {
  success: boolean;
  message: string;
  requiresSignIn?: boolean;
  comment?: CommentFeedItem;
};

type ToggleCommentLikeResult = {
  success: boolean;
  message: string;
  requiresSignIn?: boolean;
  liked?: boolean;
  likeCount?: number;
};

const DEFAULT_RECENT_HOME_COMMENT_LIMIT = 10;
const MAX_RECENT_HOME_COMMENT_LIMIT = 30;
const DEFAULT_COMMENT_PAGE_SIZE = 10;
const MAX_COMMENT_PAGE_SIZE = 30;
const DEFAULT_COMMENT_AUTHOR_NAME = "User";
const AUTH_USER_COLLECTION_CANDIDATES = ["user", "users"] as const;
/** Resolved once per process so we don't listCollections on every comment feed. */
let cachedAuthUserCollection: string | null | undefined;
const TOP_LEVEL_COMMENT_QUERY = { parentCommentId: null };
const COMMENT_PROJECTION =
  "_id userId content movieSlug movieName targetType episodeName parentCommentId likeCount createdAt updatedAt";

type CommentAuthorProfile = {
  name: string;
  image: string;
};

const isDuplicateKeyError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeCode = (error as { code?: unknown }).code;
  return maybeCode === 11000;
};

const countSince = async (
  model: typeof CommentModel | typeof CommentLikeModel,
  userId: string,
  windowMs: number,
) => {
  const since = new Date(Date.now() - windowMs);
  return model.countDocuments({
    userId,
    createdAt: { $gte: since },
  });
};

const getCreateCommentRateLimitMessage = async (userId: string) => {
  const [minuteCount, hourCount] = await Promise.all([
    countSince(CommentModel, userId, COMMENT_CREATE_RATE.windowMs),
    countSince(CommentModel, userId, COMMENT_CREATE_HOURLY_RATE.windowMs),
  ]);

  if (minuteCount >= COMMENT_CREATE_RATE.max) {
    return `Báº¡n Ä‘Ã£ bÃ¬nh luáº­n quÃ¡ nhanh. Tá»‘i Ä‘a ${COMMENT_CREATE_RATE.max} bÃ¬nh luáº­n / ${COMMENT_CREATE_RATE.label}.`;
  }

  if (hourCount >= COMMENT_CREATE_HOURLY_RATE.max) {
    return `Báº¡n Ä‘Ã£ bÃ¬nh luáº­n quÃ¡ nhiá»u. Tá»‘i Ä‘a ${COMMENT_CREATE_HOURLY_RATE.max} bÃ¬nh luáº­n / ${COMMENT_CREATE_HOURLY_RATE.label}.`;
  }

  return null;
};

const getLikeRateLimitMessage = async (userId: string) => {
  const likeCount = await countSince(
    CommentLikeModel,
    userId,
    COMMENT_LIKE_RATE.windowMs,
  );

  if (likeCount >= COMMENT_LIKE_RATE.max) {
    return `Báº¡n Ä‘Ã£ thÃ­ch quÃ¡ nhanh. Tá»‘i Ä‘a ${COMMENT_LIKE_RATE.max} lÆ°á»£t thÃ­ch / ${COMMENT_LIKE_RATE.label}.`;
  }

  return null;
};

const buildCommentPagination = (
  page: number,
  pageSize: number,
  totalItems: number,
): CommentFeedPagination => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};

const findAuthUsersByIds = async (
  userIds: Array<ObjectId | string>,
): Promise<
  Array<{ _id?: ObjectId | string; name?: string; image?: string }>
> => {
  if (userIds.length === 0) return [];

  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) return [];

  if (cachedAuthUserCollection === undefined) {
    cachedAuthUserCollection = null;
    for (const collectionName of AUTH_USER_COLLECTION_CANDIDATES) {
      const exists = await db
        .listCollections({ name: collectionName }, { nameOnly: true })
        .hasNext();
      if (!exists) continue;
      cachedAuthUserCollection = collectionName;
      break;
    }
  }

  if (!cachedAuthUserCollection) return [];

  return db
    .collection(cachedAuthUserCollection)
    .find(
      { _id: { $in: userIds as any[] } },
      { projection: { _id: 1, name: 1, image: 1 } },
    )
    .toArray();
};

const getCommentAuthorProfileMap = async (
  userIds: string[],
): Promise<Map<string, CommentAuthorProfile>> => {
  const normalizedUserIds = Array.from(
    new Set(userIds.map((id) => String(id || "").trim()).filter(Boolean)),
  );
  if (normalizedUserIds.length === 0) return new Map();

  const lookupIds: Array<ObjectId | string> = [];
  for (const userId of normalizedUserIds) {
    lookupIds.push(userId);
    if (ObjectId.isValid(userId)) {
      lookupIds.push(new ObjectId(userId));
    }
  }

  const rows = await findAuthUsersByIds(lookupIds);
  const profileMap = new Map<string, CommentAuthorProfile>();

  for (const row of rows) {
    const id = row?._id ? String(row._id) : "";
    if (!id) continue;
    profileMap.set(id, {
      name: String(row.name || "").trim() || DEFAULT_COMMENT_AUTHOR_NAME,
      image: String(row.image || "").trim(),
    });
  }

  return profileMap;
};

const getViewerLikedCommentIdSet = async (
  viewerId: string | null | undefined,
  commentIds: string[],
): Promise<Set<string>> => {
  if (!viewerId) return new Set<string>();

  const uniqueCommentIds = Array.from(
    new Set(commentIds.map((id) => String(id || "").trim()).filter(Boolean)),
  );
  if (uniqueCommentIds.length === 0) return new Set<string>();
  const objectIds = uniqueCommentIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));
  if (objectIds.length === 0) return new Set<string>();

  const likes = await CommentLikeModel.find({
    userId: viewerId,
    commentId: { $in: objectIds },
  })
    .select("commentId")
    .lean();

  return new Set(likes.map((like: any) => String(like.commentId)));
};

const toFeedItem = (
  doc: any,
  viewerId?: string | null,
  likedCommentIds?: Set<string>,
  levelMap?: Map<string, number>,
  authorProfileMap?: Map<string, CommentAuthorProfile>,
  cosmeticsMap?: Map<string, UserCosmeticsPublic>,
): CommentFeedItem => {
  const userId = String(doc.userId || "").trim();
  const authorProfile = authorProfileMap?.get(userId);

  return {
    id: String(doc._id),
    userId,
    userName: authorProfile?.name || DEFAULT_COMMENT_AUTHOR_NAME,
    userImage: authorProfile?.image || "",
    content: doc.content,
    movieSlug: doc.movieSlug,
    targetType: doc.targetType,
    episodeName: doc.episodeName || null,
    parentCommentId: doc.parentCommentId ? String(doc.parentCommentId) : null,
    userLevel: levelMap?.get(userId) ?? 1,
    cosmetics: cosmeticsMap?.get(userId) ?? EMPTY_COSMETICS_PUBLIC,
    likeCount: Number.isFinite(doc.likeCount) ? doc.likeCount : 0,
    likedByViewer:
      Boolean(viewerId) && Boolean(likedCommentIds?.has(String(doc._id))),
    createdAt: new Date(doc.createdAt || doc.updatedAt).toISOString(),
  };
};

/** At max depth 1, only direct replies to top-level comments are loaded. */
const fetchDirectRepliesForParents = async (
  scopeQuery: Record<string, unknown>,
  parentIds: string[],
) => {
  const parentObjectIds = Array.from(
    new Set(parentIds.map((id) => String(id || "").trim()).filter(Boolean)),
  )
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (parentObjectIds.length === 0) return [] as any[];

  return CommentModel.find({
    ...scopeQuery,
    parentCommentId: { $in: parentObjectIds },
  })
    .select(COMMENT_PROJECTION)
    .lean();
};

const getPaginatedCommentDocs = async (
  scopeQuery: Record<string, unknown>,
  page: number,
  pageSize: number,
): Promise<{ docs: any[]; pagination: CommentFeedPagination }> => {
  const topLevelQuery = {
    ...scopeQuery,
    ...TOP_LEVEL_COMMENT_QUERY,
  };

  const requestedPage = Math.max(1, Math.floor(Number(page) || 1));
  const provisionalSkip = (requestedPage - 1) * pageSize;

  const [totalItems, provisionalDocs] = await Promise.all([
    CommentModel.countDocuments(topLevelQuery),
    CommentModel.find(topLevelQuery)
      .select(COMMENT_PROJECTION)
      .sort({ createdAt: -1 })
      .skip(provisionalSkip)
      .limit(pageSize)
      .lean(),
  ]);

  const pagination = buildCommentPagination(requestedPage, pageSize, totalItems);

  if (totalItems === 0) {
    return {
      docs: [],
      pagination,
    };
  }

  let topLevelDocs = provisionalDocs;
  if (pagination.page !== requestedPage) {
    topLevelDocs = await CommentModel.find(topLevelQuery)
      .select(COMMENT_PROJECTION)
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pageSize)
      .limit(pageSize)
      .lean();
  }

  const descendants = await fetchDirectRepliesForParents(
    scopeQuery,
    topLevelDocs.map((doc: any) => String(doc._id)),
  );

  return {
    docs: [...topLevelDocs, ...descendants],
    pagination,
  };
};

const buildCommentFeed = async (
  scopeQuery: Record<string, unknown>,
  page: number,
  pageSize: number,
): Promise<CommentFeedResponse> => {
  const user = await getSessionUser();

  await connectToDatabase();
  const { docs, pagination } = await getPaginatedCommentDocs(
    scopeQuery,
    page,
    pageSize,
  );

  const commentIds = docs.map((doc: any) => String(doc._id));
  const userIds = Array.from(
    new Set(
      [...docs.map((doc: any) => String(doc.userId || "")), user?.id || ""]
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );
  const [likedCommentIds, levelMap, authorProfileMap, cosmeticsMap] =
    await Promise.all([
      getViewerLikedCommentIdSet(user?.id, commentIds),
      getUserLevelMap(userIds),
      getCommentAuthorProfileMap(userIds),
      getUserCosmeticsMap(userIds),
    ]);

  return {
    viewer: toCommentViewer(user, levelMap, cosmeticsMap),
    comments: docs.map((doc: any) =>
      toFeedItem(
        doc,
        user?.id,
        likedCommentIds,
        levelMap,
        authorProfileMap,
        cosmeticsMap,
      ),
    ),
    pagination,
  };
};

const toCommentViewer = (
  user: Awaited<ReturnType<typeof getSessionUser>>,
  levelMap: Map<string, number>,
  cosmeticsMap: Map<string, UserCosmeticsPublic>,
): CommentViewer => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name || user.email || "User",
    image: user.image ?? "",
    level: levelMap.get(user.id) ?? 1,
    cosmetics: cosmeticsMap.get(user.id) ?? EMPTY_COSMETICS_PUBLIC,
  };
};

const toViewerAuthoredFeedItem = async (
  doc: any,
  user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>,
): Promise<CommentFeedItem> => {
  const [levelMap, cosmeticsMap] = await Promise.all([
    getUserLevelMap([user.id]),
    getUserCosmeticsMap([user.id]),
  ]);

  return toFeedItem(
    doc,
    user.id,
    new Set<string>(),
    levelMap,
    new Map<string, CommentAuthorProfile>([
      [
        user.id,
        {
          name:
            String(user.name || user.email || "").trim() ||
            DEFAULT_COMMENT_AUTHOR_NAME,
          image: String(user.image || "").trim(),
        },
      ],
    ]),
    cosmeticsMap,
  );
};

const findRecentDuplicateComment = async ({
  userId,
  movieSlug,
  content,
  targetType,
  episodeName,
  parentCommentId,
}: {
  userId: string;
  movieSlug: string;
  content: string;
  targetType: "movie" | "episode";
  episodeName: string | null;
  parentCommentId: Types.ObjectId | null;
}) => {
  const since = new Date(Date.now() - COMMENT_DUPLICATE_WINDOW_MS);

  return CommentModel.findOne({
    userId,
    movieSlug,
    content,
    targetType,
    episodeName,
    parentCommentId,
    createdAt: { $gte: since },
  })
    .select(COMMENT_PROJECTION)
    .sort({ createdAt: -1 })
    .lean();
};

export const getMovieComments = async (
  movieSlug: string,
  page = 1,
  pageSize = DEFAULT_COMMENT_PAGE_SIZE,
): Promise<CommentFeedResponse> => {
  const normalizedSlug = movieSlug.trim();
  const normalizedPagination = normalizePageAndSize(
    page,
    pageSize,
    DEFAULT_COMMENT_PAGE_SIZE,
    MAX_COMMENT_PAGE_SIZE,
  );

  if (!normalizedSlug) {
    return {
      viewer: null,
      comments: [],
      pagination: buildCommentPagination(
        normalizedPagination.page,
        normalizedPagination.pageSize,
        0,
      ),
    };
  }

  return buildCommentFeed(
    { movieSlug: normalizedSlug },
    normalizedPagination.page,
    normalizedPagination.pageSize,
  );
};

export const getEpisodeComments = async (
  movieSlug: string,
  episodeName: string,
  page = 1,
  pageSize = DEFAULT_COMMENT_PAGE_SIZE,
): Promise<CommentFeedResponse> => {
  const normalizedSlug = movieSlug.trim();
  const normalizedChapter = episodeName.trim();
  const normalizedPagination = normalizePageAndSize(
    page,
    pageSize,
    DEFAULT_COMMENT_PAGE_SIZE,
    MAX_COMMENT_PAGE_SIZE,
  );

  if (!normalizedSlug || !normalizedChapter) {
    return {
      viewer: null,
      comments: [],
      pagination: buildCommentPagination(
        normalizedPagination.page,
        normalizedPagination.pageSize,
        0,
      ),
    };
  }

  return buildCommentFeed(
    {
      movieSlug: normalizedSlug,
      targetType: "episode",
      episodeName: normalizedChapter,
    },
    normalizedPagination.page,
    normalizedPagination.pageSize,
  );
};

export const getRecentTopLevelComments = async (
  limit = DEFAULT_RECENT_HOME_COMMENT_LIMIT,
): Promise<HomeRecentCommentItem[]> => {
  const normalizedLimit = Number.isFinite(limit) ? Math.floor(limit) : 0;
  const safeLimit = Math.min(
    MAX_RECENT_HOME_COMMENT_LIMIT,
    Math.max(1, normalizedLimit || DEFAULT_RECENT_HOME_COMMENT_LIMIT),
  );

  try {
    await connectToDatabase();

    const docs = await CommentModel.find(TOP_LEVEL_COMMENT_QUERY)
      .select(COMMENT_PROJECTION)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();

    const userIds = docs.map((doc: any) => String(doc.userId || ""));
    const [levelMap, authorProfileMap, cosmeticsMap] = await Promise.all([
      getUserLevelMap(userIds),
      getCommentAuthorProfileMap(userIds),
      getUserCosmeticsMap(userIds),
    ]);

    return docs.map((doc: any) => {
      const movieSlug = String(doc.movieSlug || "").trim();
      const storedComicName = String(doc.movieName || "").trim();
      const userId = String(doc.userId || "").trim();
      const movieName = storedComicName || movieSlug || "Unknown Movie";
      const authorProfile = authorProfileMap.get(userId);

      return {
        id: String(doc._id),
        userName: authorProfile?.name || DEFAULT_COMMENT_AUTHOR_NAME,
        userImage: authorProfile?.image || "",
        userLevel: levelMap.get(userId) ?? 1,
        cosmetics: cosmeticsMap.get(userId) ?? EMPTY_COSMETICS_PUBLIC,
        content: String(doc.content),
        movieSlug,
        movieName,
        episodeName: doc.episodeName || null,
        likeCount: Number.isFinite(doc.likeCount) ? doc.likeCount : 0,
        createdAt: new Date(doc.createdAt || doc.updatedAt).toISOString(),
      };
    });
  } catch (error) {
    console.error("Failed to load recent top-level comments:", error);
    return [];
  }
};

export const createComment = async (
  input: CreateCommentInput,
): Promise<CreateCommentResult> => {
  const user = await getSessionUser();
  if (!user) {
    return {
      success: false,
      message: "Please sign in to comment.",
      requiresSignIn: true,
    };
  }

  const movieSlug = input.movieSlug.trim();
  const movieName = input.movieName?.trim() || "";
  const content = input.content.trim();
  const episodeName = input.episodeName?.trim() || null;
  const parentCommentId = input.parentCommentId?.trim() || null;
  let normalizedParentCommentId: Types.ObjectId | null = null;
  let resolvedComicName = movieName || movieSlug;

  if (!movieSlug) {
    return { success: false, message: "Invalid movie identifier." };
  }

  if (!content) {
    return { success: false, message: "Comment cannot be empty." };
  }

  if (content.length > COMMENT_MAX_LENGTH) {
    return {
      success: false,
      message: `Comment must be ${COMMENT_MAX_LENGTH} characters or less.`,
    };
  }

  await connectToDatabase();

  let resolvedTargetType: "movie" | "episode" = "movie";
  let resolvedChapterName: string | null = null;

  if (parentCommentId) {
    if (!Types.ObjectId.isValid(parentCommentId)) {
      return { success: false, message: "Invalid parent comment." };
    }
    const parentObjectId = new Types.ObjectId(parentCommentId);

    const parent = await CommentModel.findOne({
      _id: parentObjectId,
      movieSlug,
    })
      .select("_id movieName targetType episodeName parentCommentId")
      .lean();

    if (!parent) {
      return { success: false, message: "Parent comment not found." };
    }

    if (COMMENT_MAX_DEPTH <= 0) {
      return {
        success: false,
        message: `Chá»‰ Ä‘Æ°á»£c tráº£ lá»i tá»‘i Ä‘a ${COMMENT_MAX_DEPTH} cáº¥p.`,
      };
    }

    if (parent.parentCommentId) {
      return {
        success: false,
        message: `Chá»‰ Ä‘Æ°á»£c tráº£ lá»i tá»‘i Ä‘a ${COMMENT_MAX_DEPTH} cáº¥p.`,
      };
    }

    resolvedTargetType = parent.targetType;
    resolvedChapterName = parent.episodeName || null;
    normalizedParentCommentId = new Types.ObjectId(String(parent._id));
    resolvedComicName =
      String(parent.movieName || "").trim() || resolvedComicName;
  } else {
    if (!input.targetType) {
      return { success: false, message: "Missing comment target." };
    }
    resolvedTargetType = input.targetType;

    if (resolvedTargetType === "episode" && !episodeName) {
      return {
        success: false,
        message: "Invalid episode identifier.",
      };
    }

    resolvedChapterName = resolvedTargetType === "episode" ? episodeName : null;
  }

  const duplicate = await findRecentDuplicateComment({
    userId: user.id,
    movieSlug,
    content,
    targetType: resolvedTargetType,
    episodeName: resolvedChapterName,
    parentCommentId: normalizedParentCommentId,
  });

  if (duplicate) {
    return {
      success: true,
      message: "Comment posted.",
      comment: await toViewerAuthoredFeedItem(duplicate, user),
    };
  }

  const rateLimitMessage = await getCreateCommentRateLimitMessage(user.id);
  if (rateLimitMessage) {
    return { success: false, message: rateLimitMessage };
  }

  const created = await CommentModel.create({
    userId: user.id,
    movieSlug,
    movieName: resolvedComicName,
    targetType: resolvedTargetType,
    episodeName: resolvedChapterName,
    parentCommentId: normalizedParentCommentId,
    content,
    likeCount: 0,
  });
  // Homepage recent-comments strip is ISR'd; refresh it. Manga/chapter pages
  // load comments client-side, so busting their caches here is unnecessary.
  revalidatePath("/");

  return {
    success: true,
    message: "Comment posted.",
    comment: await toViewerAuthoredFeedItem(created.toObject(), user),
  };
};

export const toggleCommentLike = async (
  commentId: string,
): Promise<ToggleCommentLikeResult> => {
  const user = await getSessionUser();
  if (!user) {
    return {
      success: false,
      message: "Please sign in to like comments.",
      requiresSignIn: true,
    };
  }

  const normalizedId = commentId.trim();
  if (!Types.ObjectId.isValid(normalizedId)) {
    return { success: false, message: "Invalid comment identifier." };
  }
  const commentObjectId = new Types.ObjectId(normalizedId);

  await connectToDatabase();
  const existing = await CommentModel.findById(commentObjectId)
    .select("_id")
    .lean();

  if (!existing) {
    return { success: false, message: "Comment not found." };
  }

  const removedLike = await CommentLikeModel.findOneAndDelete({
    commentId: commentObjectId,
    userId: user.id,
  })
    .select("_id")
    .lean();

  let likedByViewer = false;
  let updatedLikeCount: number | null = null;

  if (removedLike) {
    const updatedComment = await CommentModel.findOneAndUpdate(
      { _id: commentObjectId },
      { $inc: { likeCount: -1 } },
      {
        returnDocument: "after",
        projection: { likeCount: 1 },
        lean: true,
      },
    );

    updatedLikeCount = Number(updatedComment?.likeCount ?? 0);
    likedByViewer = false;
  } else {
    const rateLimitMessage = await getLikeRateLimitMessage(user.id);
    if (rateLimitMessage) {
      return { success: false, message: rateLimitMessage };
    }

    let createdLike = false;
    try {
      await CommentLikeModel.create({
        commentId: commentObjectId,
        userId: user.id,
      });
      createdLike = true;
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }
    }

    if (createdLike) {
      const updatedComment = await CommentModel.findOneAndUpdate(
        { _id: commentObjectId },
        { $inc: { likeCount: 1 } },
        {
          returnDocument: "after",
          projection: { likeCount: 1 },
          lean: true,
        },
      );

      updatedLikeCount = Number(updatedComment?.likeCount ?? 0);
      likedByViewer = true;
    } else {
      // Duplicate key means the like already exists (race-safe no-op on count).
      const commentDoc = await CommentModel.findById(commentObjectId)
        .select("likeCount")
        .lean();
      updatedLikeCount = Number(commentDoc?.likeCount ?? 0);
      likedByViewer = true;
    }
  }

  const safeLikeCount = Math.max(0, Math.floor(updatedLikeCount ?? 0));
  if (safeLikeCount === 0) {
    await CommentModel.updateOne(
      { _id: commentObjectId, likeCount: { $lt: 0 } },
      { $set: { likeCount: 0 } },
    );
  }

  // Likes update in the client UI; do not revalidate ISR manga/chapter/home pages.
  return {
    success: true,
    message: likedByViewer ? "Liked comment." : "Like removed.",
    liked: likedByViewer,
    likeCount: safeLikeCount,
  };
};

