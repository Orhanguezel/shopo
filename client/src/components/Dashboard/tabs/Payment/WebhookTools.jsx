// src/components/Dashboard/tabs/Payment/WebhookTools.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import InputCom from "@/components/Helpers/InputCom";
import {
  useSimulateIntentWebhookMutation,
  useSimulateDevWebhookMutation,
} from "@/api-manage/api-call-functions/public/publicPayments.api";

export default function WebhookTools({
  provider,
  setProvider,
  providerRef,
  amount,
  currency,
}) {
  const [ref, setRef] = useState(providerRef || "");
  const [amt, setAmt] = useState(
    amount !== undefined && amount !== null ? amount : ""
  );
  const [sig, setSig] = useState("");

  const [simulateReal, { isLoading: loadingReal }] =
    useSimulateIntentWebhookMutation();
  const [simulateDev, { isLoading: loadingDev }] =
    useSimulateDevWebhookMutation();

  const sendRealStripeLike = async (e) => {
    e.preventDefault();

    if (!provider?.trim()) {
      alert("Provider is required (e.g., stripe).");
      return;
    }
    if (!ref?.trim()) {
      alert("Provider reference is required (e.g., pi_ / cs_ / ...).");
      return;
    }

    try {
      const event = {
        id: "evt_local_123",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: ref.trim(),
            amount: Number(amt) || undefined,
            currency: String(currency || "EUR").toLowerCase(),
            status: "succeeded",
          },
        },
        // Not: Eğer backend ‘Stripe-Signature’ header’ını istiyorsa,
        // RTK endpoint’ini headers alacak şekilde genişletmeniz gerekir.
        // Şimdilik payload üzerinden dev kabulüne göre ilerliyoruz.
        _signature: sig || undefined,
      };

      const res = await simulateReal({ provider, event }).unwrap();
      alert(`Webhook posted (${provider}). Success: ${!!res}`);
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Webhook failed.");
    }
  };

  const sendDevNormalized = async (e) => {
    e.preventDefault();

    if (!provider?.trim()) {
      alert("Provider is required (e.g., stripe).");
      return;
    }
    if (!ref?.trim()) {
      alert("Provider reference is required (e.g., pi_ / cs_ / ...).");
      return;
    }

    try {
      const event = {
        _dev_normalized: true,
        providerRef: ref.trim(),
        amount: Number(amt) || undefined,
        currency: String(currency || "EUR").toUpperCase(),
        event: "payment.succeeded",
      };
      const res = await simulateDev({ provider, event }).unwrap();
      alert(`Dev webhook posted. Success: ${!!res}`);
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Dev webhook failed.");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid sm:grid-cols-3 gap-4">
        <InputCom
          label="Provider*"
          name="provider_web"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
        <InputCom
          label="Provider Ref*"
          name="provider_ref_web"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
        />
        <InputCom
          label="Amount (minor)"
          name="amount_web"
          type="number"
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
        />
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Real provider payload (e.g. Stripe)</h3>
        <InputCom
          label="Signature (optional)"
          name="sig_web"
          value={sig}
          onChange={(e) => setSig(e.target.value)}
          placeholder="Stripe-Signature if any"
        />
        <button
          type="button"
          onClick={sendRealStripeLike}
          disabled={loadingReal}
          className="black-btn h-[42px] px-5 disabled:opacity-60"
        >
          {loadingReal ? "Sending..." : "Send Real-like Webhook"}
        </button>
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Dev normalized payload</h3>
        <button
          type="button"
          onClick={sendDevNormalized}
          disabled={loadingDev}
          className="border px-4 h-[42px] rounded disabled:opacity-60"
        >
          {loadingDev ? "Sending..." : "Send Dev Webhook"}
        </button>
      </div>
    </div>
  );
}

WebhookTools.propTypes = {
  provider: PropTypes.string.isRequired,
  setProvider: PropTypes.func.isRequired,
  providerRef: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
};

WebhookTools.defaultProps = {
  providerRef: "",
  amount: "",
  currency: "EUR",
};
