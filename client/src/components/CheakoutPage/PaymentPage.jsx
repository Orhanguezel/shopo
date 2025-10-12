// src/components/CheakoutPage/PaymentPage.jsx
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Partials/Layout";
import PageTitle from "@/components/Helpers/PageTitle";
import { useGetMyOrderByIdQuery } from "@/api-manage/api-call-functions/public/publicOrders.api";
import {
  useInitCheckoutIntentMutation,
  useInitIntentByAmountMutation,
} from "@/api-manage/api-call-functions/public/publicPayments.api";

/* Stripe */
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

import { toast } from "react-toastify";

/* Local */
import StripeCardForm from "./payment/StripeCardForm";

/* ===== ENV / utils ===== */
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

const DEFAULT_CARD_PROVIDER = (import.meta.env.VITE_CK_PROVIDER || "stripe").trim();

const isHashRouter =
  (import.meta.env.VITE_ROUTER_MODE || "").toLowerCase() === "hash" ||
  (typeof window !== "undefined" && window.location.hash?.startsWith("#/"));

const buildUrl = (path) =>
  isHashRouter
    ? `${window.location.origin}/#${path.startsWith("/") ? path : `/${path}`}`
    : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;

/* --- secret doğrulayıcılar --- */
const isCheckoutSessionSecret = (s) =>
  typeof s === "string" && /^cs_(test|live)_/.test(s);
const isLikelyValidCs = (s) => isCheckoutSessionSecret(s) && s.length >= 40;

const isPIorSISecret = (s) =>
  typeof s === "string" &&
  (s.startsWith("pi_") || s.startsWith("seti_")) &&
  s.includes("_secret_");

