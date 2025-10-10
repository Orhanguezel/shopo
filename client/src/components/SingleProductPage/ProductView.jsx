// src/components/SingleProductPage/ProductView.jsx
import PropTypes from "prop-types";
import { useMemo, useState, useEffect } from "react";
import Selectbox from "@/components/Helpers/Selectbox";
import Star from "@/components/Helpers/icons/Star";
import useAddToCart from "@/hooks/useAddToCart";
import {
  pickImageUrl,
  pickPrices,
  pickTitle,
  getProductId,
  pickVariantId as _pickVariantId,
  fmtMoney,
  getSessionId,
  isObjectId,
} from "@/utils/product.helpers";
import {
  useGetProductReviewStatsQuery,
  useCreatePublicReviewMutation,
} from "@/api-manage/api-call-functions/public/publicReviews.api";
import {
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} from "@/api-manage/api-call-functions/public/publicWishlist.api";
import { useReportProductMutation } from "@/api-manage/api-call-functions/public/publicReports.api";
import { useGetCompanyInfoQuery } from "@/api-manage/api-call-functions/public/publicCompany.api";
import { toast } from "react-toastify";

const normalizeType = (t) => {
  const raw = String(t || "product").toLowerCase().trim();
  const map = {
    simple: "product",
    normal: "product",
    default: "product",
    spare: "sparepart",
    "spare-part": "sparepart",
    "spare_part": "sparepart",
    menu: "menuitem",
    "menu-item": "menuitem",
    "menu_item": "menuitem",
  };
  const candidate = map[raw] || raw;
  return ["product", "ensotekprod", "sparepart", "menuitem"].includes(candidate)
    ? candidate
    : "product";
};

const labelOf = (v) => {
  if (!v) return "—";
  if (typeof v === "string") return v;
  if (typeof v?.name === "string") return v.name;
  if (typeof v?.title === "string") return v.title;
  return "—";
};

