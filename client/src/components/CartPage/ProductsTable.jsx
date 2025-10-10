import PropTypes from "prop-types";
import { toast } from "react-toastify";
import InputQuantityCom from "@/components/Helpers/InputQuantityCom";
import {
  useGetMyCartQuery,
  useUpdateMenuLineMutation,     // PATCH /cart/items/:lineId  (sadece menuitem)
  useIncreaseQuantityMutation,   // PATCH /cart/increase       { productId, productType, session? }
  useDecreaseQuantityMutation,   // PATCH /cart/decrease       { productId, productType, session? }
  useRemoveFromCartMutation,     // PATCH /cart/remove         { productId, productType, session? }
} from "@/api-manage/api-call-functions/public/publicCart.api";

function getSessionId() {
  try {
    return localStorage.getItem("cart_session") || undefined;
  } catch {
    return undefined;
  }
}

// Başlığı i18n objesinden güvenli çek
const pickTitle = (it) => {
  const t =
    it?.title ||
    it?.product?.title ||
    it?.name ||
    it?.product?.name;

  if (!t) return "—";
  if (typeof t === "string") return t;

  // t { tr,en,de,... } gibi bir obje
  try {
    const lang = (typeof navigator !== "undefined" ? navigator.language : "en").slice(0, 2);
    return t[lang] || t.en || t.tr || Object.values(t).find(Boolean) || "—";
  } catch {
    return "—";
  }
};

// Görseli farklı şemalardan doğru URL olarak seç
// Görseli farklı şemalardan doğru URL olarak seç
const pickThumb = (it) => {
  // 0) normalize edilmiş satır: image obje/string olabilir
  if (it?.image) {
    if (typeof it.image === "string") return it.image;
    if (typeof it.image === "object") {
      return it.image.thumbnail || it.image.url || it.image.webp || null;
    }
  }

  // 1) product.thumbnail string ise
  if (typeof it?.product?.thumbnail === "string" && it.product.thumbnail)
    return it.product.thumbnail;

  // 2) product.images: string ya da obje dizisi olabilir
  const imgs = Array.isArray(it?.product?.images) ? it.product.images : [];
  if (imgs.length > 0) {
    const first = imgs[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      return first.thumbnail || first.url || first.webp || null;
    }
  }

  // 3) gallery benzeri alanlar
  const gal = Array.isArray(it?.product?.gallery) ? it.product.gallery : [];
  if (gal.length > 0) {
    const g0 = gal[0];
    if (typeof g0 === "string") return g0;
    if (g0 && typeof g0 === "object") return g0.thumbnail || g0.url || g0.webp || null;
  }

  // 4) fallback
  return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
};

// (opsiyonel) birim fiyat – priceAtAddition'ı da dikkate al
const pickUnit = (it) =>
  Number(
    it?.unitPrice ??
    it?.priceAtAddition ??   // <— eklendi
    it?.price ??
    it?.product?.price?.current ??
    it?.product?.price ??
    0
  );


const pickQty = (it) => it?.quantity ?? it?.qty ?? it?.count ?? 1;

const getProductId = (it) =>
  it?.productId || it?.product?._id || it?.product?.id || it?.product || it?.id;

const getProductType = (it) =>
  (it?.productType || it?.type || "product").toString().toLowerCase();

