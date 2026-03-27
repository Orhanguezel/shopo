import React from "react";
import ServeLangItem from "@/components/Helpers/ServeLangItem";
import CheckoutTickIco from "@/components/Helpers/icons/CheckoutTickIco";

const PaymentMethods = ({
  // Payment state
  selectPayment,
  setPaymentMethod,
  paymentStatuses,

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

          {/* Bank Payment */}
          {renderPaymentMethod(
            "bankpayment",
            ServeLangItem()?.Bank_Payment,
            paymentStatuses.bankPaymentInfo
          )}

          {/* Iyzico */}
          {renderPaymentMethod(
            "iyzico",
            "Iyzico (Kredi Kartı)",
            paymentStatuses.iyzico
          )}
        </div>
      </div>

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
