// src/components/Dashboard/tabs/Payment/RefundForm.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import InputCom from "@/components/Helpers/InputCom";
import { useRefundCheckoutIntentProviderMutation } from "@/api-manage/api-call-functions/public/publicPayments.api";

const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
};

export default function RefundForm({
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
  const [reason, setReason] = useState("");
  const [refund, { isLoading }] = useRefundCheckoutIntentProviderMutation();

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
      const res = await refund({
        provider,
        providerRef: ref.trim(),
        amount: toInt(amount) || undefined, // boşsa full refund
        reason: reason || undefined,
      }).unwrap();
      alert(`Refund sent.\nStatus: ${res?.status || "ok"}`);
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Refund failed.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div className="grid sm:grid-cols-3 gap-4">
        <InputCom
          label="Provider*"
          name="provider_refund"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
        <InputCom
          label="Currency"
          name="currency_refund"
          value={currency}
          readOnly
        />
        <InputCom
          label="Amount (minor)"
          name="amount_refund"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <InputCom
        label="Provider Ref*"
        name="provider_ref_refund"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder="pi_ / cs_ / ..."
      />

      <InputCom
        label="Reason"
        name="reason_refund"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="optional"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="black-btn h-[44px] px-5 disabled:opacity-60"
      >
        {isLoading ? "Refunding..." : "Refund"}
      </button>
    </form>
  );
}

RefundForm.propTypes = {
  provider: PropTypes.string.isRequired,
  setProvider: PropTypes.func.isRequired,
  providerRef: PropTypes.string,
  defaultAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  currency: PropTypes.string,
};

RefundForm.defaultProps = {
  providerRef: "",
  defaultAmount: "",
  currency: "EUR",
};