const getLineId = (it) => it?.lineId || it?._id?.$oid || it?._id || undefined;

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function ProductsTable({ className }) {
  const session = getSessionId();

  const { data, isFetching } = useGetMyCartQuery(
    session ? { session } : {},
    { refetchOnMountOrArgChange: true }
  );
  const items = Array.isArray(data?.items) ? data.items : [];

  const [updateLine, { isLoading: updating }] = useUpdateMenuLineMutation();
  const [inc, { isLoading: incing }] = useIncreaseQuantityMutation();
  const [dec, { isLoading: decing }] = useDecreaseQuantityMutation();
  const [removeByProd, { isLoading: removing }] = useRemoveFromCartMutation();

  // Miktar değişimi
  const onQtyChange = async (it, quantity) => {
    const q = Math.max(1, Number(quantity || 1));
    const type = getProductType(it);
    const lineId = getLineId(it);

    // Yalnızca menuitem satırları lineId ile PATCH edilebilir
    if (type === "menuitem" && lineId) {
      try {
        await updateLine({ lineId, data: { quantity: q, session } }).unwrap();
        return;
      } catch (e) {
        // Düş ve diff’le devam et
        console.warn("menu line update failed, falling back to inc/dec", e);
      }
    }

    // Normal ürünlerde increase/decrease uçlarını kullan
    try {
      const current = Number(pickQty(it));
      const diff = q - current;
      const base = { productId: getProductId(it), productType: type, session };

      if (diff > 0) {
        for (let i = 0; i < diff; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await inc(base).unwrap();
        }
      } else if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await dec(base).unwrap();
        }
      }
    } catch (e) {
      toast.error(e?.data?.message || e?.message || "Miktar güncellenemedi.");
    }
  };

  const onRemove = async (it) => {
    try {
      await removeByProd({
        productId: getProductId(it),
        productType: getProductType(it),
        session,
      }).unwrap();
    } catch (e) {
      toast.error(e?.data?.message || e?.message || "Kaldırılamadı.");
    }
  };

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <tbody>
            {/* heading */}
            <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] whitespace-nowrap px-2 border-b default-border-bottom uppercase">
              <td className="py-4 pl-10 block whitespace-nowrap min-w-[300px]">product</td>
              <td className="py-4 whitespace-nowrap text-center">color</td>
              <td className="py-4 whitespace-nowrap text-center">size</td>
              <td className="py-4 whitespace-nowrap text-center">price</td>
              <td className="py-4 whitespace-nowrap text-center">quantity</td>
              <td className="py-4 whitespace-nowrap text-center">total</td>
              <td className="py-4 whitespace-nowrap text-right w-[114px]" />
            </tr>

            {isFetching ? (
              <tr><td className="p-4 text-qgray" colSpan={7}>Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-4 text-qgray" colSpan={7}>Sepet boş.</td></tr>
            ) : (
              items.map((it, idx) => {
                const title = pickTitle(it);
                const img = pickThumb(it);
                const qty = pickQty(it);
                const unit = pickUnit(it);
                const total = unit * qty;

                const color = it?.variant?.colorName || it?.color || "—";
                const size = it?.variant?.sizeName || it?.size || "—";

                return (
                  <tr key={(getLineId(it) || getProductId(it) || idx) + ""} className="bg-white border-b hover:bg-gray-50">
                    <td className="pl-10 py-4 w-[380px]">
                      <div className="flex space-x-6 items-center">
                        <div className="w-[80px] h-[80px] overflow-hidden flex justify-center items-center border border-[#EDEDED] bg-white">
                          <img
                            src={img}
                            alt={title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
                            }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <p className="font-medium text-[15px] text-qblack">{title}</p>
                        </div>
                      </div>
                    </td>

                    <td className="text-center py-4 px-2">
                      <div className="flex justify-center items-center">
                        <span className="text-[13px]">{color}</span>
                      </div>
                    </td>

                    <td className="text-center py-4 px-2">
                      <div className="flex items-center justify-center">
                        <span className="text-[15px] font-normal">{size}</span>
                      </div>
                    </td>

                    <td className="text-center py-4 px-2">
                      <div className="flex items-center justify-center">
                        <span className="text-[15px] font-normal">€{fmt(unit)}</span>
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="flex justify-center items-center">
                        <InputQuantityCom
                          value={qty}
                          min={1}
                          max={999}
                          onChange={(v) => onQtyChange(it, v)}
                          className={updating || incing || decing ? "opacity-70" : ""}
                        />
                      </div>
                    </td>

                    <td className="text-right py-4">
                      <div className="flex items-center justify-center">
                        <span className="text-[15px] font-normal">€{fmt(total)}</span>
                      </div>
                    </td>

                    <td className="text-right py-4">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          aria-label="remove"
                          onClick={() => onRemove(it)}
                          disabled={removing}
                          className="disabled:opacity-50"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.7 0.3C9.3 -0.1 8.7 -0.1 8.3 0.3L5 3.6L1.7 0.3C1.3 -0.1 0.7 -0.1 0.3 0.3C-0.1 0.7 -0.1 1.3 0.3 1.7L3.6 5L0.3 8.3C-0.1 8.7 -0.1 9.3 0.3 9.7C0.7 10.1 1.3 10.1 1.7 9.7L5 6.4L8.3 9.7C8.7 10.1 9.3 10.1 9.7 9.7C10.1 9.3 10.1 8.7 9.7 8.3L6.4 5L9.7 1.7C10.1 1.3 10.1 0.7 9.7 0.3Z" fill="#AAAAAA" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ProductsTable.propTypes = {
  className: PropTypes.string,
};
