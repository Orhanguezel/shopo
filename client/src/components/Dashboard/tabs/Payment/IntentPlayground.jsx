// src/components/Dashboard/tabs/Payment/IntentPlayground.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import InputCom from "@/components/Helpers/InputCom";
import {
  useInitCheckoutIntentMutation,
  useInitIntentByAmountMutation,
} from "@/api-manage/api-call-functions/public/publicPayments.api";

const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
};

export default function IntentPlayground({
  provider,
  setProvider,
  currency,
  setCurrency,
  returnUrl,
  cancelUrl,
  onIntent, // (info) => void
}) {
  const [amount, setAmount] = useState(""); // minor units (örn 1990)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [initIntent, { isLoading }] = useInitCheckoutIntentMutation();
  const [initLegacy] = useInitIntentByAmountMutation();

  const onSubmit = async (e) => {
    e.preventDefault();

    const pvd = String(provider || "").trim();
    const cur = String(currency || "").trim().toUpperCase();
    const amt = toInt(amount);

    if (!pvd) return alert("Provider is required (e.g., stripe).");
    if (!cur) return alert("Currency is required (e.g., EUR).");
    if (!(amt > 0)) return alert("Amount must be a positive integer in minor units.");

    const payload = {
      provider: pvd,
      amount: amt,
      currency: cur,
      method: "card",
      returnUrl,
      cancelUrl,
      customer: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
      },
      items: [{ name: "Sample", qty: 1, unitAmount: amt }],
      metadata: { source: "dashboard" },
    };

    try {
      const res = await initIntent({ data: payload }).unwrap();
      const hosted = res?.hostedUrl || res?.payment?.hostedUrl || res?.url;
      const providerRef = res?.providerRef || res?.payment?.providerRef || "";
      onIntent?.({ providerRef, amount: amt });
      alert(`Checkout intent initialized.\nProviderRef: ${providerRef || "—"}`);
      if (hosted) window.open(hosted, "_blank");
    } catch (e1) {
      // Legacy fallback (eski backend’ler)
      if (e1?.status === 404 || e1?.status === 501) {
        try {
          const res2 = await initLegacy({ data: payload }).unwrap();
          const hosted2 = res2?.hostedUrl || res2?.payment?.hostedUrl || res2?.url;
          const providerRef2 = res2?.providerRef || res2?.payment?.providerRef || "";
          onIntent?.({ providerRef: providerRef2, amount: amt });
          alert(`(Legacy) intent initialized.\nProviderRef: ${providerRef2 || "—"}`);
          if (hosted2) window.open(hosted2, "_blank");
        } catch (e2) {
          console.error(e2);
          alert(e2?.data?.message || "Intent failed.");
        }
      } else {
        console.error(e1);
        const m =
          e1?.data?.errors?.[0]?.msg ||
          e1?.data?.message ||
          e1?.message ||
          "Intent failed.";
        alert(m);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <InputCom
          label="Provider*"
          name="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="stripe / iyzico / paytr ..."
        />
        <InputCom
          label="Currency*"
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          placeholder="EUR"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InputCom
          label="Amount (minor)*"
          name="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1990 => 19.90"
        />
        <InputCom
          label="Method"
          name="method"
          value="card"
          readOnly
          placeholder="card"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <InputCom
          label="Customer Name"
          name="cust_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <InputCom
          label="Customer Email"
          name="cust_email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputCom
          label="Customer Phone"
          name="cust_phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InputCom label="Return URL" name="returnUrl" value={returnUrl} readOnly />
        <InputCom label="Cancel URL" name="cancelUrl" value={cancelUrl} readOnly />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="black-btn h-[44px] px-5 disabled:opacity-60"
      >
        {isLoading ? "Initializing..." : "Initialize Checkout Intent"}
      </button>
    </form>
  );
}

IntentPlayground.propTypes = {
  provider: PropTypes.string.isRequired,
  setProvider: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  setCurrency: PropTypes.func.isRequired,
  returnUrl: PropTypes.string.isRequired,
  cancelUrl: PropTypes.string.isRequired,
  onIntent: PropTypes.func,
};

IntentPlayground.defaultProps = {
  onIntent: undefined,
};
