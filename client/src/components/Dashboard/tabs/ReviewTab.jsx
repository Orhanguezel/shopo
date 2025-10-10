// src/components/Auth/Profile/tabs/ReviewTab.jsx
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Star from "@/components/Helpers/icons/Star";
import {
  useListCommentsForContentQuery,
  useListMyCommentsQuery, // ✅ kendi yorumlarım (auth) için
} from "@/api-manage/api-call-functions/public/publicComment.api";
import { useGetProductReviewStatsQuery } from "@/api-manage/api-call-functions/public/publicReviews.api";
import { useMeQuery } from "@/api-manage/api-call-functions/public/publicAuth.api";

/* ------------------------ helpers ------------------------ */
function Stars({ value = 0 }) {
  const n = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <div className="flex">
      {Array.from({ length: n }).map((_, i) => (
        <span key={`full-${i}`}><Star /></span>
      ))}
      {Array.from({ length: 5 - n }).map((_, i) => (
        <span key={`empty-${i}`} className="opacity-30"><Star /></span>
      ))}
    </div>
  );
}
Stars.propTypes = { value: PropTypes.number };

function ProductStars({ productId }) {
  const { data: stats } = useGetProductReviewStatsQuery(productId, { skip: !productId });
  const avg =
    stats?.avg ??
    stats?.average ??
    stats?.ratingAvg ??
    stats?.averageRating ??
    stats?.rating ??
    0;
  return <Stars value={avg} />;
}
ProductStars.propTypes = { productId: PropTypes.string };

const fmtDate = (d) => {
  try {
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" })
      .format(new Date(d));
  } catch {
    return "—";
  }
};

const resolveImg = (item) => {
  const base = import.meta.env.VITE_PUBLIC_URL || "";
  const p = item?.product || item?.contentId || {};
  const raw =
    p?.thumbnail ||
    (Array.isArray(p?.images) && p.images[0]) ||
    item?.images?.[0] ||
    "/assets/images/placeholder.png";
  if (/^https?:\/\//i.test(String(raw))) return raw;
  if (!raw.startsWith("/") && !base.endsWith("/")) return `${base}/${raw}`;
  return `${base}${raw}`;
};

// 0..1'i 1..5'e ölçekle, 1..5'i yuvarla
const normalizeToFive = (v) => {
  let n = Number(v) || 0;
  if (n > 0 && n <= 1) n = n * 5;
  if (n > 5) n = 5;
  if (n > 0 && n < 1) n = 1;
  return Math.round(n);
};
const getStarsFromItem = (rv) => {
  const pool = [rv?.rating, rv?.stars, rv?.star, rv?.rate, rv?.score].map((v) => Number(v));
  if (typeof rv?.label === "string") {
    const m = rv.label.match(/rating\s*:\s*(\d+(\.\d+)?)/i);
    if (m) pool.push(Number(m[1]));
  }
  const first = pool.find((v) => v && v > 0);
  return first ? normalizeToFive(first) : 0;
};

/** 
 * Ürün sayfasındaki yorum+puanları burada göster:
 * - productId varsa: o ürüne ait public comment+review listesi
 * - yoksa: giriş yapmış kullanıcının tüm comment+review kayıtları (/comment/user/me)
 */
export default function ReviewTab({ className = "", productId, limit = 6 }) {
  // me sadece productId YOKSA lazım (kullanıcı yorumlarını çekerken)
  const { data: me, isLoading: meLoading } = useMeQuery(undefined, { skip: !!productId });
  const meId = me?._id || me?.id;

  /* ---------- data fetch ---------- */
  // 1) Ürün özel liste
  const shouldFetchProduct = Boolean(productId);
  const {
    data: productList,
    isLoading: productLoading,
    isError: productError,
  } = useListCommentsForContentQuery(
    shouldFetchProduct ? { contentType: "product", contentId: productId, page: 1, limit } : {},
    { skip: !shouldFetchProduct }
  );

  // 2) Kullanıcının kendi yorumları (auth)
  const shouldFetchMine = !productId;
  const {
    data: mineList,
    isLoading: mineLoading,
    isError: mineError,
  } = useListMyCommentsQuery(
    shouldFetchMine ? { page: 1, limit } : {},
    { skip: !shouldFetchMine }
  );

  // normalize items
  const rawItems = productId
    ? (productList?.items ?? productList?.data ?? [])
    : (mineList?.items ?? mineList?.data ?? []);

  const loading = productId ? productLoading : (meLoading || mineLoading);
  const error = productId ? productError : mineError;

  if (!productId && !meId) {
    if (meLoading) {
      return <div className="text-sm text-qgray">Yükleniyor…</div>;
    }
    return <div className="text-sm text-qgray">Giriş yapmadığınız için yorumlarınız listelenemiyor.</div>;
  }

  if (loading) {
    return (
      <div className="review-tab-wrapper w-full">
        <div className="grid grid-cols-2 gap-8">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={`sk-${i}`} className="w-full h-[170px] bg-white border rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">Yorumlar yüklenemedi.</div>;
  }

  if (!rawItems?.length) {
    return (
      <div className="text-sm text-qgray">
        {productId ? "Bu ürün için henüz yorum yok." : "Henüz yorumunuz bulunmuyor."}
      </div>
    );
  }

  return (
    <div className="review-tab-wrapper w-full">
      <div className="grid grid-cols-2 gap-8">
        {rawItems.map((c) => {
          const prod = c?.product || c?.contentId || {};
          const pid =
            prod?._id || prod?.id || c?.productId || (typeof c?.contentId === "string" ? c.contentId : "");
          const pslug = prod?.slug;
          const ptitle = prod?.title || c?.title || "Comment";

          // önce kaydın rating'i, yoksa ürün ortalaması
          const itemStars = getStarsFromItem(c);
          const StarsBlock = itemStars > 0 ? <Stars value={itemStars} /> : <ProductStars productId={pid} />;

          return (
            <div key={c._id || c.id} className="item">
              <div
                style={{ boxShadow: "0px 15px 64px rgba(0, 0, 0, 0.05)" }}
                className={`product-row-card-style-one w-full h-[170px] bg-white group relative overflow-hidden ${className}`}
              >
                <div className="flex space-x-2 items-center w-full h-full p-2">
                  <div className="w-1/3 h-full">
                    <img
                      src={resolveImg(c)}
                      alt={ptitle}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-center h-full">
                    <div>
                      <span className="text-qgray text-sm mb-1.5 block">
                        {fmtDate(c?.createdAt)}
                      </span>

                      <div className="mb-1.5">{StarsBlock}</div>

                      <Link to={pslug ? `/product/${pslug}` : "/single-product"}>
                        <p className="title mb-2 sm:text-[15px] text-[13px] font-600 text-qblack leading-[24px] line-clamp-1 hover:text-blue-600">
                          {ptitle}
                        </p>
                      </Link>

                      <p className="text-sm text-qgray line-clamp-2">
                        {c?.content || c?.comment || c?.text || "—"}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

ReviewTab.propTypes = {
  className: PropTypes.string,
  productId: PropTypes.string,
  limit: PropTypes.number,
};
