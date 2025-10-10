// src/components/Wishlist/index.jsx
import PropTypes from "prop-types";
import { useMemo, useCallback, useState } from "react";
import { toast } from "react-toastify";

import BreadcrumbCom from "../BreadcrumbCom";
import EmptyWishlistError from "../EmptyWishlistError";
import PageTitle from "@/components/Helpers/PageTitle";
import Layout from "../Partials/Layout";
import ProductsTable from "./ProductsTable";

/* API */
import {
  useGetMyWishlistQuery,
  useRemoveWishlistItemMutation,
  useClearMyWishlistMutation,
} from "@/api-manage/api-call-functions/public/publicWishlist.api";

/* tek merkez add-to-cart */
import useAddToCart from "@/hooks/useAddToCart";

/* ---- küçük yardımcılar ---- */
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
const normId = (v) => {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object") return v.$oid || v.id || v._id || v.toString?.();
  return undefined;
};
const pickVariantId = (it) =>
  normId(
    it?.variantId ||
    it?.variant?._id ||
    it?.variant?.id ||
    it?.defaultVariantId ||
    it?.defaultVariant?._id ||
    it?.defaultVariant?.id
  );

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

// ufak bir nefes (concurrency çakışmasını azaltır)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Wishlist({ wishlist = true }) {
  const session = getSessionId();

  const { data, isFetching, refetch } = useGetMyWishlistQuery(
    { session },
    { skip: !session, refetchOnMountOrArgChange: true }
  );

  // {items} normalize
  const items = useMemo(() => {
    const raw = data?.items || data?.list || data?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const [addToCart] = useAddToCart();
  const [removeWish] = useRemoveWishlistItemMutation();
  const [clearWishlist, { isLoading: clearingAllNow }] = useClearMyWishlistMutation();

  // buton state'i (hook içindeki isLoading kısa süreli flicker yapabilir)
  const [moving, setMoving] = useState(false);

  // MOVE ALL TO CART: ekle + otomatik temizle
  const onMoveAll = useCallback(async () => {
    if (!items.length || moving) return;

    const rows = items
      .map((it) => {
        const prod = it?.product || {};
        const pid = normId(prod?._id || prod?.id || it?.product);
        if (!pid) return null;
        return {
          pid,
          prod,
          variant: pickVariantId(it),
          productType: normalizeType(it?.productType),
        };
      })
      .filter(Boolean);

    if (!rows.length) return;

    setMoving(true);
    try {
      // SIRALI ekle (VersionError önlemek için)
      const okPids = [];
      for (const r of rows) {
        try {
          await addToCart(r.prod, 1, {
            productType: r.productType,
            ...(r.variant ? { variant: r.variant } : {}),
          });
          okPids.push(r.pid);
        } catch (e) {
          // tek üründe hata olsa da devam
          // console.warn("addToCart failed for", r.pid, e);
        }
        // minik ara (opsiyonel)
        await sleep(10);
      }

      const ok = okPids.length;
      const total = rows.length;
      const fail = total - ok;

      if (ok === 0) {
        toast.error("Add all failed");
        return;
      }

      // otomatik temizleme
      if (fail === 0) {
        // hepsi başarılı → tek hamlede clear (daha güvenli)
        await clearWishlist({ session }).unwrap();
        toast.success(`Moved ${ok} item(s) to cart and cleared wishlist.`);
      } else {
        // kısmi başarı → sadece başarılı olanları SIRALI sil
        for (const pid of okPids) {
          try {
            await removeWish({ session, product: pid }).unwrap();
          } catch {
            // tek tek silerken hata olsa da devam
          }
          await sleep(10);
        }
        toast.success(`Moved ${ok} item(s) to cart. ${fail} failed. Removed moved items from wishlist.`);
      }

      refetch?.();
    } catch (e) {
      toast.error(e?.data?.message || e?.error || "Move all failed");
    } finally {
      setMoving(false);
    }
  }, [items, addToCart, clearWishlist, removeWish, session, refetch, moving]);

  const disableMoveAll = isFetching || moving || clearingAllNow || !items.length;
  const disableClean = isFetching || clearingAllNow || moving || !items.length;

  return (
    <Layout childrenClasses={wishlist ? "pt-0 pb-0" : ""}>
      {wishlist === false ? (
        <div className="wishlist-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "wishlist", path: "/wishlist" },
              ]}
            />
            <EmptyWishlistError />
          </div>
        </div>
      ) : (
        <div className="wishlist-page-wrapper w-full bg-white pb-[60px]">
          <div className="w-full">
            <PageTitle
              title="Wishlist"
              breadcrumb={[
                { name: "home", path: "/" },
                { name: "wishlist", path: "/wishlist" },
              ]}
            />
          </div>
          <div className="w-full mt-[23px]">
            <div className="container-x mx-auto">
              <ProductsTable className="mb-[30px]" />

              <div className="w-full mt-[30px] flex sm:justify-end justify-start">
                <div className="sm:flex sm:space-x-[30px] items-center">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await clearWishlist({ session }).unwrap();
                        toast.success("Wishlist cleared");
                        refetch?.();
                      } catch (e) {
                        toast.error(e?.data?.message || e?.error || "Clean failed");
                      }
                    }}
                    disabled={disableClean}
                  >
                    <div className="w-full text-sm font-semibold text-qred mb-5 sm:mb-0">
                      {clearingAllNow ? "Cleaning…" : "Clean Wishlist"}
                    </div>
                  </button>
                  <div className="w-[200px] h-[50px]">
                    <button
                      type="button"
                      className="yellow-btn disabled:opacity-60"
                      onClick={onMoveAll}
                      disabled={disableMoveAll}
                    >
                      <div className="w-full text-sm font-semibold">
                        {moving ? "Moving…" : "Move All to Cart"}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

Wishlist.propTypes = {
  wishlist: PropTypes.bool,
};
