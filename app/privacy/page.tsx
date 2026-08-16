import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CONTACT_EMAIL, SITE_CONTACT } from "@/lib/site-config";
import { withSiteSuffix } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description:
    "Chính sách bảo mật của VuaPhim về thu thập, sử dụng và bảo vệ dữ liệu người dùng.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: withSiteSuffix("Chính sách bảo mật"),
    description:
      "Chính sách bảo mật của VuaPhim về thu thập, sử dụng và bảo vệ dữ liệu người dùng.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Chính sách bảo mật"
      description="Cập nhật lần cuối: tháng 8/2026"
    >
      <LegalSection title="1. Giới thiệu">
        <p>
          VuaPhim (&quot;chúng tôi&quot;, &quot;website&quot;) cam kết bảo vệ
          quyền riêng tư của người dùng. Chính sách này mô tả cách chúng tôi thu
          thập, sử dụng và bảo vệ thông tin khi bạn truy cập {SITE_CONTACT.domain}.
        </p>
      </LegalSection>

      <LegalSection title="2. Thông tin chúng tôi thu thập">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Thông tin tài khoản:</strong>{" "}
            email, tên hiển thị, ảnh đại diện khi bạn đăng ký hoặc đăng nhập
            (email/mật khẩu hoặc Google).
          </li>
          <li>
            <strong className="text-foreground">Dữ liệu sử dụng:</strong> lịch
            sử xem, danh sách theo dõi, bình luận, cấp độ và thống kê hoạt động
            trên website.
          </li>
          <li>
            <strong className="text-foreground">Dữ liệu kỹ thuật:</strong> địa
            chỉ IP, loại trình duyệt, thiết bị, cookie và log truy cập.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Cách chúng tôi sử dụng thông tin">
        <ul className="list-disc space-y-2 pl-5">
          <li>Cung cấp và cải thiện dịch vụ xem phim</li>
          <li>Quản lý tài khoản, theo dõi, lịch sử và bình luận</li>
          <li>Phân tích lưu lượng truy cập và tối ưu trải nghiệm người dùng</li>
          <li>Phòng chống lạm dụng, spam và vi phạm điều khoản</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Cookie và công nghệ theo dõi">
        <p>
          Website sử dụng cookie để duy trì phiên đăng nhập, ghi nhớ tùy chọn và
          phân tích hành vi sử dụng. Đối tác phân tích (ví dụ: Google Analytics)
          có thể đặt cookie riêng. Xem thêm tại{" "}
          <Link href="/cookies" className="text-primary hover:underline">
            Chính sách Cookie
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Chia sẻ thông tin">
        <p>
          Chúng tôi không bán dữ liệu cá nhân của bạn. Thông tin có thể được
          chia sẻ với nhà cung cấp dịch vụ (hosting, phân tích) chỉ trong phạm
          vi cần thiết để vận hành website, hoặc khi pháp luật yêu cầu.
        </p>
      </LegalSection>

      <LegalSection title="6. Bảo mật dữ liệu">
        <p>
          Chúng tôi áp dụng các biện pháp kỹ thuật hợp lý để bảo vệ dữ liệu. Tuy
          nhiên, không có phương thức truyền tải qua internet nào an toàn tuyệt
          đối.
        </p>
      </LegalSection>

      <LegalSection title="7. Quyền của người dùng">
        <p>
          Bạn có thể yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin tài khoản
          bằng cách liên hệ{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Liên hệ">
        <p>
          Mọi câu hỏi về chính sách bảo mật, vui lòng gửi email tới{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
