import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/Helpers/PageTitle";
import Layout from "@/components/Partials/Layout";
import { toast } from "react-toastify";

/* CART */
import {
  useGetMyCartQuery,
  useUpdatePricingMutation,
  useIncreaseQuantityMutation,
  useDecreaseQuantityMutation,
  useRemoveFromCartMutation,
} from "@/api-manage/api-call-functions/public/publicCart.api";

/* ORDERS */
import { useCreateOrderMutation } from "@/api-manage/api-call-functions/public/publicOrders.api";

/* UI parçaları */
import CouponBox from "./CouponBox";
import BillingForm from "./BillingForm";
import OrderSummary from "./OrderSummary";

/* ---- EK: productType normalize'i içeri al ---- */
import { normalizeProductType } from "@/api-manage/api-call-functions/public/publicCart.api";

/* -------- helpers -------- */
const envCurrency = (import.meta.env.VITE_CK_CURRENCY || "EUR").trim().toUpperCase();

const isHashRouter =
  (import.meta.env.VITE_ROUTER_MODE || "").toLowerCase() === "hash" ||
  (typeof window !== "undefined" && window.location.hash?.startsWith("#/"));

const buildUrl = (path) =>
  isHashRouter
    ? `${window.location.origin}/#${path.startsWith("/") ? path : `/${path}`}`
    : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;

const goSoft = (navigate, path) => {
  try {
    navigate(path, { replace: true });
  } catch {
    toast?.error?.("Navigation failed, redirecting...");
  }
};
const goHard = (path) => window.location.assign(path);

const pickCurrency = (cart) =>
  (cart?.currency || cart?.totals?.currency || envCurrency).toUpperCase();

const getProductId = (it) =>
  it?.productId || it?.product?._id || it?.product?.id || it?.product || it?.id;

const getProductType = (it) =>
  (it?.productType || it?.type || "product").toString().toLowerCase();

/** UI → API (validator: "cash_on_delivery" | "credit_card" | "paypal") */
const PAYMENT_ALIASES = {
  cash_on_delivery: [
    "cod", "cash_on_delivery", "cash", "kapida", "kapida_odeme", "kapıda", "kapıda_odeme",
    "bank", "bank_transfer", "eft", "havale" // bank transfer'ı da offline'a sabitliyoruz
  ],
  credit_card: [
    "card", "credit", "debit", "credit_card", "online",
    "stripe", "iyzico", "paytr", "craftgate", "visa", "mastercard", "amex"
  ],
  paypal: ["paypal", "pp"],
};
const mapUiPaymentToApi = (ui) => {
  const v = String(ui || "").toLowerCase().trim();
  for (const [canon, list] of Object.entries(PAYMENT_ALIASES)) if (list.includes(v)) return canon;
  return "credit_card";
};
const isOnlinePayment = (uiValue) => {
  const canon = mapUiPaymentToApi(uiValue);
  return canon === "credit_card" || canon === "paypal";
};

/** Zorunlu alanlar (delivery) */
const getMissingRequiredForDelivery = (form) => {
  const req = [
    ["firstName", "first name"],
    ["lastName", "last name"],
    ["phone", "phone"],
    ["address", "address"],
    ["city", "city"],
    ["zip", "zip/postalCode"],
    ["country", "country"],
  ];
  const missing = [];
  for (const [k, label] of req) if (!(String(form[k] ?? "").trim().length > 0)) missing.push(label);
  return missing;
};

