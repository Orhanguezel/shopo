import PropTypes from "prop-types";

/* ==== helpers (Sepet ile aynı mantık) ==== */
const pickTitle = (it) => {
  const t =
    it?.title ||
    it?.product?.title ||
    it?.name ||
    it?.product?.name;

  if (!t) return "—";
  if (typeof t === "string") return t;

  try {
    const lang = (typeof navigator !== "undefined" ? navigator.language : "en")
      .slice(0, 2);
    return t[lang] || t.en || t.tr || Object.values(t).find(Boolean) || "—";
  } catch {
    return "—";
  }
};

const pickThumb = (it) => {
  if (it?.image) {
    if (typeof it.image === "string") return it.image;
    if (typeof it.image === "object") {
      return it.image.thumbnail || it.image.url || it.image.webp || null;
    }
  }

  if (typeof it?.product?.thumbnail === "string" && it.product.thumbnail)
    return it.product.thumbnail;

  const imgs = Array.isArray(it?.product?.images) ? it.product.images : [];
  if (imgs.length > 0) {
    const first = imgs[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      return first.thumbnail || first.url || first.webp || null;
    }
  }

  const gal = Array.isArray(it?.product?.gallery) ? it.product.gallery : [];
  if (gal.length > 0) {
    const g0 = gal[0];
    if (typeof g0 === "string") return g0;
    if (g0 && typeof g0 === "object") return g0.thumbnail || g0.url || g0.webp || null;
  }

  return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
};

const getKey = (it, i) =>
  it?.lineId || it?._id?.$oid || it?._id || it?.productId || it?.id || String(i);

export default function OrderSummary({
  cart,
  onInc,
  onDec,
  onRemove,
  placing,
  onPlace,
  paymentMethod,
  setPaymentMethod,
}) {
  const items = cart?.items || [];
  const totals = cart?.totals || {
    subtotal: "—",
    discount: "—",
    shipping: "—",
    tax: "—",
    total: "—",
  };

  return (
    <div className="w-full px-10 py-[30px] border border-[#EDEDED]">
      <div className="sub-total mb-6">
        <div className="flex justify-between mb-5">
          <p className="text-[13px] font-medium text-qblack uppercase">Product</p>
          <p className="text-[13px] font-medium text-qblack uppercase">Total</p>
        </div>
        <div className="w-full h-[1px] bg-[#EDEDED]" />
      </div>

      <div className="product-list w-full mb-[30px]">
        <ul className="flex flex-col space-y-5">
          {items.map((it, idx) => {
            const title = pickTitle(it);
            const img = pickThumb(it);
            return (
              <li key={getKey(it, idx)} className="flex justify-between items-start">
                {/* left: image + title + controls */}
                <div className="flex items-start gap-3">
                  <div className="w-[56px] h-[56px] flex-shrink-0 border border-[#EDEDED] bg-white overflow-hidden grid place-items-center">
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
                      }}
                    />
                  </div>

                  <div>
                    <h4 className="text-[15px] text-qblack mb-1">
                      {title}
                      <sup className="text-[13px] text-qgray ml-2">x{it.quantity}</sup>
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-[13px] text-qgray">
                      <span>Unit: {it.unitPriceStr}</span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-2 border rounded"
                          onClick={() => onDec(it)}
                          aria-label="decrease"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="px-2 border rounded"
                          onClick={() => onInc(it)}
                          aria-label="increase"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="px-2 border rounded text-qred"
                          onClick={() => onRemove(it)}
                          aria-label="remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* right: line total */}
                <div>
                  <span className="text-[15px] text-qblack font-medium">
                    {it.lineTotalStr}
                  </span>
                </div>
              </li>
            );
          })}

          {!items.length && (
            <li className="text-sm text-qgraytwo">Your cart is empty.</li>
          )}
        </ul>
      </div>

      <div className="w-full h-[1px] bg-[#EDEDED]" />

      <div className="mt-[30px] space-y-2">
        <div className="flex justify-between">
          <p className="text-[13px] font-medium text-qblack uppercase">Subtotal</p>
          <p className="text-[15px] font-medium text-qblack">{totals.subtotal}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-[13px] font-medium text-qblack uppercase">Shipping</p>
          <p className="text-[15px] font-medium text-qblack">{totals.shipping}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-[13px] font-medium text-qblack uppercase">Tax</p>
          <p className="text-[15px] font-medium text-qblack">{totals.tax}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-[13px] font-medium text-qblack uppercase">Discount</p>
          <p className="text-[15px] font-medium text-qblack">{totals.discount}</p>
        </div>
      </div>

      <div className="mt-[30px]">
        <div className="flex justify-between mb-5">
          <p className="text-2xl font-medium text-qblack">Total</p>
          <p className="text-2xl font-medium text-qred">{totals.total}</p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="shipping mt-[30px]">
        <ul className="flex flex-col space-y-1">
          <li className="mb-5">
            <div className="flex space-x-2.5 items-center mb-4">
              <input
                type="radio"
                id="pm_transfer"
                name="pm"
                className="accent-pink-500"
                checked={paymentMethod === "bank_transfer"}
                onChange={() => setPaymentMethod("bank_transfer")}
              />
              <label htmlFor="pm_transfer" className="text-[18px] text-qblack">
                Direct Bank Transfer
              </label>
            </div>
            <p className="text-qgraytwo text-[15px] ml-6">
              Make your payment directly into our bank account. Please use your
              Order ID as the payment reference.
            </p>
          </li>

          <li>
            <div className="flex space-x-2.5 items-center mb-5">
              <input
                type="radio"
                id="pm_cod"
                name="pm"
                className="accent-pink-500"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <label htmlFor="pm_cod" className="text-[18px] text-qblack">
                Cash on Delivery
              </label>
            </div>
          </li>

          <li>
            <div className="flex space-x-2.5 items-center mb-5">
              <input
                type="radio"
                id="pm_card"
                name="pm"
                className="accent-pink-500"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              <label htmlFor="pm_card" className="text-[18px] text-qblack">
                Credit/Debit Cards or Paypal
              </label>
            </div>
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onPlace}
        disabled={!items.length || placing}
        className="w-full h-[50px] black-btn flex justify-center items-center disabled:opacity-60"
      >
        <span className="text-sm font-semibold">
          {placing ? "Placing..." : "Place Order Now"}
        </span>
      </button>
    </div>
  );
}

OrderSummary.propTypes = {
  cart: PropTypes.object,
  onInc: PropTypes.func.isRequired,
  onDec: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  placing: PropTypes.bool,
  onPlace: PropTypes.func.isRequired,
  paymentMethod: PropTypes.string.isRequired,
  setPaymentMethod: PropTypes.func.isRequired,
};
