import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CONTACT_EMAIL, SITE_CONTACT } from "@/lib/site-config";
import { withSiteSuffix } from "@/lib/seo";

export const metadata: Metadata = {
  title: "DMCA",
  description:
    "Chính sách gỡ bỏ nội dung theo yêu cầu bản quyền (DMCA) của VuaPhim.",
  alternates: { canonical: "/dmca" },
  openGraph: {
    title: withSiteSuffix("DMCA"),
    description:
      "Chính sách gỡ bỏ nội dung theo yêu cầu bản quyền (DMCA) của VuaPhim.",
    url: "/dmca",
  },
};

export default function DmcaPage() {
  return (
    <LegalPage
      title="Chính sách DMCA / Bản quyền"
      description="Chúng tôi tôn trọng quyền sở hữu trí tuệ và xử lý yêu cầu gỡ bỏ nội dung hợp lệ."
    >
      <LegalSection title="1. Cam kết">
        <p>
          VuaPhim tôn trọng bản quyền của tác giả, nhà sản xuất và các bên liên
          quan. Nếu bạn tin rằng nội dung trên website vi phạm quyền sở hữu trí
          tuệ của bạn, vui lòng gửi thông báo gỡ bỏ theo hướng dẫn dưới đây.
        </p>
      </LegalSection>

      <LegalSection title="2. Thông tin cần có trong yêu cầu">
        <ul className="list-disc space-y-2 pl-5">
          <li>Họ tên và thông tin liên hệ của người gửi yêu cầu</li>
          <li>
            Mô tả tác phẩm bị vi phạm bản quyền và bằng chứng bạn là chủ sở hữu
            hoặc được ủy quyền hợp pháp
          </li>
          <li>URL cụ thể trên VuaPhim cần gỡ bỏ (trang phim/tập)</li>
          <li>
            Tuyên bố thiện chí rằng việc sử dụng nội dung chưa được phép bởi chủ
            sở hữu bản quyền
          </li>
          <li>
            Tuyên bố rằng thông tin trong yêu cầu là chính xác, dưới hình phạt
            của pháp luật
          </li>
          <li>Chữ ký điện tử hoặc chữ ký vật lý của người gửi</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Gửi yêu cầu">
        <p>
          Gửi email tới{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=DMCA%20Request%20-%20VuaPhim`}
            className="font-medium text-primary hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          với tiêu đề:{" "}
          <strong className="text-foreground">DMCA Request - VuaPhim</strong>.
        </p>
      </LegalSection>

      <LegalSection title="4. Quy trình xử lý">
        <p>
          Sau khi nhận yêu cầu hợp lệ, chúng tôi sẽ xem xét và có thể gỡ hoặc vô
          hiệu hóa quyền truy cập tới nội dung bị khiếu nại trong thời gian hợp
          lý. Chúng tôi có thể liên hệ lại nếu cần thêm thông tin.
        </p>
      </LegalSection>

      <LegalSection title="5. Lưu ý">
        <p>
          Yêu cầu sai sự thật hoặc lạm dụng quy trình DMCA có thể dẫn tới trách
          nhiệm pháp lý theo quy định hiện hành. Nguồn phát phim được cung cấp
          bởi bên thứ ba ({SITE_CONTACT.domain} không tự lưu trữ tập tin video).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
