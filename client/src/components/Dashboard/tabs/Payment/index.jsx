// src/components/Dashboard/tabs/Payment/index.jsx
import { useMemo, useState } from "react";
import IntentPlayground from "./IntentPlayground";
import CaptureForm from "./CaptureForm";
import RefundForm from "./RefundForm";
import WebhookTools from "./WebhookTools";
import GatewaysManager from "./GatewaysManager";

const DEFAULT_PROVIDER = import.meta.env.VITE_CK_PROVIDER || "stripe";
const DEFAULT_CURRENCY = import.meta.env.VITE_CK_CURRENCY || "EUR";

// HashRouter mı? (return/cancel URL üretmek için)
const isHash =
  (import.meta.env.VITE_ROUTER_MODE || "").toLowerCase() === "hash" ||
  (typeof window !== "undefined" && window.location.hash?.startsWith("#/"));

const absUrl = (path) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return p;
  return isHash ? `${window.location.origin}/#${p}` : `${window.location.origin}${p}`;
};

const TABS = [
  { key: "gateways", label: "Gateways" },
  { key: "checkout", label: "Checkout" },
  { key: "capture", label: "Capture" },
  { key: "refund", label: "Refund" },
  { key: "webhooks", label: "Webhooks" },
];

export default function Payment() {
  // Varsayılan sekmeyi gateways yapalım (satıcı önce yapılandırır)
  const [tab, setTab] = useState("gateways");
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  // Akışlar arası paylaşım (intent → capture/refund/webhook)
  const [lastProviderRef, setLastProviderRef] = useState("");
  const [lastAmount, setLastAmount] = useState(null);

  const returnUrl = useMemo(() => absUrl("/order-success"), []);
  const cancelUrl = useMemo(() => absUrl("/checkout"), []);

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="mb-5 flex gap-2 flex-wrap">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 h-[38px] rounded border ${
              tab === key ? "bg-qyellow text-qblack" : "bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Gateways (Admin setup) */}
      {tab === "gateways" && <GatewaysManager />}

      {/* Checkout – intent başlat */}
      {tab === "checkout" && (
        <IntentPlayground
          provider={provider}
          setProvider={setProvider}
          currency={currency}
          setCurrency={setCurrency}
          returnUrl={returnUrl}
          cancelUrl={cancelUrl}
          onIntent={(info) => {
            // info: { providerRef, amount }
            if (info?.providerRef) setLastProviderRef(info.providerRef);
            if (typeof info?.amount === "number") setLastAmount(info.amount);
          }}
        />
      )}

      {/* Capture */}
      {tab === "capture" && (
        <CaptureForm
          provider={provider}
          setProvider={setProvider}
          providerRef={lastProviderRef}
          defaultAmount={lastAmount}
          currency={currency}
        />
      )}

      {/* Refund */}
      {tab === "refund" && (
        <RefundForm
          provider={provider}
          setProvider={setProvider}
          providerRef={lastProviderRef}
          defaultAmount={lastAmount}
          currency={currency}
        />
      )}

      {/* Webhooks */}
      {tab === "webhooks" && (
        <WebhookTools
          provider={provider}
          setProvider={setProvider}
          providerRef={lastProviderRef}
          amount={lastAmount}
          currency={currency}
        />
      )}
    </div>
  );
}
