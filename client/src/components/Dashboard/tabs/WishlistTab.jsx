import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import InputQuantityCom from "@/components/Helpers/InputQuantityCom";
import {
  useGetMyWishlistQuery,
  useRemoveWishlistItemMutation,
  useClearMyWishlistMutation,
} from "@/api-manage/api-call-functions/public/publicWishlist.api";
import { useAddCartItemMutation } from "@/api-manage/api-call-functions/public/publicCart.api";
import { toast } from "react-toastify";

function getSessionId() {
  try {
    return localStorage.getItem("wishlist_session") || undefined;
  } catch {
    return undefined;
  }
}

// Satır anahtarı (ürün + varyant’a göre)
const rowKey = (it, idx) => {
  const p = it?.product?._id || it?.product?.id || it?.product || it?.id || `p${idx}`;
  const v = it?.variant?._id || it?.variant?.id || it?.variant || "";
  return `${p}:${v}`;
};

// Güvenli alan okuyucular
const pickTitle = (it) => it?.product?.name || it?.name || it?.title || "—";
const pickThumb = (it) =>
  it?.product?.thumbnail ||
  it?.product?.images?.[0] ||
  it?.image ||
  `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
const pickPrice = (it) => {
  const p = it?.product?.price?.current ?? it?.product?.price ?? it?.price ?? 0;
  return Number(p) || 0;
};
const pickStockLabel = (it) => {
  const count = it?.product?.stock ?? it?.product?.inStockQty ?? it?.stock ?? undefined;
  const isInStock =
    (it?.product?.inStock ?? it?.inStock ?? (count == null ? true : count > 0)) === true;
  return isInStock ? `In Stock${count != null ? `(${count})` : ""}` : "Out of Stock";
};

const fmtMoney = (n) =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : n;

export default function WishlistTab({ className }) {
  const session = getSessionId();

  // GET wishlist
  const { data, isFetching } = useGetMyWishlistQuery(
    session ? { session } : {},
    { refetchOnMountOrArgChange: true }
  );

  // items’ı stable yapmak için useMemo
  const items = useMemo(() => {
    const arr = data?.items;
    return Array.isArray(arr) ? arr : [];
  }, [data]);

  // Satır bazlı miktarları tut (varsayılan 1). Liste değişince yeni satırları ekle/sil
  const [qtyMap, setQtyMap] = useState({});
  useEffect(() => {
    setQtyMap((prev) => {
      const next = { ...prev };
      items.forEach((it, idx) => {
        const k = rowKey(it, idx);
        if (!Number.isFinite(next[k])) next[k] = 1;
      });
      // silinen satırların miktarını temizle
      Object.keys(next).forEach((k) => {
        if (!items.some((it, idx) => rowKey(it, idx) === k)) delete next[k];
      });
      return next;
    });
  }, [items]);

  const [removeItem, { isLoading: removing }] = useRemoveWishlistItemMutation();
  const [clearAll,  { isLoading: clearing }] = useClearMyWishlistMutation();
  const [addCartItem, { isLoading: addingOne }] = useAddCartItemMutation();
  const [addingAll, setAddingAll] = useState(false);

  const onRemove = async (it) => {
    const body = {
      product: it?.product?._id || it?.product?.id || it?.product || it?.id,
      variant: it?.variant?._id || it?.variant?.id || it?.variant || undefined,
      session,
    };
    try {
      await removeItem(body).unwrap();
      toast.success("Ürün favorilerden kaldırıldı.");
    } catch (e) {
      toast.error(e?.data?.message || e?.message || "Kaldırılamadı.");
    }
  };

  const onClear = async () => {
    try {
      await clearAll({ session }).unwrap();
      toast.success("Favoriler temizlendi.");
    } catch (e) {
      toast.error(e?.data?.message || e?.message || "Temizlenemedi.");
    }
  };

  // Add to Cart (ALL)
  const onAddAllToCart = async () => {
    if (!items.length) return;
    setAddingAll(true);
    try {
      const jobs = items.map((it, idx) => {
        const k = rowKey(it, idx);
        const quantity = Math.max(1, Number(qtyMap[k] || 1));
        const body = {
          product: it?.product?._id || it?.product?.id || it?.product || it?.id,
          variant: it?.variant?._id || it?.variant?.id || it?.variant || undefined,
          quantity,
          session,
        };
        return addCartItem(body).unwrap();
      });

      const results = await Promise.allSettled(jobs);
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.length - ok;

      if (ok > 0) toast.success(`${ok} ürün sepete eklendi.`);
      if (fail > 0) toast.error(`${fail} ürün eklenemedi.`);

    } catch (e) {
      toast.error(e?.data?.message || e?.message || "Sepete eklenemedi.");
    } finally {
      setAddingAll(false);
    }
  };

  const grandTotal = useMemo(() => {
    return items.reduce((sum, it, idx) => {
      const k = rowKey(it, idx);
      return sum + pickPrice(it) * (qtyMap[k] || 1);
    }, 0);
  }, [items, qtyMap]);

  return (
    <>
      <div className={`w-full ${className || ""}`}>
        <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
          {isFetching ? (
            <div className="p-6 text-sm text-qgray">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-qgray">Wishlist boş.</div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead>
                <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] whitespace-nowrap px-2 border-b default-border-bottom uppercase">
                  <th className="py-4 pl-10 block whitespace-nowrap w-[380px]">product</th>
                  <th className="py-4 whitespace-nowrap text-center">stock status</th>
                  <th className="py-4 whitespace-nowrap text-center">price</th>
                  <th className="py-4 whitespace-nowrap text-center">quantity</th>
                  <th className="py-4 whitespace-nowrap text-center">total</th>
                  <th className="py-4 whitespace-nowrap text-right w-[114px] block"></th>
                </tr>
              </thead>

              <tbody>
                {items.map((it, idx) => {
                  const k = rowKey(it, idx);
                  const title = pickTitle(it);
                  const img = pickThumb(it);
                  const price = pickPrice(it);
                  const total = price * (qtyMap[k] || 1);
                  const stock = pickStockLabel(it);
                  return (
                    <tr key={k} className="bg-white border-b hover:bg-gray-50">
                      <td className="pl-10 py-4">
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
                        <span className="text-[15px] font-normal">{stock}</span>
                      </td>

                      <td className="text-center py-4 px-2">
                        <div className="flex space-x-1 items-center justify-center">
                          <span className="text-[15px] font-normal">€{fmtMoney(price)}</span>
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="flex justify-center items-center">
                          <InputQuantityCom
                            value={qtyMap[k] || 1}
                            onChange={(v) => setQtyMap((m) => ({ ...m, [k]: v }))}
                            min={1}
                            max={999}
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
                            onClick={() => onRemove(it)}
                            disabled={removing}
                            className="disabled:opacity-50"
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
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="w-full mt-[30px] flex sm:justify-end justify-start">
        <div className="sm:flex sm:space-x-[30px] items-center">
          <button type="button" onClick={onClear} disabled={clearing}>
            <div className="w-full text-sm font-semibold text-qred mb-5 sm:mb-0">
              {clearing ? "Cleaning…" : "Clean Wishlist"}
            </div>
          </button>
          <div className="w-[180px] h-[50px]">
            <button
              type="button"
              className="yellow-btn disabled:opacity-50"
              onClick={onAddAllToCart}
              disabled={addingAll || addingOne || !items.length}
            >
              <div className="w-full text-sm font-semibold">
                {addingAll ? "Adding…" : "Add to Cart All"}
              </div>
            </button>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="w-full mt-3 text-right pr-2 text-qblack">
          <span className="text-sm">Grand total (qty x price): </span>
          <strong>€{fmtMoney(grandTotal)}</strong>
        </div>
      )}
    </>
  );
}

WishlistTab.propTypes = {
  className: PropTypes.string,
};
