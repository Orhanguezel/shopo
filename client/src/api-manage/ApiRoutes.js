import { rest } from "./routerFactory";
import { REGISTRY, AUTH_PREFIX as REG_AUTH_PREFIX } from "./registry";
import { apiUrl } from "./config";

/* ---------- helpers ---------- */
const build = (tree) => {
  const out = {};
  Object.entries(tree || {}).forEach(([k, base]) => {
    out[k] = rest(base);
  });
  return out;
};

/* ---------- Prefix normalize ---------- */
// Gelen değerler "auth", "/users/authlite", "api/users/authlite" vs olabilir.
// Hepsini "users/authlite" şekline indiriyoruz.
const normalizePrefix = (v, fallback) => {
  const s = (v || fallback || "").toString().trim();
  if (!s) return fallback;
  // s: "auth" ise eski kısa isim → authlite'a map’le
  const raw = s === "auth" ? "users/authlite" : s;
  // "api/..." veya ön/arka slashları at
  return raw.replace(/^\/+|\/+$/g, "").replace(/^api\//, "");
};

/* === Prefixes === */
const AUTH_PREFIX = normalizePrefix(
  REG_AUTH_PREFIX || import.meta.env.VITE_AUTH_PREFIX,
  "users/authlite"
);

const USERS_PREFIX = normalizePrefix(import.meta.env.VITE_USERS_PREFIX, "users");

const auth  = (p = "")  => apiUrl(`${AUTH_PREFIX}/${String(p).replace(/^\/+/, "")}`);
const users = (p = "")  => apiUrl(`${USERS_PREFIX}/${String(p).replace(/^\/+/, "")}`);

/* ----------------------------
 * REGISTRY + FALLBACK MERGE
 * ---------------------------- */
const ADMIN_FALLBACKS = { orders: "orders/admin", payments: "payments/admin" };
const ADMIN_TREE = { ...(REGISTRY.admin || {}), ...ADMIN_FALLBACKS };

const PUBLIC_FALLBACKS = {
  products: "product",
  categories: "category",
  brands: "brand",
  reviews: "review",
  variants: "variants",
  cart: "cart",
  wishlist: "wishlist",
  compare: "compare",
  coupon: "coupon",
  company: "company",
  reports: "reports/public",
  comments: "comment",
  address: "address",
  about: "about",
  news: "news",
  contact: "contact",
  faqs: "faq",
  sellers: "sellers",
  orders: "orders",
  order: "orders",
  webhooks: "webhooks",
  payments: "payments",
};
const PUBLIC_TREE = { ...(REGISTRY.public || {}) };
Object.entries(PUBLIC_FALLBACKS).forEach(([k, v]) => {
  if (!PUBLIC_TREE[k]) PUBLIC_TREE[k] = v;
});

export const R = {
  admin: build(ADMIN_TREE),
  public: build(PUBLIC_TREE),

  /* ============ AUTHLITE (users/authlite) ============ */
  authlite: {
    me:                 () => auth("me"),
    logout:             () => auth("logout"),
    registerEmail:      () => auth("register-email"),
    loginEmail:         () => auth("login-email"),
    loginGoogle:        () => auth("login-google"),
    loginFacebook:      () => auth("login-facebook"),
    forgotPassword:     () => auth("forgot-password"),
    resetPassword:      () => auth("reset-password"),
    changePassword:     () => auth("change-password"),
    changeEmailStart:   () => auth("change-email/start"),
    changeEmailConfirm: () => auth("change-email/confirm"),
    updateProfile:      () => auth("profile"),

    identities:       () => auth("identities"),
    unlinkIdentity:   (provider) => auth(`identities/${provider}`),

    // 🔧 Swagger’daki doğru yollar:
    linkGoogle:       () => auth("link-google"),
    linkFacebook:     () => auth("link-facebook"),

    // dev
    devPeekReset:       () => auth("__dev/peek-reset"),
    devPeekEmailChange: () => auth("__dev/peek-email-change"),
  },

  /* ============ USERS (users/...) ============ */
  users: {
    register: () => users("register"),
    login:    () => users("login"),
    logout:   () => users("logout"),
    changePassword: () => users("change-password"),
    forgotPassword: () => users("forgot-password"),
    resetByToken:   (token) => users(`reset-password/${token}`),
    account: {
      // bazı projelerde me burada tutuluyor; ayrı bırakıyorum:
      me:            () => users("authlite/me"),
      update:        () => users("account/me/update"),
      password:      () => users("account/me/password"),
      notifications: () => users("account/me/notifications"),
      social:        () => users("account/me/social"),
      delete:        () => users("account/me/delete"),
      profileImage:  () => users("account/me/profile-image"),
      fullProfile:   () => users("account/me/full-profile"),
    },
    advancedAuth: {
      sendVerification: () => users("advanced-auth/send-verification"),
      verifyEmail:      () => users("advanced-auth/verify-email"),
      sendOtp:          () => users("advanced-auth/send-otp"),
      verifyOtp:        () => users("advanced-auth/verify-otp"),
      resendOtp:        () => users("advanced-auth/resend-otp"),
      enableMfa:        () => users("advanced-auth/enable-mfa"),
      verifyMfa:        () => users("advanced-auth/verify-mfa"),
    },
  },
};

/* ---- Public kısa yollar (değişmedi) ---- */
export const Extra = {
  public: {
    products: {
      bySlug: (slug) => R.public.products.$.slug(slug),
      popular: () => R.public.products.$.custom("popular"),
      latest: () => R.public.products.$.custom("latest"),
      discounted: () => R.public.products.$.custom("discounted"),
      search: () => R.public.products.$.custom("search"),
      submitReview: () => R.public.products.$.custom("reviews/submit"),
      byId: (id) => R.public.products.get(id),
      report: (id) => R.public.products.$.child(id).custom("report"),
    },
    cart: {
      list: () => R.public.cart.list(),
      add: () => R.public.cart.$.custom("add"),
      increase: () => R.public.cart.$.custom("increase"),
      decrease: () => R.public.cart.$.custom("decrease"),
      remove: () => R.public.cart.$.custom("remove"),
      clear: () => R.public.cart.$.custom("clear"),
      items: {
        create: () => R.public.cart.$.child("items").create(),
        byId: (lineId) => R.public.cart.$.child("items").byId(lineId),
      },
      pricing: () => R.public.cart.$.custom("pricing"),
      checkout: () => R.public.cart.$.custom("checkout"),
    },
    wishlist: {
      me: () => R.public.wishlist.$.custom("me"),
      items: () => R.public.wishlist.$.custom("items"),
      clear: () => R.public.wishlist.$.custom("clear"),
      merge: () => R.public.wishlist.$.custom("merge"),
    },
    compare: {
      me: () => R.public.compare.$.custom("me"),
      items: () => R.public.compare.$.custom("items"),
      clear: () => R.public.compare.$.action("clear"),
      merge: () => R.public.compare.$.action("merge"),
    },
    reviews: {
      list: () => R.public.reviews.list(),
      stats: () => R.public.reviews.$.custom("stats"),
      create: () => R.public.reviews.create(),
      like: (id) => R.public.reviews.$.child(id).custom("like"),
      dislike: (id) => R.public.reviews.$.child(id).custom("dislike"),
    },
    variants: {
      byProduct: (productId) => R.public.variants.$.custom(`by-product/${productId}`),
      resolve:   () => R.public.variants.$.custom("resolve"),
      bySku:     (sku) => R.public.variants.$.custom(`sku/${encodeURIComponent(sku)}`),
    },
    coupon: {
      list: () => R.public.coupon.list(),
      check: (code) => R.public.coupon.$.child("check").byId(code),
    },
    categories: {
      list: () => R.public.categories.list(),
      tree: () => R.public.categories.$.custom("tree"),
      bySlug: (slug) => R.public.categories.$.slug(slug),
      byId: (id) => R.public.categories.get(id),
    },
    brands: {
      list: () => R.public.brands.list(),
      bySlug: (slug) => R.public.brands.$.slug(slug),
      byId: (id) => R.public.brands.get(id),
    },
    company: { get: () => R.public.company.list() },
    reports: {
      definitions: {
        list:   () => R.public.reports.$.child("definitions").list(),
        create: () => R.public.reports.$.child("definitions").create(),
        byId:   (id) => R.public.reports.$.child("definitions").byId(id),
      },
      runs: {
        list:   () => R.public.reports.$.child("runs").list(),
        create: () => R.public.reports.$.child("runs").create(),
        byId:   (id) => R.public.reports.$.child("runs").byId(id),
      },
      analytics: {
        salesHourly:         () => R.public.reports.$.custom("analytics/sales/hourly"),
        couponsPerformance:  () => R.public.reports.$.custom("analytics/coupons/performance"),
        ordersCancellations: () => R.public.reports.$.custom("analytics/orders/cancellations"),
      },
    },
    address: {
      list:       () => R.public.address.list(),
      create:     () => R.public.address.create(),
      byId:       (id) => R.public.address.get(id),
      user:       () => R.public.address.$.custom("user"),
      replaceAll: () => R.public.address.$.custom("all/replace"),
      replaceAllUser: () => R.public.address.$.custom("user/all/replace"),
      byCompany:  (companyId) => R.public.address.$.custom(`company/${companyId}`),
      replaceAllCompany: (companyId) =>
        R.public.address.$.custom(`company/${companyId}/all/replace`),
    },
  },
  admin: {
    payments: { webhooks: () => R.admin.payments?.$.custom("webhooks") },
  },
};
