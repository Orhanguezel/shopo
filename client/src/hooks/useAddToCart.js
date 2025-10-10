// src/hooks/useAddToCart.js  (JS)
import { useAddCartItemMutation } from "@/api-manage/api-call-functions/public/publicCart.api";
import {
  getSessionId,
  getProductId,
  pickVariantId,
  pickProductType,          // already canonicalized to allowed set
  ALLOWED_PRODUCT_TYPES,    // extra guard
} from "@/utils/product.helpers";

/**
 * addToCart(productLike, qty = 1, extra = {})
 * - productLike: ürün objesi (id/_id/... içeren)
 * - qty: sayı
 * - extra: { productType?, variant?, session? } override amaçlı
 *
 * Hatalar: "NO_SESSION" | "INVALID_PRODUCT_ID"
 */
export default function useAddToCart() {
  const [mutate, state] = useAddCartItemMutation();

  const addToCart = async (productLike, qty = 1, extra = {}) => {
    // 1) header için session
    const session = extra.session || getSessionId();
    if (!session) throw new Error("NO_SESSION");

    // 2) ürün id
    const productId = getProductId(productLike);
    if (!productId) throw new Error("INVALID_PRODUCT_ID");

    // 3) productType → allowed set'e zorla
    let productType = pickProductType(
      { ...productLike, productType: extra.productType ?? productLike?.productType ?? productLike?.product_type },
      "product"
    );
    if (!ALLOWED_PRODUCT_TYPES.includes(productType)) productType = "product";

    // 4) varyant (varsa)
    const variant = extra.variant ?? pickVariantId(productLike);

    // 5) body (STRICT): { productId, productType, quantity, [variant] }
    const body = {
      productId,
      productType,
      quantity: Math.max(1, parseInt(qty, 10) || 1),
      ...(variant ? { variant } : {}),
    };

    return mutate({ ...body, session }).unwrap();
  };

  return [addToCart, state];
}
