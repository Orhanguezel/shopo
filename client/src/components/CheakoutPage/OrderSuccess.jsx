// src/pages/OrderSuccess.jsx
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Partials/Layout";
import PageTitle from "@/components/Helpers/PageTitle";
import { useMeQuery } from "@/api-manage/api-call-functions/public/publicAuth.api";
import { useGetMyOrderByIdQuery } from "@/api-manage/api-call-functions/public/publicOrders.api";

const fmtMoney = (cents, currency) => {
  if (cents == null) return "—";
  const v = Number(cents) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "EUR",
    }).format(v);
  } catch {
    return `${v.toFixed(2)} ${currency || ""}`.trim();
  }
};

// parse number-ish string safely
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function OrderSuccess() {
  const { search } = useLocation();
  const { data: me } = useMeQuery();

  const q = useMemo(() => new URLSearchParams(search), [search]);

  // orderId, status ve provider referansı (Stripe vb. için olası isimler)
  const orderId = q.get("orderId") || q.get("order_id") || "";
  const urlStatus =
    (q.get("status") ||
      q.get("redirect_status") || // Stripe
      "").toLowerCase();

  const providerRef =
    q.get("providerRef") ||
    q.get("payment_intent") || // Stripe PI
    q.get("session_id") || // Stripe Checkout Session
    q.get("pi") ||
    "";

  // URL ile gelen amount/currency (çoğu sağlayıcı göndermiyor)
  const urlAmount = num(q.get("amount"));
  const urlCurrency = q.get("currency") || import.meta.env.VITE_CK_CURRENCY || "EUR";

  // Sipariş verisini orderId varsa çek
  const {
    data: order,
    isFetching: orderLoading,
  } = useGetMyOrderByIdQuery(orderId, { skip: !orderId });

  // order’dan amount/currency & providerRef çıkar (URL yoksa)
  const orderCurrency =
    order?.currency ||
    order?.totals?.currency ||
    urlCurrency;

  const orderAmountCents =
    num(order?.finalTotal_cents) ??
    num(order?.totals?.finalTotal_cents) ??
    num(order?.totals?.total_cents) ??
    (order?.finalTotal ? Math.round(Number(String(order.finalTotal).replace(/[^\d.,-]/g, "").replace(",", ".")) * 100) : null);

  const refFromOrder =
    order?.payment?.providerRef ||
    order?.payment?.externalId ||
    order?.payment?.id ||
    "";

  // ekranda gösterilecek tutar (önce URL, yoksa order’dan)
  const displayAmount = urlAmount != null
    ? // 4+ basamaklıysa (örn 1990) minor kabul et
      (urlAmount >= 100 ? fmtMoney(urlAmount, urlCurrency) : fmtMoney(Math.round(urlAmount * 100), urlCurrency))
    : (orderAmountCents != null ? fmtMoney(orderAmountCents, orderCurrency) : "—");

  // Provider referansı: URL yoksa order’dan
  const displayRef = providerRef || refFromOrder || "—";

  // Başarı / hata
  const ok =
    urlStatus
      ? !["cancel", "canceled", "failed", "error"].includes(urlStatus)
      : true; // status yoksa success varsay

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="w-full bg-white pb-[60px]">
        <PageTitle
          title={ok ? "Thank you!" : "Payment Status"}
          breadcrumb={[
            { name: "home", path: "/" },
            { name: "Order Success", path: "/order-success" },
          ]}
        />

        <div className="container-x mx-auto">
          <div className="max-w-2xl mx-auto border border-[#EDEDED] rounded p-8 text-center">
            {ok ? (
              <>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 7L9 18L4 13" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-qblack mb-2">Payment Successful</h1>
                <p className="text-qgray mb-6">
                  {me?.email ? (
                    <>
                      We’ve emailed a confirmation to{" "}
                      <span className="text-qblack font-medium">{me.email}</span>.
                    </>
                  ) : (
                    <>Your order has been received.</>
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8">
                  <div className="border border-[#EDEDED] rounded p-4">
                    <p className="text-xs uppercase text-qgraytwo mb-1">Status</p>
                    <p className="font-medium text-qblack">
                      {orderLoading ? "…" : "Succeeded"}
                    </p>
                  </div>

                  <div className="border border-[#EDEDED] rounded p-4">
                    <p className="text-xs uppercase text-qgraytwo mb-1">Amount</p>
                    <p className="font-medium text-qblack">
                      {orderLoading ? "…" : displayAmount}
                    </p>
                  </div>

                  <div className="border border-[#EDEDED] rounded p-4">
                    <p className="text-xs uppercase text-qgraytwo mb-1">Reference</p>
                    <p className="font-medium text-qblack break-all">
                      {orderLoading ? "…" : displayRef}
                    </p>
                  </div>
                </div>

                {/* İsteğe bağlı: sipariş no/bağlantı */}
                {order?.orderNo && (
                  <p className="text-sm text-qgray mb-6">
                    Order No: <span className="text-qblack font-medium">{order.orderNo}</span>
                  </p>
                )}

                <div className="flex items-center justify-center gap-3">
                  <Link to="/" className="black-btn h-[46px] px-5 flex items-center justify-center">
                    Continue Shopping
                  </Link>
                  <Link to="/profile" className="border border-qgray px-5 h-[46px] rounded flex items-center">
                    Go to Account
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-qblack mb-2">Payment Not Completed</h1>
                <p className="text-qgray mb-6">It looks like your payment was canceled or failed.</p>

                <div className="flex items-center justify-center gap-3">
                  <Link to="/checkout" className="black-btn h-[46px] px-5 flex items-center justify-center">
                    Try Again
                  </Link>
                  <Link to="/" className="border border-qgray px-5 h-[46px] rounded flex items-center">
                    Back to Home
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
