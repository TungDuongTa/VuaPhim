"use server";

import { BookmarkModel } from "@/database/models/bookmark.model";
import { connectToDatabase } from "@/database/mongoose";
import { normalizePageAndSize } from "@/lib/pagination";
import { getCurrentUserId } from "@/lib/server/session";
import type { MovieCard } from "@/types/movie-types";

type ToggleBookmarkInput = {
  slug: string;
  movieName?: string;
  thumbUrl?: string;
};

type BookmarkActionResult = {
  success: boolean;
  message: string;
  bookmarked: boolean;
  requiresSignIn?: boolean;
};

export type BookmarkedMovie = MovieCard & { bookmarkedAt: string };

export type PaginatedBookmarksResult = {
  items: BookmarkedMovie[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const DEFAULT_BOOKMARKS_PAGE_SIZE = 24;
const MAX_BOOKMARKS_PAGE_SIZE = 60;

const toCard = (row: {
  slug?: string;
  movieName?: string;
  thumbUrl?: string;
  createdAt?: Date | string;
}): BookmarkedMovie => {
  const slug = String(row.slug || "").trim();
  const bookmarkedAt = new Date(row.createdAt || Date.now()).toISOString();
  return {
    _id: slug,
    name: row.movieName || slug,
    slug,
    origin_name: [],
    thumb_url: row.thumbUrl || "",
    poster_url: row.thumbUrl || "",
    quality: "",
    language: "",
    current_episode: "",
    total_episodes: "",
    type: "",
    year: "",
    category: [],
    updatedAt: bookmarkedAt,
    bookmarkedAt,
  };
};

export const getBookmarksPageForUser = async (
  userId: string,
  {
    page = 1,
    pageSize = DEFAULT_BOOKMARKS_PAGE_SIZE,
  }: { page?: number; pageSize?: number } = {},
): Promise<PaginatedBookmarksResult> => {
  const normalized = normalizePageAndSize(
    page,
    pageSize,
    DEFAULT_BOOKMARKS_PAGE_SIZE,
    MAX_BOOKMARKS_PAGE_SIZE,
  );

  if (!userId) {
    return {
      items: [],
      page: normalized.page,
      pageSize: normalized.pageSize,
      totalItems: 0,
      totalPages: 1,
    };
  }

  await connectToDatabase();
  const totalItems = await BookmarkModel.countDocuments({ userId });
  const totalPages = Math.max(1, Math.ceil(totalItems / normalized.pageSize));
  const safePage = Math.min(normalized.page, totalPages);
  const rows = await BookmarkModel.find({ userId })
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * normalized.pageSize)
    .limit(normalized.pageSize)
    .lean();

  return {
    items: rows.map(toCard),
    page: safePage,
    pageSize: normalized.pageSize,
    totalItems,
    totalPages,
  };
};

export const toggleMovieBookmark = async (
  input: ToggleBookmarkInput,
): Promise<BookmarkActionResult> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      success: false,
      message: "Vui lòng đăng nhập để theo dõi phim.",
      bookmarked: false,
      requiresSignIn: true,
    };
  }

  const slug = String(input.slug || "").trim();
  if (!slug) {
    return {
      success: false,
      message: "Không thể cập nhật danh sách theo dõi.",
      bookmarked: false,
    };
  }

  await connectToDatabase();
  const existing = await BookmarkModel.findOne({ userId, slug }).select("_id");
  if (existing) {
    await BookmarkModel.deleteOne({ _id: existing._id });
    return {
      success: true,
      message: "Đã xóa khỏi danh sách theo dõi",
      bookmarked: false,
    };
  }

  try {
    await BookmarkModel.create({
      userId,
      slug,
      movieName: input.movieName || "",
      thumbUrl: input.thumbUrl || "",
    });
    return {
      success: true,
      message: "Đã thêm vào danh sách theo dõi",
      bookmarked: true,
    };
  } catch (error: any) {
    if (error?.code === 11000) {
      return {
        success: true,
        message: "Already in bookmarks.",
        bookmarked: true,
      };
    }
    console.error("Failed to toggle bookmark:", error);
    return {
      success: false,
      message: "Không thể cập nhật danh sách theo dõi.",
      bookmarked: false,
    };
  }
};

export const removeMovieBookmark = async (slug: string) => {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      success: false,
      message: "Vui lòng đăng nhập để quản lý danh sách theo dõi.",
    };
  }

  const normalizedSlug = String(slug || "").trim();
  if (!normalizedSlug) {
    return { success: false, message: "Không thể xóa." };
  }

  await connectToDatabase();
  await BookmarkModel.deleteOne({ userId, slug: normalizedSlug });
  return { success: true, message: "Đã xóa khỏi danh sách theo dõi" };
};

export const isMovieBookmarked = async (slug: string) => {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  await connectToDatabase();
  const existing = await BookmarkModel.findOne({
    userId,
    slug: slug.trim(),
  }).select("_id");
  return Boolean(existing);
};
