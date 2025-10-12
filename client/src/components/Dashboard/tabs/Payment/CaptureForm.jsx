// src/components/Dashboard/tabs/Payment/CaptureForm.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import InputCom from "@/components/Helpers/InputCom";
import { useCaptureCheckoutIntentMutation } from "@/api-manage/api-call-functions/public/publicPayments.api";

const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
};

export default function CaptureForm({
  provider,
  setProvider,
  providerRef,
  defaultAmount,
  currency,
}) {
  const [ref, setRef] = useState(providerRef || "");
  const [amount, setAmount] = useState(
    defaultAmount !== undefined && defaultAmount !== null ? defaultAmount : ""
  );
  const [capture, { isLoading }] = useCaptureCheckoutIntentMutation();

  const onSubmit = async (e) => {
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
      const res = await capture({
        provider,
        providerRef: ref.trim(),
        amount: toInt(amount) || undefined, // boşsa full capture
      }).unwrap();
      alert(`Capture submitted.\nStatus: ${res?.status || "ok"}`);
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Capture failed.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <InputCom
          label="Provider*"
          name="provider_cap"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="stripe / iyzico / paytr ..."
        />
        <InputCom
          label="Currency"
          name="currency_cap"
          value={currency}
          readOnly
        />
      </div>

      <InputCom
        label="Provider Ref*"
        name="provider_ref_cap"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder="pi_ / cs_ / ..."
      />

      <InputCom
        label="Amount (minor)"
        name="amount_cap"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="empty => full capture"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="black-btn h-[44px] px-5 disabled:opacity-60"
      >
        {isLoading ? "Capturing..." : "Capture"}
      </button>
    </form>
  );
}

CaptureForm.propTypes = {
  provider: PropTypes.string.isRequired,
  setProvider: PropTypes.func.isRequired,
  providerRef: PropTypes.string,
  defaultAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  currency: PropTypes.string,
};

CaptureForm.defaultProps = {
  providerRef: "",
  defaultAmount: "",
  currency: "EUR",
};
