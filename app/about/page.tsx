import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CONTACT_EMAIL, SITE_CONTACT } from "@/lib/site-config";
import { withSiteSuffix } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Giới thiệu về VuaPhim - nền tảng xem phim bộ, phim lẻ và TV shows online tại Việt Nam.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: withSiteSuffix("Giới thiệu"),
    description:
      "Giới thiệu về VuaPhim - nền tảng xem phim bộ, phim lẻ và TV shows online tại Việt Nam.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <LegalPage
      title="Giới thiệu VuaPhim"
      description="VuaPhim là nền tảng xem phim trực tuyến dành cho cộng đồng yêu thích phim bộ, phim lẻ và TV shows."
    >
      <LegalSection title="Chúng tôi là ai">
        <p>
          VuaPhim ({SITE_CONTACT.domain}) cung cấp trải nghiệm xem phim trực
          tuyến với giao diện hiện đại, cập nhật nội dung thường xuyên và bảng
          xếp hạng theo lượt xem. Người dùng có thể khám phá phim, theo dõi tiến
          độ xem, lưu danh sách yêu thích và tham gia bình luận cùng cộng đồng.
        </p>
      </LegalSection>

      <LegalSection title="Tính năng chính">
        <ul className="list-disc space-y-2 pl-5">
          <li>Khám phá phim bộ, phim lẻ, TV shows theo thể loại, quốc gia và năm</li>
          <li>Theo dõi phim yêu thích và lịch sử xem cá nhân</li>
          <li>Hệ thống cấp độ và cửa hàng trang sức cho khán giả tích cực</li>
          <li>Bình luận và tương tác cộng đồng trên từng bộ phim</li>
        </ul>
      </LegalSection>

      <LegalSection title="Liên hệ">
        <p>
          Mọi góp ý, hợp tác hoặc yêu cầu hỗ trợ, vui lòng liên hệ qua email:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-primary hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
