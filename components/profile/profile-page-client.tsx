"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Loader2,
  LogOut,
  ShoppingBag,
  Sparkles,
  Trophy,
  Upload,
  UserRound,
} from "lucide-react";
import { updateUserProfile } from "@/lib/actions/profile.actions";
import { authClient } from "@/lib/better-auth/auth-client";
import type {
  UserCosmeticsPublic,
  UserWalletSummary,
} from "@/lib/cosmetics/types";
import type { WatchExpStats as ReadingExpStats } from "@/lib/user-level";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CosmeticAvatar } from "@/components/cosmetics/cosmetic-avatar";
import { UserDisplayName } from "@/components/cosmetics/user-display-name";

type ProfilePageClientProps = {
  initialProfile: {
    name: string;
    email: string;
    image: string;
    description: string;
  };
  readingExp: ReadingExpStats;
  wallet: UserWalletSummary | null;
  cosmetics: UserCosmeticsPublic;
};

type NoticeState = {
  type: "success" | "error";
  message: string;
} | null;

const MAX_AVATAR_SIZE_BYTES = 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 25;
const ALLOWED_AVATAR_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function ProfilePageClient({
  initialProfile,
  readingExp,
  wallet,
  cosmetics,
}: ProfilePageClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(initialProfile.name);
  const [description, setDescription] = useState(initialProfile.description);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.image || "");
  const [avatarPreview, setAvatarPreview] = useState(
    initialProfile.image || "",
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [clearAvatar, setClearAvatar] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [isSaving, startSaving] = useTransition();
  const [isSigningOut, startSigningOut] = useTransition();

  const userInitial = useMemo(
    () =>
      displayName.trim().charAt(0).toUpperCase() ||
      initialProfile.email.charAt(0).toUpperCase() ||
      "U",
    [displayName, initialProfile.email],
  );

  const isMaxLevel = readingExp.level >= readingExp.maxLevel;
  const nextLevel = Math.min(readingExp.level + 1, readingExp.maxLevel);
  const availableCredits = wallet?.availableCredits ?? readingExp.totalExp;

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_MIME.has(file.type)) {
      setNotice({
        type: "error",
        message: "Avatar must be JPEG, PNG, WebP, or GIF.",
      });
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setNotice({
        type: "error",
        message: "Avatar image must be 1MB or smaller.",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setClearAvatar(false);
    setAvatarPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return objectUrl;
    });
    setNotice(null);
  };

  const handleClearAvatar = () => {
    setPendingFile(null);
    setClearAvatar(true);
    setAvatarPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return "";
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setNotice(null);
  };

  const handleSaveProfile = () => {
    const normalizedName = displayName.trim();
    if (normalizedName.length < 2 || normalizedName.length > 40) {
      setNotice({
        type: "error",
        message: "Tên hiển thị phải từ 2 đến 40 ký tự",
      });
      return;
    }

    const normalizedDescription = description
      .trim()
      .slice(0, MAX_DESCRIPTION_LENGTH);
    if (normalizedDescription.length > MAX_DESCRIPTION_LENGTH) {
      setNotice({
        type: "error",
        message: `Mô tả tối đa ${MAX_DESCRIPTION_LENGTH} ký tự`,
      });
      return;
    }

    startSaving(async () => {
      const formData = new FormData();
      formData.set("displayName", normalizedName);
      formData.set("description", normalizedDescription);
      if (clearAvatar) {
        formData.set("clearAvatar", "1");
      } else if (pendingFile) {
        formData.set("avatar", pendingFile);
      }

      const result = await updateUserProfile(formData);

      if (!result.success) {
        setNotice({ type: "error", message: result.message });
        return;
      }

      const savedImage = result.image ?? null;
      setAvatarUrl(savedImage || "");
      setAvatarPreview((prev) => {
        if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return savedImage || "";
      });
      setDescription(result.description ?? normalizedDescription);
      setPendingFile(null);
      setClearAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setNotice({ type: "success", message: result.message });
      router.refresh();
    });
  };

  const handleSignOut = () => {
    setNotice(null);
    startSigningOut(async () => {
      const { error } = await authClient.signOut();

      if (error) {
        setNotice({
          type: "error",
          message: error.message || "Sign-out failed",
        });
        return;
      }

      router.push("/sign-in");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-lg backdrop-blur">
        <div
          className={cn(
            "h-28 bg-gradient-to-r from-primary/80 via-accent/75 to-primary/50",
            cosmetics.profileBannerClassName,
          )}
        />
        <div className="-mt-12 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <CosmeticAvatar
              src={avatarPreview}
              alt={displayName}
              fallback={userInitial}
              frameSrc={cosmetics.avatarFrameSrc}
              frameScale={cosmetics.avatarFrameScale}
              className="shadow-md"
              avatarClassName="h-24 w-24"
              fallbackClassName="text-2xl"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <UserDisplayName
                  name={displayName}
                  cosmetics={cosmetics}
                  nameClassName="text-2xl font-semibold"
                />
                <Badge
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                >
                  Lv.{readingExp.level}
                </Badge>
              </div>
              {description ? (
                <p className="text-sm text-muted-foreground/90">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <Link href="/shop">
            <Button type="button" variant="outline" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Cửa Hàng
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="h-5 w-5 text-primary" />
              Hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="display-name">Tên hiển thị</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={40}
                placeholder="Nhập tên hiển thị"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="profile-description">Mô tả</Label>
                <span className="text-xs text-muted-foreground">
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Input
                id="profile-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value.slice(0, MAX_DESCRIPTION_LENGTH),
                  )
                }
                maxLength={MAX_DESCRIPTION_LENGTH}
                placeholder="VD: Xem phim mỗi ngày"
              />
            </div>

            <div className="space-y-2">
              <Label>Ảnh đại diện</Label>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP hoặc GIF
              </p>
              {(pendingFile || clearAvatar) && (
                <p className="text-xs text-primary">
                  {clearAvatar
                    ? "Ảnh sẽ bị xóa khi bạn lưu."
                    : `Đã chọn: ${pendingFile?.name}`}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Tải ảnh đại diện
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                disabled={!avatarUrl && !pendingFile && !clearAvatar}
                onClick={handleClearAvatar}
              >
                <Camera className="h-4 w-4" />
                Xóa ảnh đại diện
              </Button>
            </div>

            {notice ? (
              <p
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  notice.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-destructive/30 bg-destructive/10 text-destructive",
                )}
              >
                {notice.message}
              </p>
            ) : null}

            <Button
              type="button"
              className="gap-2"
              onClick={handleSaveProfile}
              disabled={isSaving || isSigningOut}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Lưu
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-primary" />
              Cấp bậc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Level {readingExp.level}
                </span>
                <span className="font-medium text-foreground">
                  {Math.round(readingExp.progressPercent)}%
                </span>
              </div>
              <Progress value={readingExp.progressPercent} />
            </div>

            <p className="text-sm text-muted-foreground">
              {isMaxLevel
                ? "Bạn đã đạt cấp độ tối đa. VuaPhim xin cảm ơn"
                : `Cần ${readingExp.expToNextLevel} EXP để đạt level  ${nextLevel}.`}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border/70 bg-background/60 p-3">
                <p className="text-muted-foreground">Tổng số EXP</p>
                <p className="text-lg font-semibold text-foreground">
                  {readingExp.totalExp.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/60 p-3">
                <p className="text-muted-foreground">Linh Thạch</p>
                <p className="text-lg font-semibold text-primary">
                  {availableCredits.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/60 p-3 col-span-2">
                <p className="text-muted-foreground">Số tập đã xem</p>
                <p className="text-lg font-semibold text-foreground">
                  {readingExp.episodesWatched.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Hãy xem thêm nhiều phim để tăng cấp !!!
            </p>

            <Button
              type="button"
              variant="destructive"
              className="w-full gap-2"
              onClick={handleSignOut}
              disabled={isSaving || isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng xuất...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