export default function CheakoutPage() {
  const navigate = useNavigate();

  const { data: cart, isFetching: cartLoading, refetch: refetchCart } = useGetMyCartQuery();
  const [applyPricing, { isLoading: pricingBusy }] = useUpdatePricingMutation();
  const [incQty] = useIncreaseQuantityMutation();
  const [decQty] = useDecreaseQuantityMutation();
  const [removeLine] = useRemoveFromCartMutation();

  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    country: "", address: "", city: "", zip: "",
    createAccount: false, shipSame: true,
  });

  // Başlangıçta seçim yok → kullanıcı seçmeden ilerleyemez
  const [paymentMethod, setPaymentMethod] = useState("");
  const cartEmpty = useMemo(() => !cart || !cart.items?.length, [cart]);

  const onApplyCoupon = async (code) => {
    try {
      await applyPricing({ couponCode: String(code || "").trim() }).unwrap();
      refetchCart(); // await şart değil
    } catch (e) {
      console.error("Coupon apply failed:", e);
      alert(e?.data?.message || "Coupon could not be applied.");
    }
  };

  const onInc = async (it) => {
    try {
      await incQty({ productId: it.productId, productType: it.productType, quantity: 1 }).unwrap();
      refetchCart();
    } catch (e) { console.error(e); }
  };
  const onDec = async (it) => {
    try {
      await decQty({ productId: it.productId, productType: it.productType, quantity: 1 }).unwrap();
      refetchCart();
    } catch (e) { console.error(e); }
  };
  const onRemove = async (it) => {
    try {
      await removeLine({ lineId: it.lineId }).unwrap();
    } catch (e) { console.error(e); }
    refetchCart();
  };

  const onPlace = async () => {
    if (cartEmpty) return;

    const serviceType = "delivery";
    const missing = getMissingRequiredForDelivery(form);
    if (serviceType === "delivery" && missing.length) {
      alert(`Lütfen şu alanları doldurun: ${missing.join(", ")}.`);
      return;
    }

    if (!paymentMethod) {
      alert("Lütfen bir ödeme yöntemi seçin.");
      return;
    }

    const apiPaymentMethod = mapUiPaymentToApi(paymentMethod);
    const wantsOnline = isOnlinePayment(paymentMethod);
    const customerName = `${form.firstName} ${form.lastName}`.trim();

    const orderItems = (cart?.items || []).map((it) => ({
      product: getProductId(it),
      productType: normalizeProductType(getProductType(it)),
      quantity: Number(it.quantity || 1),
    }));

    // FE tarafında da beklenen toplamı ilet (backend doğrulaması için opsiyonel)
    const cartNumbers = cart?._numbers || {};
    const expectedAmount = Number(cartNumbers.total || 0);

    const orderPayload = {
      serviceType,
      paymentMethod: apiPaymentMethod,
      currency: pickCurrency(cart),
      expectedAmount,
      items: orderItems,
      shippingAddress: {
        name: customerName,
        phone: String(form.phone || "").trim(),
        street: String(form.address || "").trim(),
        city: String(form.city || "").trim(),
        postalCode: String(form.zip || "").trim(),
        country: String(form.country || "").trim(),
      },
    };

    const idempotencyKey = `order-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    let order;
    try {
      order = await createOrder({ data: orderPayload, idempotencyKey }).unwrap();
    } catch (err) {
      const e0 = err?.data?.errors?.[0];
      const msg = e0?.msg || err?.data?.message || err?.message || "Order could not be created.";
      console.error("Create order failed:", err);
      if (msg === "validation.shippingAddressRequired") {
        alert("Adres doğrulaması başarısız. Lütfen ad, telefon ve tam adres bilgilerini girin.");
      } else if (msg === "validation.invalidPaymentMethod") {
        alert("Geçersiz ödeme yöntemi. Kart için 'card/online', kapıda ödeme için 'cod', PayPal için 'paypal' seçin.");
      } else {
        alert(msg);
      }
      return;
    }

    const orderId = order?._id || order?.id;

    // OFFLINE → direkt success
    if (!wantsOnline) {
      const success = `/order-success?orderId=${orderId}`;
      goSoft(navigate, success);
      setTimeout(() => goHard(buildUrl(success)), 0);
      return;
    }

    // ONLINE → ödeme sayfasına yönlendir (provider artık PaymentPage’de method+env ile seçiliyor)
    const method = apiPaymentMethod;        // 'credit_card' | 'paypal'
    const qs = new URLSearchParams({ orderId, method }).toString();
    goSoft(navigate, `/payment?${qs}`);
    setTimeout(() => goHard(buildUrl(`/payment?${qs}`)), 0);
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
        <div className="w-full mb-5">
          <PageTitle
            title="Checkout"
            breadcrumb={[{ name: "home", path: "/" }, { name: "checkout", path: "/checkout" }]}
          />
        </div>

        <div className="checkout-main-content w-full">
          <div className="container-x mx-auto">
            <CouponBox onApply={onApplyCoupon} busy={pricingBusy} />
            <div className="w-full lg:flex lg:space-x-[30px]">
              <div className="lg:w-1/2 w-full">
                <BillingForm form={form} setForm={setForm} />
              </div>
              <div className="flex-1">
                <h1 className="sm:text-2xl text-xl text-qblack font-medium mb-5">Order Summary</h1>
                {cartLoading ? (
                  <div className="w-full px-10 py-[30px] border border-[#EDEDED] animate-pulse">Loading cart…</div>
                ) : (
                  <OrderSummary
                    cart={cart}
                    onInc={onInc}
                    onDec={onDec}
                    onRemove={onRemove}
                    placing={creatingOrder}
                    onPlace={onPlace}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
