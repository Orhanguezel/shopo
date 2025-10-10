import PropTypes from "prop-types";
import { useState } from "react";
import { Link } from "react-router-dom";
import Compair from "../icons/Compair";
import QuickViewIco from "../icons/QuickViewIco";
import Star from "../icons/Star";
import ThinLove from "../icons/ThinLove";
import { toast } from "react-toastify";

import {
  useGetProductReviewStatsQuery,
  useCreatePublicReviewMutation,
} from "@/api-manage/api-call-functions/public/publicReviews.api";

import {
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} from "@/api-manage/api-call-functions/public/publicWishlist.api";
import {
  useAddCompareItemMutation,
  useRemoveCompareItemMutation,
} from "@/api-manage/api-call-functions/public/publicCompare.api";

/* ---- ortak helper'lar ---- */
import {
  isObjectId,
  pickImageUrl,
  pickTitle,
  pickPrices,
  fmtMoney as fmt,
  getSessionId,
  getProductId,
  getProductSlug,
} from "@/utils/product.helpers";

/* tek noktadan add to cart */
import useAddToCart from "@/hooks/useAddToCart";

export default function ProductCardStyleOne({ datas, type }) {
  const img = pickImageUrl(datas);
  const title = pickTitle(datas);
  const { main, offer } = pickPrices(datas);

  const pidRaw = getProductId(datas);
  const validPid = isObjectId(pidRaw) ? pidRaw : undefined;

  const { data: stats, refetch } = useGetProductReviewStatsQuery(validPid, { skip: !validPid });
  const rating = typeof stats?.avg === "number" ? stats.avg : Number(datas?.rating ?? 0);
  const reviewCount = typeof stats?.count === "number" ? stats.count : Number(datas?.reviewCount ?? 0);

  const [createReview, { isLoading: isCreatingReview }] = useCreatePublicReviewMutation();
  const [hoverRating, setHoverRating] = useState(0);
  const displayedFilled = hoverRating || Math.round(Number(rating) || 0);

  const handleRate = async (val) => {
    if (!validPid) return;
    try {
      await createReview({ product: validPid, rating: val }).unwrap();
      toast.success("Puanınız kaydedildi");
      refetch?.();
    } catch (e) {
      toast.error(e?.data?.message || e?.error || "Puan gönderilemedi");
    }
  };

  // Mutations (wishlist/compare)
  const [addToCart,   { isLoading: addingCart }]     = useAddToCart();
  const [addWish,     { isLoading: addingWish }]     = useAddWishlistItemMutation();
  const [removeWish,  { isLoading: removingWish }]   = useRemoveWishlistItemMutation();
  const [addCompare,  { isLoading: addingCompare }]  = useAddCompareItemMutation();
  const [removeComp,  { isLoading: removingCompare }] = useRemoveCompareItemMutation();

  const onAddToCart = async () => {
    try {
      await addToCart(datas, 1);
      toast.success("Added to cart");
    } catch (e) {
      const code = e?.message;
      if (code === "NO_SESSION")         return toast.error("Oturum bulunamadı.");
      if (code === "INVALID_PRODUCT_ID") return toast.error("Ürün ID bulunamadı.");
      const msg = e?.data?.message || e?.error || e?.message || "Add to cart failed";
      toast.error(msg);
    }
  };

  const onToggleWishlist = async (e) => {
    e.preventDefault();
    const session = getSessionId();
    if (!session) return;
    const el = e.currentTarget;
    const isAdded = el.dataset.added === "1";
    try {
      if (isAdded) {
        await removeWish({ session, product: validPid || pidRaw }).unwrap();
        el.dataset.added = "0";
        toast.info("Removed from wishlist");
      } else {
        await addWish({ session, product: validPid || pidRaw }).unwrap();
        el.dataset.added = "1";
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.error || "Wishlist toggle failed");
    }
  };

  const onToggleCompare = async (e) => {
    e.preventDefault();
    const session = getSessionId();
    if (!session) return;
    const el = e.currentTarget;
    const isAdded = el.dataset.added === "1";
    try {
      if (isAdded) {
        await removeComp({ session, product: validPid || pidRaw }).unwrap();
        el.dataset.added = "0";
        toast.info("Removed from compare");
      } else {
        await addCompare({ session, product: validPid || pidRaw }).unwrap();
        el.dataset.added = "1";
        toast.success("Added to compare");
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.error || "Compare toggle failed");
    }
  };

  const slug = getProductSlug(datas);
  const to = slug ? `/product/${slug}` : "/single-product";

  const anyLoading =
    addingCart || addingWish || removingWish || addingCompare || removingCompare || isCreatingReview;

  return (
    <div className="product-card-one w-full h-full bg-white relative group overflow-hidden"
         style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}>
      <div className="product-card-img w-full h-[300px]"
           style={{ background: `url(${img}) no-repeat center`, backgroundSize: "contain" }} />

      <div className="product-card-details px-[30px] pb-[30px] relative">
        <div className="absolute w-full h-10 px-[30px] left-0 top-40 group-hover:top-[65px] transition-all">
          <button type="button" onClick={onAddToCart} disabled={addingCart}
                  className={`${type === 3 ? "blue-btn" : "yellow-btn"} disabled:opacity-60`}
                  aria-label="Add to Cart">
            <div className="flex items-center space-x-3">
              <span>
                <svg width="14" height="16" viewBox="0 0 14 16" className="fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5664 4.14176C12.4665 3.87701 12.2378 3.85413 11.1135 3.85413H10.1792V3.43576C10.1792 2.78532 10.089 2.33099 9.86993 1.86359C9.47367 1.01704 8.81003 0.425438 7.94986 0.150881C7.53106 0.0201398 6.90607 -0.0354253 6.52592 0.0234083C5.47246 0.193372 4.57364 0.876496 4.11617 1.85052C3.89389 2.32772 3.80368 2.78532 3.80368 3.43576V3.8574H2.8662C1.74187 3.8574 1.51313 3.88028 1.41326 4.15483C1.36172 4.32807 0.878481 8.05093 0.6723 9.65578C0.491891 11.0547 0.324369 12.3752 0.201948 13.3688C-0.0106763 15.0815 -0.00423318 15.1077 0.00220999 15.1371V15.1404C0.0312043 15.2515 0.317925 15.5424 0.404908 15.6274L0.781834 16H13.1785L13.4588 15.7483C13.5844 15.6339 14 15.245 14 15.0521C14 14.9214 12.5922 4.21694 12.5664 4.14176Z" />
                </svg>
              </span>
              <span>{addingCart ? "Adding…" : "Add To Cart"}</span>
            </div>
          </button>
        </div>

        {/* reviews */}
        <div className="reviews flex items-center space-x-2 mb-3">
          <div className="flex space-x-[1px]">
            {Array.from({ length: 5 }).map((_, i) => {
              const val = i + 1;
              const filled = val <= displayedFilled;
              return (
                <button key={`r-${val}`} type="button"
                        className={`p-0 m-0 leading-none ${filled ? "text-qyellow" : "text-qgray opacity-40"}`}
                        onMouseEnter={() => setHoverRating(val)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRate(val)}
                        disabled={!validPid || isCreatingReview}
                        aria-label={`Rate ${val}`}
                        title={reviewCount > 0 ? `Ortalama: ${Number(rating || 0).toFixed(1)} (${reviewCount})` : `Puan ver: ${val}`}>
                  <Star />
                </button>
              );
            })}
          </div>
          <span className="text-xs text-qgray">({reviewCount || 0})</span>
        </div>

        <Link to={to}>
          <p className="title mb-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
            {title}
          </p>
        </Link>

        <p className="price">
          {main ? (
            <span className="main-price text-qgray line-through font-600 text-[18px]">€{fmt(main)}</span>
          ) : (
            <span className="main-price text-qgray font-600 text-[18px] opacity-0 select-none">—</span>
          )}
          <span className="offer-price text-qred font-600 text-[18px] ml-2">€{fmt(offer)}</span>
        </p>
      </div>

      {/* quick-access-btns */}
      <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-4 -right-10 top-20 transition-all">
        <a href="#" aria-label="Quick View" onClick={(e)=>e.preventDefault()}>
          <span className="w-10 h-10 flex justify-center items-center bg-primarygray rounded">
            <QuickViewIco />
          </span>
        </a>

        <a href="#" onClick={onToggleWishlist} data-added="0" aria-label="Toggle Wishlist">
          <span className={`w-10 h-10 flex justify-center items-center rounded ${anyLoading ? "opacity-60 pointer-events-none" : ""} bg-primarygray`}>
            <ThinLove />
          </span>
        </a>

        <a href="#" onClick={onToggleCompare} data-added="0" aria-label="Toggle Compare">
          <span className={`w-10 h-10 flex justify-center items-center rounded ${anyLoading ? "opacity-60 pointer-events-none" : ""} bg-primarygray`}>
            <Compair />
          </span>
        </a>
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

ProductCardStyleOne.propTypes = {
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  datas: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    slugCanonical: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    image: ImageType,
    thumbnail: PropTypes.string,
    images: PropTypes.arrayOf(ImageType),
    gallery: PropTypes.arrayOf(ImageType),
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
    salePrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discountPercent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    defaultVariantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    defaultVariant: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    }),
    variants: PropTypes.array,
    hasVariants: PropTypes.bool,
    productType: PropTypes.string,
    product_type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};
