import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useState } from "react";
import BreadcrumbCom from "../BreadcrumbCom";
import EmptyCardError from "../EmptyCardError";
import InputCom from "@/components/Helpers/InputCom";
import PageTitle from "@/components/Helpers/PageTitle";
import Layout from "@/components/Partials/Layout";
import ProductsTable from "./ProductsTable";
import {
  useGetMyCartQuery,
  useUpdatePricingMutation,
} from "@/api-manage/api-call-functions/public/publicCart.api";

function getSessionId() {
  try { return localStorage.getItem("cart_session") || undefined; } catch { return undefined; }
}
const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CardPage({ cart = true }) {
  const [coupon, setCoupon] = useState("");
  const session = getSessionId();

  const { data, refetch } = useGetMyCartQuery(session ? { session } : {});
  const [applyPricing, { isLoading: applying }] = useUpdatePricingMutation();

  const items = Array.isArray(data?.items) ? data.items : [];
  const currency =
    (data?.currency || data?.totals?.currency || "EUR").toUpperCase();

  const subtotal =
    data?._numbers?.subtotal ??
    data?.subtotal ??
    items.reduce((s, it) => {
      const qty = it?.quantity ?? it?.qty ?? 1;
      const unit =
        it?.unitPrice ??
        it?.price ??
        it?.product?.price?.current ??
        it?.product?.price ??
        0;
      return s + Number(unit || 0) * Number(qty || 0);
    }, 0);

  const onApplyCoupon = async () => {
    const code = String(coupon || "").trim();
    if (!code) return;
    try {
      await applyPricing({ couponCode: code }).unwrap();
      await refetch();
    } catch (e) {
      alert(e?.data?.message || "Coupon could not be applied.");
    }
  };

  return (
    <Layout childrenClasses={cart ? "pt-0 pb-0" : ""}>
      {cart === false ? (
        <div className="cart-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom paths={[{ name: "home", path: "/" }, { name: "cart", path: "/cart" }]} />
            <EmptyCardError />
          </div>
        </div>
      ) : (
        <div className="cart-page-wrapper w-full bg-white pb-[60px]">
          <div className="w-full">
            <PageTitle
              title="Your Cart"
              breadcrumb={[{ name: "home", path: "/" }, { name: "cart", path: "/cart" }]}
            />
          </div>

          <div className="w-full mt-[23px]">
            <div className="container-x mx-auto">
              <ProductsTable className="mb-[30px]" />

              <div className="w-full sm:flex justify-between">
                <div className="discount-code sm:w-[270px] w-full mb-5 sm:mb-0 h-[50px] flex">
                  <div className="flex-1 h-full">
                    <InputCom
                      label="Coupon Code"
                      name="coupon_code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="SAVE10"
                      wrapperClasses="h-[50px]"
                    />
                  </div>
                  <button
                    type="button"
                    className="w-[90px] h-[50px] black-btn disabled:opacity-60"
                    onClick={onApplyCoupon}
                    disabled={!coupon.trim() || applying}
                  >
                    <span className="text-sm font-semibold">
                      {applying ? "Applying..." : "Apply"}
                    </span>
                  </button>
                </div>

                <div className="flex space-x-2.5 items-center">
                  <Link to="/">
                    <div className="w-[220px] h-[50px] bg-[#F6F6F6] flex justify-center items-center">
                      <span className="text-sm font-semibold">Continue Shopping</span>
                    </div>
                  </Link>
                  <button type="button">
                    <div className="w-[140px] h-[50px] bg-[#F6F6F6] flex justify-center items-center">
                      <span className="text-sm font-semibold">Update Cart</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="w-full mt-[30px] flex sm:justify-end">
                <div className="sm:w-[370px] w-full border border-[#EDEDED] px-[30px] py-[26px]">
                  <div className="sub-total mb-6">
                    <div className="flex justify-between mb-6">
                      <p className="text-[15px] font-medium text-qblack">Subtotal</p>
                      <p className="text-[15px] font-medium text-qred">
                        {currency} {fmt(subtotal)}
                      </p>
                    </div>
                    <div className="w-full h-[1px] bg-[#EDEDED]" />
                  </div>

                  {/* placeholder shipping */}
                  <div className="shipping mb-6">
                    <span className="text-[15px] font-medium text-qblack mb-[18px] block">Shipping</span>
                    <ul className="flex flex-col space-y-1">
                      {["Free Shipping", "Flat Rate", "Local Delivery"].map((label) => (
                        <li key={label}>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2.5 items-center">
                              <div className="input-radio">
                                <input type="radio" name="shipping_price" className="accent-pink-500" />
                              </div>
                              <span className="text-[13px] text-normal text-qgraytwo">{label}</span>
                            </div>
                            <span className="text-[13px] text-normal text-qgraytwo">+{currency} 00.00</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button type="button" className="w-full mb-10">
                    <div className="w-full h-[50px] bg-[#F6F6F6] flex justify-center items-center">
                      <span className="text-sm font-semibold">Update Cart</span>
                    </div>
                  </button>

                  <div className="total mb-6">
                    <div className="flex justify-between">
                      <p className="text-[18px] font-medium text-qblack">Total</p>
                      <p className="text-[18px] font-medium text-qred">
                        {currency} {fmt(subtotal)}
                      </p>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <div className="w-full h-[50px] black-btn flex justify-center items-center">
                      <span className="text-sm font-semibold">Proceed to Checkout</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

CardPage.propTypes = {
  cart: PropTypes.bool,
};
