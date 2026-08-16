import type { Metadata } from "next";
import { Suspense } from "react";
import { getSessionUser } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { PageFallback } from "@/components/page-fallback";

export const metadata: Metadata = {
  title: "Tài khoản",
  description: "Hãy đăng nhập để lưu danh sách theo dõi và lịch sử xem của bạn",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<PageFallback />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}

async function AuthGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/");
  }
  return (
    <main>
      <section className="font-sans antialiased">{children}</section>
    </main>
  );
}
