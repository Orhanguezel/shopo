import PropTypes from "prop-types";

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Ödeme yöntemi</label>
      <div className="flex gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="method"
            value="credit_card"
            checked={value === "credit_card"}
            onChange={() => onChange("credit_card")}
          />
          <span>Credit / Debit Card</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="method"
            value="paypal"
            checked={value === "paypal"}
            onChange={() => onChange("paypal")}
          />
          <span>PayPal</span>
        </label>
      </div>
    </div>
  );
}

PaymentMethodSelector.propTypes = {
  value: PropTypes.oneOf(["credit_card", "paypal"]).isRequired,
  onChange: PropTypes.func.isRequired,
};
