// src/api-manage/registry.js

// Auth prefix'i ENV'den yönet (auth | authlite | users ...)
// Not: Bu dosyada sadece referans, gerçek auth uçları ApiRoutes.js içinde AUTH_PREFIX ile üretiliyor.
export const AUTH_PREFIX = (import.meta.env.VITE_AUTH_PREFIX || "auth")
  .replace(/^\/+|\/+$/g, "");

/** 
 * KÖK KAYNAK HARİTASI
 * - Admin: bütün modüller "modul/admin" kuralına uygun
 * - Public: mevcut dosya yapına göre (customer/*, items/reviews, vb.) korunarak genişletildi
 * - Bazı dosya adı varyasyonları için alias key'ler eklendi (feesApi, reviewsApi, returns vs.)
 */
export const REGISTRY = {
  /* ===================== ADMIN ===================== */
  admin: {
    about:            "aboutus/admin",
    attributes:       "attributes/admin",
    brands:           "brand/admin",
    cart:             "cart/admin",
    categories:       "category/admin",
    compare:          "compare/admin",
    coupon:           "coupon/admin",

    // fees / feesApi (alias)
    fees:             "fees/admin",
    feesApi:          "fees/admin",

    giftcards:        "giftcard/admin",
    inventory:        "inventory/admin",
    loyalty:          "loyalty/admin",
    media:            "media/admin",
    orders:           "orders/admin",

    // payments / gateways / webhooks
    payments:         "payments/admin",
    gateways:         "gateways/admin",        // istersen "payments/gateways/admin" yapabilirsin
    webhooks:         "webhooks/admin",        // istersen "payments/webhooks/admin" yapabilirsin

    checkout:         "checkout/admin",

    // products / variants
    products:         "product/admin",
    variants:         "variant/admin",

    // returns / return (alias)
    return:           "return/admin",
    returns:          "return/admin",

    reports:         "reports/admin",

    // reviews / reviewsApi (alias)
    reviews:          "reviews/admin",
    reviewsApi:       "reviews/admin",

    search:           "search/admin",

    // shipping*
    shipments:        "shipping/shipments/admin",
    shippingMethod:   "shipping/method/admin",
    shippingZones:    "shipping/zones/admin",

    stockledger:      "stockledger/admin",
    storefront:       "storefront/admin",
    wishlist:         "wishlist/admin",
  },

  /* ===================== PUBLIC ===================== */
  public: {
    // shipping*
    shippingZones:    "shipping/zones",
    shipments:        "shipping/shipments",
    shippingMethods:  "shipping/methods",

    // wishlist / cart
    wishlist:         "wishlist",
    cart:             "cart",

    // ürün ve varyant
    products:         "product",
    variants:         "variants",

    // taksonomi, vitrin, ayarlar
    taxonomy:         "taxonomy",
    storefront:       "storefront",
    settings:         "settings",

    // arama & iade & yorum
    search:           "search",
    returns:          "returns",
    reviews:          "review",

    // ödeme, sipariş, medya
    payments:         "payments",
    orders:           "orders",
    media:            "media",

    // sadakat, hediye, ücret/kupon/karşılaştırma
    loyalty:          "loyalty",
    giftcards:        "giftcard",
    fees:             "fees",
    coupon:           "coupon",
    compare:          "compare",

    // şirket, kategoriler, markalar, özellikler, hakkımızda
    company:          "company",
    categories:       "category",
    brands:           "brand",
    attributes:       "attributes",
    about:            "aboutus",

    // checkout (EKLENDİ)
    checkout:         "checkout",

    authlite:         `${AUTH_PREFIX}`, // authlite prefix'li auth uçları
  },
};

