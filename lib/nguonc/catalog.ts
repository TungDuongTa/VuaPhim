export type CatalogOption = {
  slug: string;
  name: string;
};

export const MOVIE_TYPES: CatalogOption[] = [
  { slug: "phim-moi-cap-nhat", name: "Mới cập nhật" },
  { slug: "phim-bo", name: "Phim bộ" },
  { slug: "phim-le", name: "Phim lẻ" },
  { slug: "tv-shows", name: "TV shows" },
  { slug: "dang-chieu", name: "Đang chiếu" },
];

export const MOVIE_GENRES: CatalogOption[] = [
  { slug: "hanh-dong", name: "Hành Động" },
  { slug: "phieu-luu", name: "Phiêu Lưu" },
  { slug: "hoat-hinh", name: "Hoạt Hình" },
  { slug: "hai", name: "Hài" },
  { slug: "hinh-su", name: "Hình Sự" },
  { slug: "tai-lieu", name: "Tài Liệu" },
  { slug: "chinh-kich", name: "Chính Kịch" },
  { slug: "gia-dinh", name: "Gia Đình" },
  { slug: "gia-tuong", name: "Giả Tưởng" },
  { slug: "lich-su", name: "Lịch Sử" },
  { slug: "kinh-di", name: "Kinh Dị" },
  { slug: "nhac", name: "Nhạc" },
  { slug: "bi-an", name: "Bí Ẩn" },
  { slug: "lang-man", name: "Lãng Mạn" },
  { slug: "khoa-hoc-vien-tuong", name: "Khoa Học Viễn Tưởng" },
  { slug: "gay-can", name: "Gây Cấn" },
  { slug: "chien-tranh", name: "Chiến Tranh" },
  { slug: "co-trang", name: "Cổ Trang" },
  { slug: "tam-ly", name: "Tâm Lý" },
  { slug: "tinh-cam", name: "Tình Cảm" },
];

export const MOVIE_COUNTRIES: CatalogOption[] = [
  { slug: "au-my", name: "Âu Mỹ" },
  { slug: "trung-quoc", name: "Trung Quốc" },
  { slug: "han-quoc", name: "Hàn Quốc" },
  { slug: "nhat-ban", name: "Nhật Bản" },
  { slug: "viet-nam", name: "Việt Nam" },
  { slug: "thai-lan", name: "Thái Lan" },
  { slug: "dai-loan", name: "Đài Loan" },
  { slug: "hong-kong", name: "Hồng Kông" },
  { slug: "an-do", name: "Ấn Độ" },
];

const currentYear = 2026;

export const MOVIE_YEARS: CatalogOption[] = Array.from(
  { length: 30 },
  (_, index) => {
    const year = String(currentYear - index);
    return { slug: year, name: year };
  },
);

export const findCatalogName = (
  options: CatalogOption[],
  slug: string,
): string => options.find((item) => item.slug === slug)?.name || slug;
