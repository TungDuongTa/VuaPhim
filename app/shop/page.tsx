import type { Metadata } from "next";
import { Suspense } from "react";
import { getShopPageData } from "@/lib/actions/cosmetics.actions";
import { ShopPageClient } from "@/components/shop/shop-page-client";
import { PageFallback } from "@/components/page-fallback";
import { withSiteSuffix } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cửa Hàng",
  description:
    "Dùng Linh Thạch (EXP) để mua trang sức tu tiên cho hồ sơ và bình luận.",
  alternates: { canonical: "/shop" },
  robots: { index: false, follow: false },
  openGraph: {
    title: withSiteSuffix("Cửa Hàng"),
    description:
      "Dùng Linh Thạch (EXP) để mua trang sức tu tiên cho hồ sơ và bình luận.",
    url: "/shop",
  },
};

export default function ShopPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ShopPageContent />
    </Suspense>
  );
}

async function ShopPageContent() {
  const data = await getShopPageData();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,oklch(0.24_0.08_250/.35),transparent_55%),radial-gradient(circle_at_bottom_right,oklch(0.22_0.08_180/.25),transparent_55%)]">
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <ShopPageClient {...data} />
      </main>
    </div>
  );
}
