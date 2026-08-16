import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, ShieldAlert } from "lucide-react";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/site-config";
import { withSiteSuffix } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Liên hệ VuaPhim để được hỗ trợ, góp ý hoặc gửi yêu cầu bản quyền.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: withSiteSuffix("Liên hệ"),
    description:
      "Liên hệ VuaPhim để được hỗ trợ, góp ý hoặc gửi yêu cầu bản quyền.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Liên hệ"
      description="Chúng tôi luôn sẵn sàng lắng nghe phản hồi từ bạn."
    >
      <LegalSection title="Email hỗ trợ">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p>Gửi email trực tiếp cho đội ngũ VuaPhim:</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-2 inline-block text-base font-semibold text-primary hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Các loại yêu cầu">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Hỗ trợ người dùng</p>
              <p>
                Báo lỗi trang, lỗi đăng nhập, vấn đề phát video hoặc các câu hỏi
                khác về tài khoản.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Bản quyền / DMCA</p>
              <p>
                Nếu bạn là chủ sở hữu nội dung và muốn gỡ bỏ tác phẩm, vui lòng
                xem trang{" "}
                <Link href="/dmca" className="text-primary hover:underline">
                  DMCA
                </Link>{" "}
                và gửi yêu cầu kèm đầy đủ thông tin xác minh.
              </p>
            </div>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Thời gian phản hồi">
        <p>
          Chúng tôi cố gắng phản hồi trong vòng 1–3 ngày làm việc. Các yêu cầu
          bản quyền hợp lệ sẽ được ưu tiên xử lý.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
