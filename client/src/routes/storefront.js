// src/routes/storefront.ts
import { Router } from "express";
import { requireTenant } from "../middlewares/tenant";
import * as svc from "../services/storefront"; // aşağıda

const r = Router();
r.use(requireTenant);

// KATALOG
r.get("/products", svc.listProducts);
r.get("/products/:idOrSlug", svc.getProduct);
r.get("/categories", svc.listCategories);
r.get("/brands", svc.listBrands);
r.get("/search", svc.search);

// SEPET & KUPON
r.get("/cart", svc.getCart);
r.post("/cart/items", svc.addToCart);
r.patch("/cart/items/:itemId", svc.updateCartItem);
r.delete("/cart/items/:itemId", svc.removeCartItem);
r.post("/cart/apply-coupon", svc.applyCoupon);
r.delete("/cart/coupon", svc.removeCoupon);

// CHECKOUT & SİPARİŞ
r.post("/checkout", svc.startCheckout);
r.post("/checkout/confirm", svc.confirmCheckout);
r.get("/orders", svc.myOrders);
r.get("/orders/:orderNo", svc.orderDetail);

// İSTEĞE BAĞLI
r.get("/wishlist", svc.getWishlist);
r.post("/wishlist", svc.addWishlist);
r.delete("/wishlist/:productId", svc.removeWishlist);

export default r;