/* ========================================================================== */
export default function PaymentPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const orderId = sp.get("orderId") || "";
  const methodFromUrl = (sp.get("method") || "credit_card").trim();
  const method = useMemo(
    () => (methodFromUrl === "paypal" ? "paypal" : "credit_card"),
    [methodFromUrl]
  );

  const provider = useMemo(
    () => (method === "paypal" ? "paypal" : DEFAULT_CARD_PROVIDER),
    [method]
  );

  const { data: order, isFetching } = useGetMyOrderByIdQuery(orderId, { skip: !orderId });

  const [initCheckoutIntent] = useInitCheckoutIntentMutation();
  const [initLegacyIntent] = useInitIntentByAmountMutation();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Stripe states
  const [stripePISecret, setStripePISecret] = useState(""); // pi_..._secret_... / seti_..._secret_...
  const [checkoutSecret, setCheckoutSecret] = useState(""); // cs_...
  const [hostedUrl, setHostedUrl] = useState("");

  const returnUrl = buildUrl(`/order-success?orderId=${orderId}`);
  const cancelUrl  = buildUrl(`/checkout?orderId=${orderId}&cancel=1`);

  const tried = useRef(false);
  const fallbackTried = useRef(false);

  const resetState = useCallback(() => {
    setError("");
    setStripePISecret("");
    setCheckoutSecret("");
    setHostedUrl("");
  }, []);

  // clean on orderId/method/provider change
  useEffect(() => {
    resetState();
    tried.current = false;
    fallbackTried.current = false;
  }, [orderId, method, provider, resetState]);

  // hosted → auto redirect
  useEffect(() => {
    if (!hostedUrl) return;
    try { window.location.replace(hostedUrl); } catch { window.location.href = hostedUrl; }
  }, [hostedUrl]);

  const callInit = useCallback(
    async (opts, useLegacy = false) => {
      try {
        if (useLegacy) {
          return await initLegacyIntent({
            data: opts.data,
            idempotencyKey: opts.idempotencyKey,
          }).unwrap();
        }
        return await initCheckoutIntent({
          data: opts.data,
          idempotencyKey: opts.idempotencyKey,
        }).unwrap();
      } catch (e) {
        const htmlErr = e?.data && typeof e.data === "string" && e.data.includes("<!DOCTYPE");
        const msg = htmlErr
          ? "Sunucudan beklenmeyen HTML yanıtı (muhtemel 404/Proxy). /payments/intents/checkout endpoint’ini kontrol edin."
          : (e?.data?.message || e?.message || "İstek başarısız.");
        throw new Error(msg);
      }
    },
    [initCheckoutIntent, initLegacyIntent]
  );

  // normalize — {success,data} / {data:{data}} / plain
  const pickOut = useCallback((r) => {
    const src =
      (r && typeof r === "object")
        ? (r?.data?.data ?? r?.data ?? r)
        : r;
    const hosted = src?.hostedUrl || src?.payment?.hostedUrl || src?.url;
    const cs = src?.clientSecret || src?.payment?.clientSecret;
    return { hosted, cs };
  }, []);

  // PK/CS mod eşleşmesi (test/live)
  const pkMode = useMemo(
    () => (STRIPE_PK.startsWith("pk_test_") ? "test" : STRIPE_PK ? "live" : "none"),
    [] // STRIPE_PK build-time sabit; memo deps boş olabilir
  );
  const csMode = useMemo(
    () => (checkoutSecret ? (checkoutSecret.startsWith("cs_test_") ? "test" : "live") : "none"),
    [checkoutSecret]
  );
  const embeddedModeMatches = !!(checkoutSecret && STRIPE_PK && pkMode === csMode);

  /** Gelen cs_ değerini doğrula */
  const handleCheckoutSecret = useCallback(async () => {
    if (!checkoutSecret) return;

    // Yanlış tip: cs_ değilse asla Embedded render etme
    if (!isCheckoutSessionSecret(checkoutSecret)) {
      setCheckoutSecret("");
      return;
    }

    // Geçerli ve mod uyumlu ise → Embedded'a izin ver (hata temizle)
    if (isLikelyValidCs(checkoutSecret) && embeddedModeMatches) {
      setError("");
      return;
    }

    // Aksi halde Hosted → Elements fallback
    try {
      const idem = `pay-${orderId}-card-hosted-${Date.now()}`;
      const hostedTry = await callInit({
        data: {
          provider: "stripe",
          orderId,
          method: "card",
          returnUrl,
          cancelUrl,
          metadata: { source: "web", orderId, ui_mode: "hosted", integration: "react" },
        },
        idempotencyKey: idem,
      });
      const { hosted } = pickOut(hostedTry);
      if (hosted) { setHostedUrl(hosted); setCheckoutSecret(""); return; }
    } catch { /* devam */ }

    try {
      const idem2 = `pay-${orderId}-card-elements-${Date.now()}`;
      const elTry = await callInit({
        data: {
          provider: "stripe",
          orderId,
          method: "card",
          returnUrl,
          cancelUrl,
          metadata: { source: "web", orderId, ui_mode: "elements", integration: "react" },
        },
        idempotencyKey: idem2,
      });
      const { cs } = pickOut(elTry);
      if (isPIorSISecret(cs)) { setStripePISecret(cs); setCheckoutSecret(""); return; }
    } catch { /* ignore */ }

    setError("Embedded için geçerli client_secret alınamadı; Hosted/Elements da açılamadı.");
  }, [checkoutSecret, embeddedModeMatches, orderId, callInit, pickOut, returnUrl, cancelUrl]);

  // Bootstrap
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!orderId || tried.current) return;

      tried.current = true;
      setLoading(true);
      resetState();

      try {
        if (method === "paypal") {
          const idem = `pay-${orderId}-paypal-${Date.now()}`;
          const res = await callInit({
            data: {
              provider: "paypal",
              orderId,
              method: "wallet",
              returnUrl,
              cancelUrl,
              metadata: { source: "web", orderId },
            },
            idempotencyKey: idem,
          });
          if (!mounted) return;
          const { hosted } = pickOut(res);
          if (hosted) { setHostedUrl(hosted); return; }

          const res2 = await callInit({
            data: {
              provider: "paypal",
              orderId,
              method: "wallet",
              returnUrl,
              cancelUrl,
              metadata: { source: "web", orderId },
            },
            idempotencyKey: idem,
          }, true);
          if (!mounted) return;
          const { hosted: hosted2 } = pickOut(res2);
          if (hosted2) { setHostedUrl(hosted2); return; }

          throw new Error("PayPal yönlendirme URL’si alınamadı.");
        }

        if (provider !== "stripe") {
          throw new Error(`Kart sağlayıcısı desteklenmiyor: ${provider}`);
        }
        if (!STRIPE_PK || !stripePromise) {
          throw new Error("Stripe publishable key eksik veya Stripe JS yüklenemedi.");
        }

        const idem = `pay-${orderId}-card-${provider}-${Date.now()}`;

        // Embedded talep et
        const res = await callInit({
          data: {
            provider: "stripe",
            orderId,
            method: "card",
            returnUrl,
            cancelUrl,
            metadata: { source: "web", orderId, ui_mode: "embedded", integration: "react" },
          },
          idempotencyKey: idem,
        });

        if (!mounted) return;
        const { hosted, cs } = pickOut(res);

        if (hosted) { setHostedUrl(hosted); return; }
        if (isPIorSISecret(cs)) { setStripePISecret(cs); return; }   // yanlışlıkla PI geldiyse Elements’a geç
        if (isLikelyValidCs(cs)) { setCheckoutSecret(cs); return; }  // geçerli cs ise Embedded dene

        // cs “şüpheli” → zorunlu fallback (Hosted → Elements)
        try {
          const hostedTry = await callInit({
            data: {
              provider: "stripe",
              orderId,
              method: "card",
              returnUrl,
              cancelUrl,
              metadata: { source: "web", orderId, ui_mode: "hosted", integration: "react" },
            },
            idempotencyKey: `hosted-${idem}`,
          });
          const { hosted: h2 } = pickOut(hostedTry);
          if (h2) { setHostedUrl(h2); return; }
        } catch {
          toast("Alternatif Hosted ödeme sayfası açılamadı.", { type: "error" });
        }

        try {
          const elTry = await callInit({
            data: {
              provider: "stripe",
              orderId,
              method: "card",
              returnUrl,
              cancelUrl,
              metadata: { source: "web", orderId, ui_mode: "elements", integration: "react" },
            },
            idempotencyKey: `elements-${idem}`,
          });
          const { cs: cs2 } = pickOut(elTry);
          if (isPIorSISecret(cs2)) { setStripePISecret(cs2); return; }
        } catch {
          toast("Alternatif Elements ödeme formu açılamadı.", { type: "error" });
        }

        throw new Error("Stripe clientSecret/hostedUrl sağlanmadı (veya geçersiz).");
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Ödeme başlatılamadı.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => { mounted = false; };
  }, [orderId, method, provider, callInit, pickOut, returnUrl, cancelUrl, resetState]);

  // cs_ geldiğinde: geçerliyse sadece hatayı temizle; değilse fallback
  useEffect(() => { handleCheckoutSecret(); }, [handleCheckoutSecret]);

  // Embedded iframe watchdog (cs_ var ama hiçbir iframe render olmadı)
  useEffect(() => {
    if (!checkoutSecret || fallbackTried.current) return;

    const t = setTimeout(async () => {
      const iframe = document.querySelector(
        'iframe[title="Embedded Checkout"],iframe[src*="embedded-checkout"],iframe[src*="checkout/embed"],iframe[src*="//checkout.stripe.com"],iframe[src*="embedded"]'
      );

      if (iframe) {
        // Bazı temalarda yükseklik 0 olabiliyor → minHeight zorla
        try {
          const h = Number(iframe.clientHeight || 0);
          if (h < 100) {
            iframe.style.minHeight = "640px";
            iframe.style.height = "640px";
            iframe.style.width = "100%";
            iframe.style.display = "block";
          }
        } catch {/* noop */}
        setError(""); // iframe varsa hata göstermeyelim
        return;
      }

      // Fallback'ler
      try {
        fallbackTried.current = true;
        const idem = `pay-${orderId}-card-hosted-${Date.now()}`;
        const hostedTry = await callInit({
          data: {
            provider: "stripe",
            orderId,
            method: "card",
            returnUrl,
            cancelUrl,
            metadata: { source: "web", orderId, ui_mode: "hosted", integration: "react" },
          },
          idempotencyKey: idem,
        });
        const { hosted } = pickOut(hostedTry);
        if (hosted) { setHostedUrl(hosted); setCheckoutSecret(""); return; }
      } catch {
        toast("Hosted ödeme sayfası açılamadı.", { type: "error" });
      }

      try {
        const idem2 = `pay-${orderId}-card-elements-${Date.now()}`;
        const elTry = await callInit({
          data: {
            provider: "stripe",
            orderId,
            method: "card",
            returnUrl,
            cancelUrl,
            metadata: { source: "web", orderId, ui_mode: "elements", integration: "react" },
          },
          idempotencyKey: idem2,
        });
        const { cs } = pickOut(elTry);
        if (isPIorSISecret(cs)) { setStripePISecret(cs); setCheckoutSecret(""); return; }
      } catch {
        toast("Elements ödeme formu açılamadı.", { type: "error" });
      }

      setError("Stripe Embedded form görüntülenemedi ve alternatif akışlar (Hosted/Elements) da açılamadı.");
    }, 7000);

    return () => clearTimeout(t);
  }, [checkoutSecret, orderId, callInit, pickOut, returnUrl, cancelUrl]);

  // Stripe iframe var mı?
  const hasStripeIframe = typeof document !== "undefined" &&
    !!document.querySelector('iframe[src*="stripe"]');

  const backToCheckout = () => navigate("/checkout", { replace: true });

  return (
    <Layout>
      <div className="w-full mb-5">
        <PageTitle
          title="Payment"
          breadcrumb={[
            { name: "home", path: "/" },
            { name: "checkout", path: "/checkout" },
            { name: "payment", path: "/payment" },
          ]}
        />
      </div>

      <div className="container-x mx-auto pb-12">
        <div className="max-w-xl mx-auto border border-[#EDEDED] p-6 rounded">
          {/* DEBUG */}
          <div className="mb-4 text-xs bg-yellow-50 border border-yellow-200 p-3 rounded leading-5">
            <div><b>DEBUG</b></div>
            <div>origin: {typeof window !== "undefined" ? window.location.origin : "—"}</div>
            <div>orderId: {orderId || "—"}</div>
            <div>method/provider: {method}/{provider}</div>
            <div>STRIPE_PK: {STRIPE_PK ? (pkMode === "test" ? "TEST" : "LIVE") : "MISSING"}</div>
            <div>checkoutSecret(cs_…): {checkoutSecret ? `${csMode.toUpperCase()}` : "NO"}</div>
            <div>pi/seti secret: {stripePISecret ? "YES" : "NO"}</div>
            <div>hostedUrl: {hostedUrl ? "YES" : "NO"}</div>
            <div>iframe(stripe): {hasStripeIframe ? "YES" : "NO"}</div>
            <div>loading: {String(loading)} | error: {error ? "YES" : "NO"}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={async () => {
                try {
                  const r = await callInit({
                    data: { provider: "stripe", orderId, method: "card", returnUrl, cancelUrl,
                      metadata: { source: "web", orderId, ui_mode: "hosted", integration: "react" } },
                    idempotencyKey: `dbg-hosted-${Date.now()}`
                  });
                  const { hosted } = pickOut(r);
                  if (hosted) setHostedUrl(hosted);
                  else toast("BE hostedUrl döndürmedi.", { type: "error" });
                } catch (e) { toast(String(e?.message || e), { type: "error" }); }
              }} className="px-2 py-1 border rounded">Force Hosted</button>

              <button onClick={async () => {
                try {
                  const r = await callInit({
                    data: { provider: "stripe", orderId, method: "card", returnUrl, cancelUrl,
                      metadata: { source: "web", orderId, ui_mode: "elements", integration: "react" } },
                    idempotencyKey: `dbg-elements-${Date.now()}`
                  });
                  const { cs } = pickOut(r);
                  if (isPIorSISecret(cs)) { setStripePISecret(cs); setCheckoutSecret(""); }
                  else toast("BE pi_*_secret_* döndürmedi.", { type: "error" });
                } catch (e) { toast(String(e?.message || e), { type: "error" }); }
              }} className="px-2 py-1 border rounded">Force Elements</button>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Ödeme</h2>

          {/* Sipariş özeti */}
          {isFetching ? (
            <p>Order bilgileri yükleniyor…</p>
          ) : order ? (
            <div className="text-sm text-qgray mb-6 space-y-1">
              <div>Order No: <strong>{order.orderNo || order._id || order.id}</strong></div>
              <div>
                Tutar:{" "}
                <strong>
                  {order.totals?.total ||
                    order.totalStr ||
                    `${(order.finalTotal_cents ?? 0) / 100} ${order.currency || ""}`}
                </strong>
              </div>
            </div>
          ) : (
            <p className="text-red-600 mb-6">Sipariş bulunamadı.</p>
          )}

          {/* Hata mesajı (iframe varsa gizle) */}
          {error && !hasStripeIframe && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          {/* STRIPE: Embedded Checkout */}
          {method === "credit_card" &&
            provider === "stripe" &&
            checkoutSecret &&
            embeddedModeMatches &&
            stripePromise && (
              <EmbeddedCheckoutProvider
                key={`emb-${checkoutSecret}`}
                stripe={stripePromise}
                options={{ clientSecret: checkoutSecret }}
              >
                {/* Kapsayıcıya sabit yükseklik: bazı temalarda iframe 0px kalmasını engeller */}
                <div id="stripe-embedded-container" className="mb-4" style={{ minHeight: 640 }}>
                  <EmbeddedCheckout />
                </div>
              </EmbeddedCheckoutProvider>
            )}

          {/* STRIPE: Payment Element */}
          {method === "credit_card" && provider === "stripe" && stripePISecret && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: stripePISecret, appearance: { theme: "stripe" } }}
            >
              <StripeCardForm returnUrl={returnUrl} />
            </Elements>
          )}

          {/* PayPal info */}
          {method === "paypal" && !error && !hostedUrl && (
            <div className="text-sm text-qgray mb-4">
              {loading ? "PayPal’a yönlendiriliyorsunuz…" : "PayPal yönlendirme bekleniyor…"}
            </div>
          )}

          {/* Hiçbiri yoksa bilgi */}
          {!checkoutSecret && !stripePISecret && !hostedUrl && (
            <div className="text-sm text-qgray mb-4">
              {loading ? "Ödeme hazırlanıyor…" : "Ödeme ekranı yüklenemedi. (DEBUG panelini kontrol edin)"}
            </div>
          )}

          {/* Aksiyonlar */}
          <div className="flex gap-2 mt-4">
            <button onClick={() => navigate("/checkout", { replace: true })} className="px-4 py-2 rounded border">Checkout’a Dön</button>
            <Link to="/cart" className="px-4 py-2 rounded border">Sepete Dön</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