export default function ProductView({
  className = "",
  product,
  loading = false,
}) {
  // --- basic fields & fallbacks ---
  const title = pickTitle(product) || "—";
  const mainImg =
    pickImageUrl(product) ||
    `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;

  const { main, offer } = pickPrices(product);
  const pid = getProductId(product);
  const validPid = isObjectId(pid) ? pid : undefined;

  /* ===== Reviews (stats + create rating) ===== */
  const { data: stats, refetch } = useGetProductReviewStatsQuery(validPid, {
    skip: !validPid,
  });
  const [createReview, { isLoading: sendingRating }] =
    useCreatePublicReviewMutation();

  const avg =
    typeof stats?.avg === "number"
      ? stats.avg
      : Number(product?.rating ?? 0);
  const count =
    typeof stats?.count === "number"
      ? stats.count
      : Number(product?.reviewCount ?? 0);

  const [hoverRating, setHoverRating] = useState(0);
  const displayedFilled = hoverRating || Math.round(Number(avg) || 0);

  const handleRate = async (val) => {
    if (!validPid) return toast.error("Ürün ID geçersiz.");
    try {
      await createReview({ product: validPid, rating: val }).unwrap();
      toast.success("Puanınız kaydedildi");
      await refetch?.();
    } catch (e) {
      toast.error(e?.data?.message || e?.error || "Puan gönderilemedi");
    }
  };

  /* ===== Variants / images ===== */
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    _pickVariantId(product)
  );
  useEffect(() => {
    setSelectedVariantId(_pickVariantId(product));
  }, [product]);

  const [quantity, setQuantity] = useState(1);

  const images = useMemo(() => {
    const arr = [];
    if (product?.image) arr.push(pickImageUrl(product));
    if (Array.isArray(product?.images))
      product.images.forEach((im) =>
        arr.push(pickImageUrl({ image: im }))
      );
    if (Array.isArray(product?.gallery))
      product.gallery.forEach((im) =>
        arr.push(pickImageUrl({ image: im }))
      );
    return [...new Set(arr)].filter(Boolean);
  }, [product]);

  /* ===== Add to cart ===== */
  const [addToCart, { isLoading: adding }] = useAddToCart();
  const productType = normalizeType(
    product?.productType || product?.product_type
  );

  const onAdd = async () => {
    try {
      await addToCart(product, quantity, {
        productType,
        ...(selectedVariantId ? { variant: selectedVariantId } : {}),
      });
      toast.success("Sepete eklendi 👍");
    } catch (e) {
      const msg = e?.data?.message || e?.message || "Sepete eklenemedi";
      toast.error(msg);
    }
  };

  /* ===== Wishlist ===== */
  const [addWish, { isLoading: addingWish }] = useAddWishlistItemMutation();
  const [removeWish, { isLoading: removingWish }] =
    useRemoveWishlistItemMutation();
  const [isWished, setIsWished] = useState(false);

  const onToggleWishlist = async () => {
    if (!validPid) return toast.error("Ürün ID geçersiz.");
    const session = getSessionId();
    if (!session) return toast.error("Oturum oluşturulamadı.");
    try {
      if (isWished) {
        await removeWish({ session, product: validPid }).unwrap();
        setIsWished(false);
        toast.info("Favorilerden çıkarıldı");
      } else {
        await addWish({ session, product: validPid }).unwrap();
        setIsWished(true);
        toast.success("Favorilere eklendi ♥");
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.error || "İşlem başarısız");
    }
  };
  const wishBusy = addingWish || removingWish;

  /* ===== Report this item (inline) ===== */
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportProduct, { isLoading: reporting }] =
    useReportProductMutation();

  const submitReport = async () => {
    if (!validPid) return toast.error("Ürün ID geçersiz.");
    if (!reportReason) return toast.error("Lütfen bir neden seçin.");
    try {
      await reportProduct({
        productId: validPid,
        reason: reportReason,
        details: reportDetails || undefined,
      }).unwrap();
      toast.success("Raporunuz alındı, teşekkürler.");
      setShowReport(false);
      setReportReason("");
      setReportDetails("");
    } catch (e) {
      toast.error(e?.data?.message || e?.error || "Rapor gönderilemedi");
    }
  };

  /* ===== Share this item (company → socialLinks) ===== */
  const { data: company } = useGetCompanyInfoQuery();
  const social = company?.socialLinks || company?.social || {};
  const pageUrl =
    typeof window !== "undefined" && window.location
      ? window.location.href
      : "";
  const enc = (s) => encodeURIComponent(s || "");
  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${enc(
    pageUrl
  )}`;
  const twShare = `https://twitter.com/intent/tweet?url=${enc(
    pageUrl
  )}&text=${enc(title)}`;
  const pinShare = `https://pinterest.com/pin/create/button/?url=${enc(
    pageUrl
  )}&media=${enc(mainImg)}&description=${enc(title)}`;

  return (
    <div className={`product-view w-full lg:flex justify-between ${className}`}>
      {/* images */}
      <div data-aos="fade-right" className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
        <div className="w-full">
          <div className="w-full h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3 bg-white">
            {loading ? (
              <div className="text-qgray">Loading…</div>
            ) : (
              <img
                src={mainImg}
                alt={title}
                className="object-contain max-h-full"
                onError={(e) => {
                  e.currentTarget.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
                }}
              />
            )}
          </div>

          {!!images.length && (
            <div className="flex gap-2 flex-wrap">
              {images.map((src, idx) => (
                <div
                  key={src + idx}
                  className="w-[110px] h-[110px] p-[15px] border border-qgray-border cursor-pointer bg-white"
                >
                  <img
                    src={src}
                    alt={title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* details */}
      <div className="flex-1">
        <div className="product-details w-full mt-10 lg:mt-0">
          <span
            data-aos="fade-up"
            className="text-qgray text-xs font-normal uppercase tracking-wider mb-2 inline-block"
          >
            {labelOf(product?.category)}
          </span>

          <p data-aos="fade-up" className="text-xl font-medium text-qblack mb-4">
            {title}
          </p>

          {/* rating block */}
          <div
            data-aos="fade-up"
            className="flex space-x-[10px] items-center mb-6"
          >
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => {
                const val = i + 1;
                const filled = val <= displayedFilled;
                return (
                  <button
                    key={`rate-${val}`}
                    type="button"
                    className={`p-0 m-0 leading-none ${filled ? "text-qyellow" : "text-qgray opacity-40"
                      }`}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(val)}
                    disabled={!validPid || sendingRating}
                    aria-label={`Rate ${val}`}
                    title={
                      count > 0
                        ? `Ortalama: ${Number(avg || 0).toFixed(1)} (${count})`
                        : `Puan ver: ${val}`
                    }
                  >
                    <Star />
                  </button>
                );
              })}
            </div>
            <span className="text-[13px] font-normal text-qblack">
              {count} Reviews
            </span>
          </div>

          <div data-aos="fade-up" className="flex space-x-2 items-center mb-7">
            {main ? (
              <span className="text-sm font-500 text-qgray line-through mt-1">
                €{fmtMoney(main)}
              </span>
            ) : null}
            <span className="text-2xl font-500 text-qred">
              €{fmtMoney(offer)}
            </span>
          </div>

          {!!variants.length && (
            <div data-aos="fade-up" className="product-size mb-[30px]">
              <span className="text-sm font-normal uppercase text-qgray mb-[14px] inline-block">
                OPTIONS
              </span>
              <div className="w-full">
                <div className="border border-qgray-border h-[50px] flex justify-between items-center px-6 cursor-pointer">
                  <Selectbox
                    className="w-full"
                    value={selectedVariantId}
                    onChange={(v) => setSelectedVariantId(v)}
                    datas={variants.map((v) => ({
                      label: v?.name || v?.title || v?.sku || v?._id || v?.id,
                      value: v?._id || v?.id,
                    }))}
                  >
                    {({ item }) => (
                      <>
                        <div>
                          <span className="text-[13px] text-qblack">
                            {item?.label}
                          </span>
                        </div>
                        <div className="flex space-x-10 items-center">
                          <span className="text-[13px] text-qblack">
                            {item?.value?.slice?.(0, 6)}
                          </span>
                          <span>▾</span>
                        </div>
                      </>
                    )}
                  </Selectbox>
                </div>
              </div>
            </div>
          )}

          {/* quantity + add to cart + wishlist */}
          <div
            data-aos="fade-up"
            className="quantity-card-wrapper w-full flex items-center h-[50px] space-x-[10px] mb-[30px]"
          >
            <div className="w-[120px] h-full px-[26px] flex items-center border border-qgray-border">
              <div className="flex justify-between items-center w-full">
                <button
                  type="button"
                  className="text-base text-qgray"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="text-qblack">{quantity}</span>
                <button
                  type="button"
                  className="text-base text-qgray"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="w-[60px] h-full flex justify-center items-center border border-qgray-border">
              <button
                type="button"
                aria-label="wishlist"
                aria-pressed={isWished}
                onClick={onToggleWishlist}
                disabled={wishBusy || !validPid}
                className={`text-lg ${isWished ? "text-qred" : "text-qgray"
                  } disabled:opacity-60`}
                title={isWished ? "Favorilerden çıkar" : "Favorilere ekle"}
              >
                {isWished ? "♥" : "♡"}
              </button>
            </div>

            <div className="flex-1 h-full">
              <button
                type="button"
                onClick={onAdd}
                disabled={adding || !pid}
                className="black-btn text-sm font-semibold w-full h-full disabled:opacity-60"
              >
                {adding ? "Ekleniyor…" : "Add To Cart"}
              </button>
            </div>
          </div>

          {/* meta */}
          <div data-aos="fade-up" className="mb-[10px]">
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">Category :</span>{" "}
              {labelOf(product?.category)}
            </p>
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">Brand :</span>{" "}
              {labelOf(product?.brand)}
            </p>
            {product?.tags?.length ? (
              <p className="text-[13px] text-qgray leading-7">
                <span className="text-qblack">Tags :</span>{" "}
                {product.tags.join(", ")}
              </p>
            ) : null}
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">SKU:</span>{" "}
              {product?.sku || "—"}
            </p>
          </div>

          {/* report + share */}
          <div data-aos="fade-up" className="mb-[8px] flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="inline-block">
              <path d="M3 2v16M4 3h9l-2 3 2 3H4V3Z" stroke="#E12828" strokeWidth="2" />
            </svg>
            <button
              type="button"
              onClick={() => setShowReport((v) => !v)}
              className="text-qred font-semibold text-[13px]"
            >
              Report This Item
            </button>
          </div>

          {/* Share row */}
          <div data-aos="fade-up" className="social-share flex items-center w-full mb-[20px]">
            <span className="text-qblack text-[13px] mr-[17px] inline-block">Share This</span>
            <div className="flex space-x-5 items-center">
              {social?.facebook && (
                <a href={fbShare} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                  <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 16V9H0V6H3V4C3 1.3 4.7 0 7.1 0C8.3 0 9.2 0.1 9.5 0.1V2.9H7.8C6.5 2.9 6.2 3.5 6.2 4.4V6H10L9 9H6.3V16H3Z" fill="#3E75B2" />
                  </svg>
                </a>
              )}
              {mainImg && (
                <a href={pinShare} target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.6 0 0 3.6 0 8C0 11.4 2.1 14.3 5.1 15.4C5 14.8 5 13.8 5.1 13.1C5.2 12.5 6 9.1 6 9.1C6 9.1 5.8 8.7 5.8 8C5.8 6.9 6.5 6 7.3 6C8 6 8.3 6.5 8.3 7.1C8.3 7.8 7.9 8.8 7.6 9.8C7.4 10.6 8 11.2 8.8 11.2C10.2 11.2 11.3 9.7 11.3 7.5C11.3 5.6 9.9 4.2 8 4.2C5.7 4.2 4.4 5.9 4.4 7.7C4.4 8.4 4.7 9.1 5 9.5C5 9.7 5 9.8 5 9.9C4.9 10.2 4.8 10.7 4.8 10.8C4.8 10.9 4.7 11 4.5 10.9C3.5 10.4 2.9 9 2.9 7.8C2.9 5.3 4.7 3 8.2 3C11 3 13.1 5 13.1 7.6C13.1 10.4 11.4 12.6 8.9 12.6C8.1 12.6 7.3 12.2 7.1 11.7C7.1 11.7 6.7 13.2 6.6 13.6C6.4 14.3 5.9 15.2 5.6 15.7C6.4 15.9 7.2 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0Z" fill="#E12828" />
                  </svg>
                </a>
              )}
              {social?.twitter && (
                <a href={twShare} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.0722 1.60052C16.432 1.88505 15.7562 2.06289 15.0448 2.16959C15.7562 1.74278 16.3253 1.06701 16.5742 0.248969C15.8985 0.640206 15.1515 0.924742 14.3335 1.10258C13.6933 0.426804 12.7686 0 11.7727 0C9.85206 0 8.28711 1.56495 8.28711 3.48557C8.28711 3.7701 8.32268 4.01907 8.39382 4.26804C5.51289 4.12577 2.9165 2.73866 1.17371 0.604639C0.889175 1.13814 0.71134 1.70722 0.71134 2.34742C0.71134 3.5567 1.31598 4.62371 2.27629 5.26392C1.70722 5.22835 1.17371 5.08608 0.675773 4.83711V4.87268C0.675773 6.5799 1.88505 8.00258 3.48557 8.32268C3.20103 8.39382 2.88093 8.42938 2.56082 8.42938C2.34742 8.42938 2.09845 8.39382 1.88505 8.35825C2.34742 9.74536 3.62784 10.7768 5.15722 10.7768C3.94794 11.7015 2.45412 12.2706 0.818041 12.2706C0.533505 12.2706 0.248969 12.2706 0 12.2351C1.56495 13.2309 3.37887 13.8 5.37062 13.8C11.8082 13.8 15.3294 8.46495 15.3294 3.84124C15.3294 3.69897 15.3294 3.52113 15.3294 3.37887C16.0052 2.9165 16.6098 2.31186 17.0722 1.60052Z" fill="#3FD1FF" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* inline report form */}
          {showReport && (
            <div className="mt-2 mb-[20px] border border-qgray-border p-3 rounded bg-white">
              <div className="mb-2">
                <label className="text-[12px] text-qgray block mb-1">Reason</label>
                <select
                  className="w-full border border-qgray-border h-[40px] px-2"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="wrong_info">Wrong information</option>
                  <option value="abuse">Abuse / offensive</option>
                  <option value="fraud">Fraud / scam suspicion</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="text-[12px] text-qgray block mb-1">Details (optional)</label>
                <textarea
                  className="w-full border border-qgray-border p-2 h-[80px]"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={reporting || !validPid}
                  className="black-btn h-[40px] px-4 disabled:opacity-60"
                >
                  {reporting ? "Sending…" : "Submit Report"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReport(false)}
                  className="h-[40px] px-4 border border-qgray-border"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/* ================= PropTypes ================= */

const ImageObjType = PropTypes.shape({
  url: PropTypes.string,
  thumbnail: PropTypes.string,
  webp: PropTypes.string,
  publicId: PropTypes.string,
});
const ImageType = PropTypes.oneOfType([PropTypes.string, ImageObjType]);

const TaxonomyShape = PropTypes.shape({
  _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  slug: PropTypes.string,
  title: PropTypes.string, // <-- backend bazen title döndürüyor
});


ProductView.propTypes = {
  className: PropTypes.string,
  loading: PropTypes.bool,
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    slug: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
    salePrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discountPercent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    stock: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    sku: PropTypes.string,
    image: ImageType,
    thumbnail: PropTypes.string,
    images: PropTypes.arrayOf(ImageType),
    gallery: PropTypes.arrayOf(ImageType),
    attributes: PropTypes.array,
    variants: PropTypes.array,
    productType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    product_type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.oneOfType([
      PropTypes.string,
      TaxonomyShape,             // <-- genişletildi
      PropTypes.object,          // <-- daha da toleranslı (opsiyonel)
    ]),
    brand: PropTypes.oneOfType([
      PropTypes.string,
      TaxonomyShape,             // <-- genişletildi
      PropTypes.object,          // <-- daha da toleranslı (opsiyonel)
    ]),
    description: PropTypes.string,
    visibility: PropTypes.string,
    seoKeywords: PropTypes.arrayOf(PropTypes.string),
  }),
};
