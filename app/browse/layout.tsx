import type { Metadata } from "next";
import { BROWSE_DESCRIPTION } from "@/lib/browse-params";
import { withSiteSuffix } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Khám phá",
  description: BROWSE_DESCRIPTION,
  alternates: {
    canonical: "/browse",
  },
  openGraph: {
    title: withSiteSuffix("Khám phá"),
    description: BROWSE_DESCRIPTION,
    url: "/browse",
  },
  twitter: {
    title: withSiteSuffix("Khám phá"),
    description: BROWSE_DESCRIPTION,
  },
};

export default function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
