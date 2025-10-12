import { useState } from "react";
import PropTypes from "prop-types";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export default function StripeCardForm({ returnUrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (error) {
      setMsg(error.message || "Ödeme başarısız.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      window.location.assign(returnUrl);
      return;
    }

    setMsg("Ödeme doğrulaması bekleniyor veya ek adım gerekiyor.");
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
      >
        {submitting ? "İşleniyor…" : "Ödemeyi Tamamla"}
      </button>
    </form>
  );
}

StripeCardForm.propTypes = {
  returnUrl: PropTypes.string.isRequired,
};
