"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Gem,
  Loader2,
  LogIn,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  equipCosmeticItem,
  purchaseCosmeticItem,
  type ShopPageData,
} from "@/lib/actions/cosmetics.actions";
import { COSMETICS_UPDATED_EVENT } from "@/lib/cosmetics/events";
import {
  COSMETIC_RARITY_CLASS,
  COSMETIC_RARITY_LABELS,
  EQUIPPED_KEY_BY_CATEGORY,
  type CosmeticCategory,
  type ShopItem,
  type UserWalletSummary,
} from "@/lib/cosmetics/types";
import {
  getItemsForShopTab,
  SHOP_TABS,
  type ShopTab,
} from "@/lib/cosmetics/shop-catalog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CosmeticAvatar } from "@/components/cosmetics/cosmetic-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ShopPageClientProps = ShopPageData;

const emptyWallet = (): UserWalletSummary => ({
  totalExp: 0,
  creditsSpent: 0,
  availableCredits: 0,
  ownedItemIds: [],
  equipped: {},
});

export function ShopPageClient({
  viewer,
  wallet: initialWallet,
  items,
}: ShopPageClientProps) {
  const router = useRouter();
  const [wallet, setWallet] = useState(initialWallet);
  const [activeTab, setActiveTab] = useState<ShopTab>("username_effect");
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const ownedSet = useMemo(
    () => new Set(wallet?.ownedItemIds ?? []),
    [wallet?.ownedItemIds],
  );

  const handlePurchase = (itemId: string) => {
    if (!viewer) {
      toast.error("Vui lòng đăng nhập để mua vật phẩm.");
      return;
    }

    setPendingItemId(itemId);
    startTransition(async () => {
      const result = await purchaseCosmeticItem(itemId);
      setPendingItemId(null);

      if (!result.success) {
        toast.error(result.message);
        if (result.requiresSignIn) router.push("/sign-in?callbackUrl=/shop");
        return;
      }

      if (result.wallet) setWallet(result.wallet);
      toast.success(result.message);
      window.dispatchEvent(new Event(COSMETICS_UPDATED_EVENT));
      router.refresh();
    });
  };

  const handleEquip = (itemId: string) => {
    if (!viewer) return;

    setPendingItemId(itemId);
    startTransition(async () => {
      const result = await equipCosmeticItem(itemId);
      setPendingItemId(null);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (result.wallet) setWallet(result.wallet);
      toast.success(result.message);
      window.dispatchEvent(new Event(COSMETICS_UPDATED_EVENT));
      router.refresh();
    });
  };

  const isEquipped = (itemId: string, category: CosmeticCategory) => {
    const equipped = wallet?.equipped;
    if (!equipped) return false;
    return equipped[EQUIPPED_KEY_BY_CATEGORY[category]] === itemId;
  };

  const renderPreview = (item: ShopItem) => {
    if (!viewer) return null;

    if (item.category === "avatar_frame") {
      return (
        <CosmeticAvatar
          src={viewer.image || undefined}
          alt={viewer.name}
          fallback={viewer.name.charAt(0).toUpperCase() || "V"}
          frameSrc={item.imageSrc}
          frameScale={item.frameScale}
          avatarClassName="h-16 w-16"
          fallbackClassName="text-xl"
        />
      );
    }

    if (item.category === "username_effect") {
      return (
        <span className={cn("text-lg font-semibold", item.className)}>
          {viewer.name}
        </span>
      );
    }

    return (
      <div
        className={cn(
          "h-16 w-full rounded-lg border border-border/60",
          item.className,
        )}
      />
    );
  };

  const renderItemCard = (item: ShopItem, safeWallet: UserWalletSummary) => {
    const owned = ownedSet.has(item.id);
    const equipped = isEquipped(item.id, item.category);
    const canAfford = safeWallet.availableCredits >= item.cost;
    const loading = isPending && pendingItemId === item.id;

    return (
      <article
        key={item.id}
        className="flex flex-col rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn("shrink-0", COSMETIC_RARITY_CLASS[item.rarity])}
          >
            {COSMETIC_RARITY_LABELS[item.rarity]}
          </Badge>
        </div>

        <div className="mb-4 flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40 p-4">
          {renderPreview(item)}
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Giá</span>
            <span className="font-semibold text-primary">
              {item.cost.toLocaleString()} Linh Thạch
            </span>
          </div>

          {owned ? (
            <Button
              type="button"
              variant={equipped ? "secondary" : "default"}
              className="w-full gap-2"
              disabled={loading}
              onClick={() => handleEquip(item.id)}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : equipped ? (
                <Check className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {equipped ? "Đang trang bị · Gỡ" : "Trang bị"}
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full gap-2"
              disabled={loading || !canAfford}
              onClick={() => handlePurchase(item.id)}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              {canAfford ? "Mua ngay" : "Không đủ Linh Thạch"}
            </Button>
          )}
        </div>
      </article>
    );
  };

  const renderItemGrid = (
    tabItems: ShopItem[],
    safeWallet: UserWalletSummary,
  ) => {
    if (tabItems.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-border/70 py-12 text-center text-sm text-muted-foreground">
          Chưa có vật phẩm trong mục này.
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tabItems.map((item) => renderItemCard(item, safeWallet))}
      </div>
    );
  };

  const renderTabContent = (tab: ShopTab, safeWallet: UserWalletSummary) =>
    renderItemGrid(getItemsForShopTab(items, tab), safeWallet);

  if (!viewer) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-sm">
        <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-primary" />
        <h2 className="mb-2 text-2xl font-semibold">Cửa Hàng</h2>
        <p className="mb-6 text-muted-foreground">
          Đăng nhập để dùng Linh Thạch (EXP) mua trang sức.
        </p>
        <Link href="/sign-in?callbackUrl=/shop">
          <Button className="gap-2">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        </Link>
      </div>
    );
  }

  const safeWallet = wallet ?? emptyWallet();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border/70 bg-card/85 shadow-lg backdrop-blur">
        <div className="bg-gradient-to-r from-primary/70 via-violet-600/50 to-cyan-500/40 px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary-foreground/90">
                <Gem className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  Cửa Hàng
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">Linh Thạch Điện</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85">
                Hiệu ứng tên, khung avatar và nền hồ sơ — dùng Linh Thạch từ
                EXP.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-black/20 px-5 py-4 text-white backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">
                Linh Thạch khả dụng
              </p>
              <p className="text-3xl font-bold">
                {safeWallet.availableCredits.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-white/75">
                Lv.{viewer.level} · Tổng EXP{" "}
                {safeWallet.totalExp.toLocaleString()} · Đã dùng{" "}
                {safeWallet.creditsSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ShopTab)}
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary/40 p-1">
          {SHOP_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-xs sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SHOP_TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            {renderTabContent(tab.id, safeWallet)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
