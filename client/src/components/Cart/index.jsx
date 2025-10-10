import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetMyCartQuery,
  useRemoveFromCartMutation, // PATCH /cart/remove { productId, productType, session? }
} from "@/api-manage/api-call-functions/public/publicCart.api";

function getSessionId() {
  try {
    let s = localStorage.getItem("cart_session");
    if (!s) {
      s = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("cart_session", s);
    }
    return s;
  } catch {
    return undefined;
  }
}

/* ---------- helpers ---------- */

// Başlığı i18n objesinden güvenli çek
const pickTitle = (it) => {
  const t =
    it?.title ||
    it?.product?.title ||
    it?.raw?.product?.title ||
    it?.name ||
    it?.product?.name ||
    it?.raw?.name;

  if (!t) return "—";
  if (typeof t === "string") return t;

  // t { tr,en,de,... } gibi bir obje ise
  try {
    const lang = (typeof navigator !== "undefined" ? navigator.language : "en").slice(0, 2);
    return t[lang] || t.en || t.tr || Object.values(t).find(Boolean) || "—";
  } catch {
    return "—";
  }
};

// Görseli farklı şemalardan doğru URL olarak seç
const pickThumb = (it) => {
  // normalize edilmiş item.image (string/obje olabilir)
  if (it?.image) {
    if (typeof it.image === "string") return it.image;
    if (typeof it.image === "object") {
      return it.image.thumbnail || it.image.url || it.image.webp || null;
    }
  }

  // product.thumbnail
  if (typeof it?.product?.thumbnail === "string" && it.product.thumbnail)
    return it.product.thumbnail;
  if (typeof it?.raw?.product?.thumbnail === "string" && it.raw.product.thumbnail)
    return it.raw.product.thumbnail;

  // product.images[]
  const imgs =
    (Array.isArray(it?.product?.images) && it.product.images) ||
    (Array.isArray(it?.raw?.product?.images) && it.raw.product.images) ||
    [];
  if (imgs.length > 0) {
    const first = imgs[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return first.thumbnail || first.url || first.webp || null;
  }

  // gallery
  const gal =
    (Array.isArray(it?.product?.gallery) && it.product.gallery) ||
    (Array.isArray(it?.raw?.product?.gallery) && it.raw.product.gallery) ||
    [];
  if (gal.length > 0) {
    const g0 = gal[0];
    if (typeof g0 === "string") return g0;
    if (g0 && typeof g0 === "object") return g0.thumbnail || g0.url || g0.webp || null;
  }

  // fallback
  return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
};

const pickQty = (it) => it?.quantity ?? it?.qty ?? it?.count ?? 1;
const pickUnit = (it) =>
  Number(
    it?.unitPrice ??
      it?.priceAtAddition ?? // varsa bunu da kullan
      it?.price ??
      it?.product?.price?.current ??
      it?.product?.price ??
      it?.raw?.product?.price ??
      0
  );

const getProductId = (it) =>
  it?.productId ||
  it?.product?._id ||
  it?.product?.id ||
  it?.product ||
  it?.raw?.product?._id ||
  it?.raw?.product?.id ||
  it?.id;

const getProductType = (it) =>
  (it?.productType || it?.type || "product").toString().toLowerCase();

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ---------- component ---------- */

export default function Cart({ className, type }) {
  const session = getSessionId();

  const { data, isFetching } = useGetMyCartQuery(
    session ? { session } : {},
    { refetchOnMountOrArgChange: true }
  );
  const items = Array.isArray(data?.items) ? data.items : [];

  const subtotal =
    data?._numbers?.subtotal ??
    data?.subtotal ??
    items.reduce((s, it) => s + pickUnit(it) * pickQty(it), 0);

  const [removeItem, { isLoading: removing }] = useRemoveFromCartMutation();

  const onRemove = async (it) => {
    try {
      await removeItem({
        productId: getProductId(it),
        productType: getProductType(it),
        session,
      }).unwrap();
    } catch (e) {
      toast.error(e?.data?.message || e?.message || "Kaldırılamadı.");
    }
  };

  return (
    <div
      style={{ boxShadow: " 0px 15px 50px 0px rgba(0, 0, 0, 0.14)" }}
      className={`w-[300px] bg-white border-t-[3px] ${
        type === 3 ? "border-qh3-blue" : "cart-wrappwer"
      }  ${className || ""}`}
    >
      <div className="w-full h-full">
        <div className="product-items h-[310px] overflow-y-scroll">
          {isFetching ? (
            <div className="p-4 text-sm text-qgray">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-qgray">Sepetiniz boş.</div>
          ) : (
            <ul>
              {items.map((it, idx) => {
                const title = pickTitle(it);
                const img = pickThumb(it);
                const qty = pickQty(it);
                const unit = pickUnit(it);

                return (
                  <li key={(it?.lineId || it?.id || getProductId(it) || idx) + ""} className="w-full h-full flex">
                    <div className="flex space-x-[6px] justify-center items-center px-4 my-[20px]">
                      <div className="w-[65px] h-full">
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
                          }}
                        />
                      </div>
                      <div className="flex-1 h-full flex flex-col justify-center">
                        <p className="title mb-2 text-[13px] font-600 text-qblack leading-4 line-clamp-2 hover:text-blue-600">
                          {title}
                        </p>
                        <p className="price">
                          <span className="offer-price text-qred font-600 text-[15px] ml-2">
                            €{fmt(unit)}{qty > 1 ? ` × ${qty}` : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="remove"
                      onClick={() => onRemove(it)}
                      disabled={removing}
                      className="mt-[20px] mr-[15px] inline-flex cursor-pointer disabled:opacity-50"
                    >
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        className="inline fill-current text-[#AAAAAA] hover:text-qred"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7.76 0.24C7.44 -0.08 6.96 -0.08 6.64 0.24L4 2.88L1.36 0.24C1.04 -0.08 0.56 -0.08 0.24 0.24C-0.08 0.56 -0.08 1.04 0.24 1.36L2.88 4L0.24 6.64C-0.08 6.96 -0.08 7.44 0.24 7.76C0.56 8.08 1.04 8.08 1.36 7.76L4 5.12L6.64 7.76C6.96 8.08 7.44 8.08 7.76 7.76C8.08 7.44 8.08 6.96 7.76 6.64L5.12 4L7.76 1.36C8.08 1.04 8.08 0.56 7.76 0.24Z" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="w-full px-4 mt-[20px] mb-[12px]">
          <div className="h-[1px] bg-[#F0F1F3]" />
        </div>

        <div className="product-actions px-4 mb-[30px]">
          <div className="total-equation flex justify-between items-center mb-[28px]">
            <span className="text-[15px] font-500 text-qblack">Subtotal</span>
            <span className="text-[15px] font-500 text-qred ">€{fmt(subtotal)}</span>
          </div>
          <div className="product-action-btn">
            <Link to="/cart">
              <div className="gray-btn w-full h-[50px] mb-[10px] ">
                <span>View Cart</span>
              </div>
            </Link>
            <Link to="/checkout">
              <div className="w-full h-[50px]">
                <div className={type === 3 ? "blue-btn" : "yellow-btn"}>
                  <span className="text-sm">Checkout Now</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="w-full px-4 mt-[20px]">
          <div className="h-[1px] bg-[#F0F1F3]" />
        </div>
        <div className="flex justify-center py-[15px]">
          <p className="text-[13px] font-500 text-qgray">
            Get Return within <span className="text-qblack">30 days</span>
          </p>
        </div>
      </div>
    </div>
  );
}

Cart.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
