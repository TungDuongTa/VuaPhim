import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CONTACT_EMAIL, SITE_CONTACT } from "@/lib/site-config";
import { withSiteSuffix } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: "Điều khoản sử dụng dịch vụ của VuaPhim.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: withSiteSuffix("Điều khoản sử dụng"),
    description: "Điều khoản sử dụng dịch vụ của VuaPhim.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Điều khoản sử dụng"
      description="Cập nhật lần cuối: tháng 8/2026"
    >
      <LegalSection title="1. Chấp nhận điều khoản">
        <p>
          Bằng việc truy cập và sử dụng VuaPhim ({SITE_CONTACT.domain}), bạn
          đồng ý tuân thủ các điều khoản này. Nếu không đồng ý, vui lòng ngừng
          sử dụng website.
        </p>
      </LegalSection>

      <LegalSection title="2. Dịch vụ">
        <p>
          VuaPhim cung cấp nền tảng khám phá và xem phim trực tuyến. Việc xem
          phim là công khai; một số tính năng (bình luận, theo dõi, cửa hàng)
          yêu cầu đăng nhập tài khoản.
        </p>
      </LegalSection>

      <LegalSection title="3. Tài khoản người dùng">
        <ul className="list-disc space-y-2 pl-5">
          <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
          <li>
            Không sử dụng website cho mục đích bất hợp pháp, spam, quấy rối hoặc
            phá hoại hệ thống.
          </li>
          <li>
            Chúng tôi có quyền tạm khóa hoặc xóa tài khoản vi phạm điều khoản.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Nội dung và bản quyền">
        <p>
          Metadata, poster và nguồn phát phim thuộc quyền sở hữu của các nhà sản
          xuất hoặc bên cung cấp bên thứ ba. VuaPhim không tuyên bố sở hữu nội
          dung đó. Nếu bạn là chủ sở hữu bản quyền và muốn gỡ nội dung, vui lòng
          gửi yêu cầu qua trang{" "}
          <Link href="/dmca" className="text-primary hover:underline">
            DMCA
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Bình luận và hành vi cộng đồng">
        <p>
          Người dùng chịu trách nhiệm về nội dung bình luận do mình đăng. Chúng
          tôi có quyền xóa bình luận vi phạm pháp luật, bản quyền, ngôn từ thù
          ghét hoặc nội dung không phù hợp.
        </p>
      </LegalSection>

      <LegalSection title="6. Miễn trừ trách nhiệm">
        <p>
          Dịch vụ được cung cấp &quot;nguyên trạng&quot;. Chúng tôi không đảm
          bảo website luôn hoạt động liên tục, không lỗi hoặc phù hợp với mọi
          mục đích sử dụng.
        </p>
      </LegalSection>

      <LegalSection title="7. Thay đổi điều khoản">
        <p>
          Chúng tôi có thể cập nhật điều khoản này bất cứ lúc nào. Việc tiếp tục
          sử dụng website sau khi có thay đổi đồng nghĩa bạn chấp nhận điều
          khoản mới.
        </p>
      </LegalSection>

      <LegalSection title="8. Liên hệ">
        <p>
          Liên hệ:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
