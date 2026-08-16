import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/site-config";
import { withSiteSuffix } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Chính sách Cookie",
  description:
    "Chính sách cookie của VuaPhim về cách website sử dụng cookie và công nghệ tương tự.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    title: withSiteSuffix("Chính sách Cookie"),
    description:
      "Chính sách cookie của VuaPhim về cách website sử dụng cookie và công nghệ tương tự.",
    url: "/cookies",
  },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Chính sách Cookie"
      description="Cập nhật lần cuối: tháng 8/2026"
    >
      <LegalSection title="1. Cookie là gì?">
        <p>
          Cookie là các tệp nhỏ được lưu trên thiết bị của bạn khi truy cập
          website. Cookie giúp website ghi nhớ phiên đăng nhập, tùy chọn và cải
          thiện trải nghiệm sử dụng.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookie chúng tôi sử dụng">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Cookie cần thiết:</strong> duy
            trì đăng nhập, bảo mật phiên và chức năng cốt lõi của website.
          </li>
          <li>
            <strong className="text-foreground">Cookie phân tích:</strong> giúp
            hiểu cách người dùng sử dụng website (ví dụ: Google Analytics).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Cookie của bên thứ ba">
        <p>
          Các đối tác phân tích (ví dụ: Google Analytics) có thể đặt cookie riêng
          khi bạn sử dụng website. Bạn có thể tìm hiểu thêm tại trang chính sách
          của từng đối tác.
        </p>
      </LegalSection>

      <LegalSection title="4. Quản lý cookie">
        <p>
          Bạn có thể xóa hoặc chặn cookie trong cài đặt trình duyệt. Lưu ý rằng
          việc tắt cookie cần thiết có thể ảnh hưởng tới khả năng đăng nhập và
          sử dụng một số tính năng.
        </p>
      </LegalSection>

      <LegalSection title="5. Liên hệ">
        <p>
          Câu hỏi về cookie? Xem thêm{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Chính sách bảo mật
          </Link>{" "}
          hoặc email{" "}
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
