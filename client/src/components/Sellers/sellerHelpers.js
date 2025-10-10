const PUB = import.meta.env.VITE_PUBLIC_URL || "";

export const BG_COVERS = [
  `${PUB}/assets/images/sallers-cover-1.png`,
  `${PUB}/assets/images/sallers-cover-6.png`,
  `${PUB}/assets/images/sallers-cover-2.png`,
  `${PUB}/assets/images/sallers-cover-3.png`,
  `${PUB}/assets/images/sallers-cover-4.png`,
  `${PUB}/assets/images/sallers-cover-5.png`,
];

const AVATARS = [
  `${PUB}/assets/images/saller-8.png`,
  `${PUB}/assets/images/saller-7.png`,
  `${PUB}/assets/images/saller-9.png`,
  `${PUB}/assets/images/saller-6.png`,
  `${PUB}/assets/images/saller-1.png`,
  `${PUB}/assets/images/saller-2.png`,
];

const pickFirstImage = (images) => {
  if (!Array.isArray(images) || !images.length) return null;
  const i = images[0] || {};
  return i.thumbnail || i.url || i.webp || null;
};

const safe = (v, fb = "—") => (v == null || `${v}`.trim() === "" ? fb : v);

/** API item -> UI ViewModel */
export const buildSellerVM = (s = {}, idx = 0, coverList = BG_COVERS) => {
  const avatarFromApi = pickFirstImage(s?.images);
  const avatar = avatarFromApi || AVATARS[idx % AVATARS.length];

  const title = safe(s?.companyName) !== "—" ? safe(s?.companyName) : safe(s?.contactName, "Seller");
  const email = safe(s?.email);
  const phone = safe(s?.phone);
  const addressText = "—";

  const key = s?._id || s?.id || `seller-${idx}`;
  const slugOrId = s?.slug || s?._id || s?.id || "";
  const detailPath = `/saller-page/${slugOrId}`; // mevcut route'a uyumlu

  return {
    key,
    title,
    email,
    phone,
    addressText,
    coverUrl: coverList[idx % coverList.length],
    avatarUrl: avatar,
    rating: typeof s?.rating === "number" ? s.rating : 4.7,
    detailPath,
  };
};

/** Loading için sadece sayı listesi döndür */
export const loadingArray = (n = 4) => Array.from({ length: n }, (_, i) => i);
