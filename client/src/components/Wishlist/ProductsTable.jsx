import { useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import InputQuantityCom from "@/components/Helpers/InputQuantityCom";

import {
  useGetMyWishlistQuery,
  useRemoveWishlistItemMutation,
} from "@/api-manage/api-call-functions/public/publicWishlist.api";

/* Ortak helper’lar */
import {
  getSessionId,
  getProductId,
  pickTitle,
  pickImageUrl,
  pickPrices,
  fmtMoney,
} from "@/utils/product.helpers";

// Görsel yardımcıları
const LS_QTY_KEY = "wishlist_qty_map";

const pickColorHex = (it, p) =>
  it?.variant?.colorHex ||
  it?.variant?.colorCode ||
  it?.colorHex ||
  it?.colorCode ||
  p?.colorHex ||
  p?.colorCode ||
  "#E4BC87";

const pickSizeText = (it, p) =>
  it?.variant?.sizeName || it?.size || p?.size || "—";

export default function ProductsTable({ className }) {
  const session = getSessionId();

  // transformResponse sayesinde { items: [...] } döner
  const { data, isFetching } = useGetMyWishlistQuery(
    session ? { session } : {},
    { skip: !session, refetchOnMountOrArgChange: true }
  );

  const [removeWish, { isLoading: removing }] = useRemoveWishlistItemMutation();

  const items = useMemo(() => {
    const raw = data?.items || [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  // qty state (localStorage ile senkron)
  const [qtyMap, setQtyMap] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_QTY_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const setQty = useCallback((pid, q) => {
    setQtyMap((m) => {
      const next = { ...m, [pid]: q };
      try {
        localStorage.setItem(LS_QTY_KEY, JSON.stringify(next));
      } catch {
        toast.error("Could not save quantity");
      }
      return next;
    });
  }, []);

  const onRemove = useCallback(
    async (it) => {
      // ÜRÜN ID’sini wishlist item’ındaki product’tan al
      const pid = getProductId(it?.product);
      if (!pid) return;
      try {
        await removeWish({ session, product: pid }).unwrap();
        toast.info("Removed from wishlist");
        // invalidateTag ile liste zaten yenilenir
      } catch (e) {
        toast.error(e?.data?.message || e?.error || "Remove failed");
      }
    },
    [removeWish, session]
  );

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <tbody>
            {/* table heading */}
            <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] whitespace-nowrap px-2 border-b default-border-bottom uppercase">
              <td className="py-4 pl-10 block whitespace-nowrap w-[380px]">product</td>
              <td className="py-4 whitespace-nowrap text-center">color</td>
              <td className="py-4 whitespace-nowrap text-center">size</td>
              <td className="py-4 whitespace-nowrap text-center">price</td>
              <td className="py-4 whitespace-nowrap text-center">quantity</td>
              <td className="py-4 whitespace-nowrap text-center">total</td>
              <td className="py-4 whitespace-nowrap text-right w-[114px] block"></td>
            </tr>

            {/* rows */}
            {isFetching ? (
              <tr>
                <td className="pl-10 py-6 text-qgray" colSpan={7}>
                  Loading…
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td className="pl-10 py-6 text-qgray" colSpan={7}>
                  Wishlist is empty.
                </td>
              </tr>
            ) : (
              items.map((it, idx) => {
                const p = typeof it?.product === "object" ? it.product : {};
                const pid = getProductId(p) || `w-${idx}`;

                const img = pickImageUrl(it?.image ? { ...p, image: it.image } : p);
                const title = pickTitle(p);
                const colorHex = pickColorHex(it, p);
                const sizeText = pickSizeText(it, p);

                const { offer } = pickPrices(p);
                const qty = Number(qtyMap[pid] || 1);
                const total = offer * qty;

                return (
                  <tr key={pid} className="bg-white border-b hover:bg-gray-50">
                    <td className="pl-10 py-4">
                      <div className="flex space-x-6 items-center">
                        <div className="w-[80px] h-[80px] overflow-hidden flex justify-center items-center border border-[#EDEDED]">
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
                          <p className="font-medium text-[15px] text-qblack line-clamp-2">
                            {title}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="text-center py-4 px-2">
                      <div className="flex justify-center items-center">
                        <span
                          className="w-[20px] h-[20px] block rounded-full border border-[#EDEDED]"
                          style={{ backgroundColor: colorHex }}
                          title={colorHex}
                        />
                      </div>
                    </td>

                    <td className="text-center py-4 px-2">
                      <div className="flex space-x-1 items-center justify-center">
                        <span className="text-[15px] font-normal">{sizeText}</span>
                      </div>
                    </td>

                    <td className="text-center py-4 px-2">
                      <div className="flex space-x-1 items-center justify-center">
                        <span className="text-[15px] font-normal">€{fmtMoney(offer)}</span>
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="flex justify-center items-center">
                        <InputQuantityCom
                          value={qty}
                          min={1}
                          max={999}
                          onChange={(v) => setQty(pid, Math.max(1, Number(v || 1)))}
                        />
                      </div>
                    </td>

                    <td className="text-right py-4">
                      <div className="flex space-x-1 items-center justify-center">
                        <span className="text-[15px] font-normal">€{fmtMoney(total)}</span>
                      </div>
                    </td>

                    <td className="text-right py-4">
                      <div className="flex space-x-1 items-center justify-center">
                        <button
                          type="button"
                          aria-label="remove"
                          disabled={removing}
                          onClick={() => onRemove(it)}
                          className="p-2 disabled:opacity-50"
                          title="Remove"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.7 0.3C9.3 -0.1 8.7 -0.1 8.3 0.3L5 3.6L1.7 0.3C1.3 -0.1 0.7 -0.1 0.3 0.3C-0.1 0.7 -0.1 1.3 0.3 1.7L3.6 5L0.3 8.3C-0.1 8.7 -0.1 9.3 0.3 9.7C0.7 10.1 1.3 10.1 1.7 9.7L5 6.4L8.3 9.7C8.7 10.1 9.3 10.1 9.7 9.7C10.1 9.3 10.1 8.7 9.7 8.3L6.4 5L9.7 1.7C10.1 1.3 10.1 0.7 9.7 0.3Z"
                              fill="#AAAAAA"
                            />
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
