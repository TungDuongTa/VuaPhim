import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const AVATAR_SIZE = 256;
const WEBP_QUALITY = 82;

let cachedClient: S3Client | null = null;

const requireEnv = (name: string): string => {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

const getClient = (): S3Client => {
  if (cachedClient) return cachedClient;

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return cachedClient;
};

const getPublicBaseUrl = (): string =>
  requireEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");

const getBucket = (): string => requireEnv("R2_BUCKET");

const avatarKeyForUser = (userId: string, version: string) =>
  `avatars/${userId}/${version}.webp`;

/** Extract R2 object key from a CDN URL we previously issued. */
export const getAvatarObjectKeyFromUrl = (imageUrl: string): string | null => {
  const base = getPublicBaseUrl();
  const trimmed = imageUrl.trim();
  if (!trimmed.startsWith(`${base}/`)) return null;

  const key = trimmed.slice(base.length + 1).split("?")[0];
  if (!key.startsWith("avatars/")) return null;
  return key;
};

export async function uploadUserAvatar(
  userId: string,
  buffer: Buffer,
): Promise<string> {
  const webp = await sharp(buffer)
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const version = `${Date.now()}`;
  const key = avatarKeyForUser(userId, version);

  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: webp,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${getPublicBaseUrl()}/${key}`;
}

export async function deleteAvatarByUrl(imageUrl: string): Promise<void> {
  try {
    const key = getAvatarObjectKeyFromUrl(imageUrl);
    if (!key) return;

    await getClient().send(
      new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: key,
      }),
    );
  } catch (error) {
    console.error("Failed to delete previous avatar from R2:", error);
  }
}
