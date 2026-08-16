"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/better-auth/auth";
import {
  deleteAvatarByUrl,
  uploadUserAvatar,
} from "@/lib/server/r2-avatar";

const MAX_AVATAR_SIZE_BYTES = 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 15;
const ALLOWED_AVATAR_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type UpdateUserProfileResult = {
  success: boolean;
  message: string;
  image?: string | null;
  description?: string;
};

export const updateUserProfile = async (
  formData: FormData,
): Promise<UpdateUserProfileResult> => {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });
    const userId = session?.user?.id;
    if (!userId) {
      return {
        success: false,
        message: "Please sign in to update your profile.",
      };
    }

    const name = String(formData.get("displayName") || "").trim();
    if (name.length < 2 || name.length > 40) {
      return {
        success: false,
        message: "Tên hiển thị phải có từ 2 đến 40 ký tự",
      };
    }

    const description = String(formData.get("description") || "")
      .trim()
      .slice(0, MAX_DESCRIPTION_LENGTH);
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return {
        success: false,
        message: `Mô tả tối đa ${MAX_DESCRIPTION_LENGTH} ký tự`,
      };
    }

    const clearAvatar = String(formData.get("clearAvatar") || "") === "1";
    const avatarEntry = formData.get("avatar");
    const avatarFile =
      avatarEntry instanceof File && avatarEntry.size > 0 ? avatarEntry : null;

    let nextImage: string | null | undefined = undefined;
    const previousImage = String(session.user.image || "").trim() || null;

    if (clearAvatar) {
      nextImage = null;
    } else if (avatarFile) {
      if (!ALLOWED_AVATAR_MIME.has(avatarFile.type)) {
        return {
          success: false,
          message: "Avatar must be JPEG, PNG, WebP, or GIF.",
        };
      }

      if (avatarFile.size > MAX_AVATAR_SIZE_BYTES) {
        return {
          success: false,
          message: "Avatar image must be 1MB or smaller.",
        };
      }

      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      nextImage = await uploadUserAvatar(userId, buffer);
    }

    await auth.api.updateUser({
      headers: requestHeaders,
      body: {
        name,
        description,
        ...(nextImage !== undefined ? { image: nextImage } : {}),
      },
    });

    if (
      nextImage !== undefined &&
      previousImage &&
      previousImage !== nextImage
    ) {
      await deleteAvatarByUrl(previousImage);
    }

    revalidatePath("/");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Profile updated successfully.",
      image: nextImage === undefined ? previousImage : nextImage,
      description,
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, message: "Failed to update profile." };
  }
};
