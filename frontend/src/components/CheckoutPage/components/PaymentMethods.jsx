import React from "react";
import ServeLangItem from "@/components/Helpers/ServeLangItem";
import CheckoutTickIco from "@/components/Helpers/icons/CheckoutTickIco";
import LoaderStyleOne from "@/components/Helpers/Loaders/LoaderStyleOne";
import InputCom from "@/components/Helpers/InputCom";
import Sslcommerce from "@/components/Helpers/icons/Sslcommerce";
import Bkash from "@/components/Helpers/icons/Bkash";
import StripeLogo from "@/components/Helpers/icons/StripeLogo";
import FlutterWaveLogo from "@/components/Helpers/icons/FlutterWaveLogo";
import FatoorahLogo from "@/components/Helpers/icons/FatoorahLogo";
import InstamojoLogo from "@/components/Helpers/icons/InstamojoLogo";
import PaystackLogo from "@/components/Helpers/icons/PaystackLogo";
import PaypalLogo from "@/components/Helpers/icons/PaypalLogo";
import RezorPayLogo from "@/components/Helpers/icons/RezorPay";
import { formatExpirationDate } from "../utils/checkoutUtils";

const PaymentMethods = ({
  // Payment state
  selectPayment,
  setPaymentMethod,
  paymentStatuses,

  // Stripe data
  stripeData,
  updateStripeData,

  // Bank data
  bankInfo,
  transactionInfo,
  setTransactionInfo,

  // Order handlers
  placeOrderHandler,
}) => {
  /**
   * Handle payment method selection
   * @param {string} method - Payment method name
   */
  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  /**
   * Handle stripe form field changes
   * @param {string} field - Field name
   * @param {Event} event - Input change event
   */
  const handleStripeFieldChange = (field, event) => {
    if (field === "expireDate") {
      updateStripeData(field, formatExpirationDate(event));
    } else {
      updateStripeData(field, event.target.value);
    }
  };

  /**
   * Check if field has stripe error
   * @param {string} fieldName - Field name to check
   * @returns {boolean} Whether field has error
   */
  const hasStripeError = (fieldName) => {
    return !!(stripeData.error && Object.hasOwn(stripeData.error, fieldName));
  };

  /**
   * Get stripe error message for field
   * @param {string} fieldName - Field name to get error for
   * @returns {string} Error message
   */
  const getStripeErrorMessage = (fieldName) => {
    return stripeData.error && Object.hasOwn(stripeData.error, fieldName)
      ? stripeData.error[fieldName][0]
      : "";
  };

  /**
   * Render payment method button
   * @param {string} method - Payment method key
   * @param {string} label - Payment method label
   * @param {boolean} isEnabled - Whether payment method is enabled
   * @param {JSX.Element} icon - Payment method icon
   * @returns {JSX.Element} Payment method button
   */
  const renderPaymentMethod = (method, label, isEnabled, icon = null) => {
    if (!isEnabled) return null;

    const isSelected = selectPayment === method;

    return (
      <div
        key={method}
        onClick={() => handlePaymentMethodSelect(method)}
        className={`payment-item relative bg-[#F8F8F8] text-center w-full h-[50px] text-sm flex justify-center items-center px-3 uppercase cursor-pointer ${
          isSelected ? "border-2 border-qyellow" : "border border-gray-200"
        }`}
      >
        <div className="w-full flex justify-center">
          {icon || (
            <span className="text-qblack font-bold text-base notranslate">
              {label}
            </span>
          )}
        </div>
        {isSelected && (
          <span
            data-aos="zoom-in"
            className="absolute text-white z-10 w-6 h-6 rounded-full bg-qyellow -right-2.5 -top-2.5"
          >
            <CheckoutTickIco />
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="mt-[30px] mb-5 relative">
      <div className="w-full">
        <div className="flex flex-col space-y-3">
          {/* Cash on Delivery */}
          {renderPaymentMethod(
            "cashOnDelivery",
            ServeLangItem()?.Cash_On_Delivery,
            paymentStatuses.cash_on_delivery_status
          )}

          {/* Stripe */}
          {renderPaymentMethod(
            "stripe",
            null,
            paymentStatuses.stripePaymentInfo,
            <StripeLogo />
          )}

          {/* RazorPay */}
          {renderPaymentMethod(
            "razorpay",
            null,
            paymentStatuses.razorpayPaymentInfo,
            <RezorPayLogo />
          )}

          {/* FlutterWave */}
          {renderPaymentMethod(
            "flutterWave",
            null,
            paymentStatuses.flutterwavePaymentInfo,
            <FlutterWaveLogo />
          )}

          {/* Mollie */}
          {renderPaymentMethod(
            "mollie",
            null,
            paymentStatuses.mollie,
            <div className="text-qblack font-bold text-base">Mollie</div>
          )}

          {/* MyFatoorah */}
          {renderPaymentMethod(
            "myfatoorah",
            null,
            paymentStatuses.myfatoorah,
            <FatoorahLogo />
          )}

          {/* Instamojo */}
          {renderPaymentMethod(
            "instamojo",
            null,
            paymentStatuses.instamojo,
            <InstamojoLogo />
          )}

          {/* Paystack */}
          {renderPaymentMethod(
            "paystack",
            null,
            paymentStatuses.paystackAndMollie,
            <PaystackLogo />
          )}

          {/* PayPal */}
          {renderPaymentMethod(
            "paypal",
            null,
            paymentStatuses.paypalPaymentInfo,
            <PaypalLogo />
          )}

          {/* Bank Payment */}
          {renderPaymentMethod(
            "bankpayment",
            ServeLangItem()?.Bank_Payment,
            paymentStatuses.bankPaymentInfo
          )}

          {/* SSL Commerce */}
          {renderPaymentMethod(
            "sslcommerce",
            null,
            paymentStatuses.sslcommerz,
            <Sslcommerce />
          )}

          {/* bKash */}
          {renderPaymentMethod("bkash", null, paymentStatuses.bkash, <Bkash />)}
        </div>
      </div>

      {/* Stripe Payment Form */}
      {selectPayment === "stripe" && (
        <>
          <div
            onClick={() => setPaymentMethod("")}
            className="w-full h-full fixed left-0 top-0 z-10"
          ></div>
          <div
            style={{ zIndex: "999" }}
            data-aos="zoom-in"
            className="w-[359px] bg-white shadow-2xl p-2 rounded absolute -left-10 top-0"
          >
            <div className="stripe-inputs">
              {/* Card Number */}
              <div className="input-item mb-5">
                <InputCom
                  placeholder="Number"
                  name="number"
                  type="text"
                  inputClasses="h-[50px]"
                  value={stripeData.cardNumber}
                  inputHandler={(e) => handleStripeFieldChange("cardNumber", e)}
                  error={hasStripeError("card_number")}
                />
                {hasStripeError("card_number") && (
                  <span className="text-sm mt-1 text-qred">
                    {getStripeErrorMessage("card_number")}
                  </span>
                )}
              </div>

              {/* Expiry Date and CVV */}
              <div className="flex space-x-2 items-center">
                <div className="input-item mb-5">
                  <InputCom
                    placeholder="Expire Date"
                    name="date"
                    type="date"
                    inputClasses="h-[50px]"
                    value={stripeData.expireDate?.value || ""}
                    inputHandler={(e) =>
                      handleStripeFieldChange("expireDate", e)
                    }
                    error={hasStripeError("month") || hasStripeError("year")}
                  />
                  {(hasStripeError("month") || hasStripeError("year")) && (
                    <span className="text-sm mt-1 text-qred">
                      {ServeLangItem()?.Date_in_required}
                    </span>
                  )}
                </div>
                <div className="input-item mb-5">
                  <InputCom
                    placeholder="CVV"
                    name="cvv"
                    type="text"
                    inputClasses="h-[50px]"
                    value={stripeData.cvv}
                    inputHandler={(e) => handleStripeFieldChange("cvv", e)}
                    error={hasStripeError("cvv")}
                  />
                  {hasStripeError("cvv") && (
                    <span className="text-sm mt-1 text-qred">
                      {getStripeErrorMessage("cvv")}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Holder Name */}
              <div className="input-item mb-5">
                <InputCom
                  placeholder="Card Holder"
                  name="card"
                  type="text"
                  inputClasses="h-[50px]"
                  value={stripeData.cardHolderName}
                  inputHandler={(e) =>
                    handleStripeFieldChange("cardHolderName", e)
                  }
                />
              </div>

              {/* Place Order Button */}
              <button
                type="button"
                onClick={placeOrderHandler}
                className="w-full"
              >
                <div className="w-full h-[50px] black-btn flex justify-center items-center">
                  <span className="text-sm font-semibold">
                    {ServeLangItem()?.Place_Order_Now}
                  </span>
                  {stripeData.loading && (
                    <span className="w-5" style={{ transform: "scale(0.3)" }}>
                      <LoaderStyleOne />
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bank Payment Form */}
      {selectPayment === "bankpayment" && (
        <div className="w-full bank-inputs mt-5">
          <div className="input-item mb-5">
            <div className="bank-info-alert w-full p-5 bg-amber-100 rounded mb-4 overflow-x-scroll">
              <pre className="w-full table table-fixed">
                {bankInfo?.account_info}
              </pre>
            </div>
            <h6 className="input-label capitalize text-[13px] font-600 leading-[24px] text-qblack block mb-2">
              {ServeLangItem()?.Transaction_Information}*
            </h6>
            <textarea
              cols="5"
              rows="7"
              value={transactionInfo}
              onChange={(e) => setTransactionInfo(e.target.value)}
              className="w-full focus:ring-0 focus:outline-none py-3 px-4 border placeholder:text-sm text-sm"
              placeholder={"Example:\r\n" + bankInfo?.account_info}
            ></textarea>
          </div>
        </div>
      )}

      {/* Place Order Button */}
      <button type="button" onClick={placeOrderHandler} className="w-full">
        <div className="w-full h-[50px] black-btn flex justify-center items-center">
          <span className="text-sm font-semibold">
            {ServeLangItem()?.Place_Order_Now}
          </span>
        </div>
      </button>
    </div>
  );
};

export default PaymentMethods;
