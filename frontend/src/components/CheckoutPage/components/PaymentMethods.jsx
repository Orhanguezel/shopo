import React from "react";
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
          {/* Kapıda Ödeme — kaldırıldı (#12) */}

          {/* Bank Payment */}
          {renderPaymentMethod(
            "bankpayment",
            "Banka Havalesi",
            paymentStatuses.bankPaymentInfo
          )}

          {/* Kredi Kartı (Iyzico) */}
          {renderPaymentMethod(
            "iyzico",
            "Kredi Kartı ile Öde",
            paymentStatuses.iyzico
          )}
        </div>
      </div>

      {/* Bank Payment Form — örnek bilgi eklendi (#13) */}
      {selectPayment === "bankpayment" && (
        <div className="w-full bank-inputs mt-5">
          <div className="input-item mb-5">
            <div className="bank-info-alert w-full p-5 bg-amber-100 rounded mb-4">
              <p className="text-sm font-semibold text-amber-900 mb-2">Banka Hesap Bilgileri:</p>
              <p className="text-sm text-amber-800 whitespace-pre-wrap break-words">
                {bankInfo?.account_info || "Hesap Sahibi: Seyfibaba Tic. Ltd. Şti.\nBanka: Ziraat Bankası\nIBAN: TR00 0000 0000 0000 0000 0000 00\n\nHavale/EFT yaparken sipariş numaranızı açıklama kısmına yazınız."}
              </p>
            </div>
            <h6 className="input-label capitalize text-[13px] font-600 leading-[24px] text-qblack block mb-2">
              İşlem Bilgisi*
            </h6>
            <textarea
              cols="5"
              rows="5"
              value={transactionInfo}
              onChange={(e) => setTransactionInfo(e.target.value)}
              className="w-full focus:ring-0 focus:outline-none py-3 px-4 border placeholder:text-sm text-sm"
              placeholder={"Havale/EFT yaptıktan sonra dekont numarasını veya gönderici bilgisini buraya yazın."}
            ></textarea>
          </div>
        </div>
      )}

      {/* Place Order Button */}
      <button type="button" onClick={placeOrderHandler} className="w-full">
        <div className="w-full h-[50px] black-btn flex justify-center items-center">
          <span className="text-sm font-semibold">Siparişi Ver</span>
        </div>
      </button>
    </div>
  );
};

export default PaymentMethods;
