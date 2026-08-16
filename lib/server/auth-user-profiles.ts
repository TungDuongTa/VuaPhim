import "server-only";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/database/mongoose";

const AUTH_USER_COLLECTION_CANDIDATES = ["user", "users"] as const;
const DEFAULT_USER_NAME = "User";

/** Resolved once per process so we don't listCollections on every lookup. */
let cachedAuthUserCollection: string | null | undefined;

export type AuthUserProfile = {
  name: string;
  image: string;
  description: string;
};

const findAuthUsersByIds = async (
  userIds: Array<ObjectId | string>,
): Promise<
  Array<{
    _id?: ObjectId | string;
    name?: string;
    image?: string;
    description?: string;
  }>
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
      { projection: { _id: 1, name: 1, image: 1, description: 1 } },
    )
    .toArray();
};

export const getAuthUserProfileMap = async (
  userIds: string[],
): Promise<Map<string, AuthUserProfile>> => {
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
  const profileMap = new Map<string, AuthUserProfile>();

  for (const row of rows) {
    const id = row?._id ? String(row._id) : "";
    if (!id) continue;
    profileMap.set(id, {
      name: String(row.name || "").trim() || DEFAULT_USER_NAME,
      image: String(row.image || "").trim(),
      description: String(row.description || "").trim().slice(0, 15),
    });
  }

  return profileMap;
};
