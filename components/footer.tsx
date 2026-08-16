import Link from "next/link";
import { buildBrowseHref } from "@/lib/browse-params";
import { CONTACT_EMAIL } from "@/lib/site-config";

export function Footer() {
  const currentYear = 2026;
  const footerLinks = {
    browse: [
      { label: "Phim bộ", href: buildBrowseHref({ type: "phim-bo" }) },
      { label: "Phim lẻ", href: buildBrowseHref({ type: "phim-le" }) },
      { label: "TV shows", href: buildBrowseHref({ type: "tv-shows" }) },
      { label: "Đang chiếu", href: buildBrowseHref({ type: "dang-chieu" }) },
      { label: "Khám phá", href: "/browse" },
    ],
    genres: [
      { label: "Hành động", href: buildBrowseHref({ genre: "hanh-dong" }) },
      { label: "Tình cảm", href: buildBrowseHref({ genre: "tinh-cam" }) },
      { label: "Cổ trang", href: buildBrowseHref({ genre: "co-trang" }) },
      { label: "Kinh dị", href: buildBrowseHref({ genre: "kinh-di" }) },
    ],
    community: [
      { label: "Giới thiệu", href: "/about" },
      { label: "Liên hệ", href: "/contact" },
      { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    ],
    legal: [
      { label: "Điều khoản sử dụng", href: "/terms" },
      { label: "Chính sách bảo mật", href: "/privacy" },
      { label: "DMCA", href: "/dmca" },
      { label: "Chính sách Cookie", href: "/cookies" },
    ],
  };

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center">
              <span className="brand-pink-mask text-xl font-bold md:text-3xl">
                VuaPhim
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Điểm đến lý tưởng để xem phim bộ, phim lẻ và TV shows được cập
              nhật mỗi ngày.
            </p>
          </div>
          {(
            [
              ["Khám phá", footerLinks.browse],
              ["Thể loại", footerLinks.genres],
              ["Cộng đồng", footerLinks.community],
              ["Chính sách", footerLinks.legal],
            ] as const
          ).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 font-semibold text-foreground">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {currentYear} Vuaphim. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Movie metadata and streams are provided by third-party sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
