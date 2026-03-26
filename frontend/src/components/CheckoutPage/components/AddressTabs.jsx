import React, { useState } from "react";
import ServeLangItem from "@/components/Helpers/ServeLangItem";
import AddressList from "./AddressList";
import CheckoutAddressForm from "./CheckoutAddressForm";

/**
 * Address Tabs Component
 * Handles switching between billing and shipping address selection
 * Uses the same pattern as AddressTab component for address creation
 */
const AddressTabs = ({
  // Address data
  addresses,
  activeAddress,
  selectedBilling,
  selectedShipping,
  webSettings,

  // Address handlers
  setActiveAddress,
  setBilling,
  shippingHandler,
  deleteAddress,

  // Callback for address refresh
  onAddressRefresh,
}) => {
  // State for showing new address form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  /**
   * Handle tab switching
   * @param {string} tab - Tab to switch to (billing or shipping)
   */
  const handleTabSwitch = (tab) => {
    setActiveAddress(tab);
  };

  /**
   * Handle new address toggle
   */
  const handleNewAddressToggle = () => {
    setShowNewAddressForm(!showNewAddressForm);
  };

  /**
   * Handle address saved callback
   */
  const handleAddressSaved = () => {
    setShowNewAddressForm(false);
    if (onAddressRefresh) {
      onAddressRefresh();
    }
  };

  /**
   * Handle cancel new address
   */
  const handleCancelNewAddress = () => {
    setShowNewAddressForm(false);
  };

  return (
    <>
      {/* Address Tabs Header */}
      {!showNewAddressForm && (
        <div className="addresses-widget w-full">
          <div className="sm:flex justify-between items-center w-full mb-5">
            <div className="bg-qyellowlow/10 border border-qyellow rounded p-2">
              <button
                onClick={() => handleTabSwitch("billing")}
                type="button"
                className={`px-4 py-3 text-md font-medium rounded-md ${
                  activeAddress === "billing"
                    ? "text-qblack bg-qyellow"
                    : "text-qyellow"
                }`}
              >
                {ServeLangItem()?.Billing_Address}
              </button>
              <button
                onClick={() => handleTabSwitch("shipping")}
                type="button"
                className={`px-4 py-3 text-md font-medium rounded-md ml-1 ${
                  activeAddress === "shipping"
                    ? "text-qblack bg-qyellow"
                    : "text-qyellow"
                }`}
              >
                {ServeLangItem()?.Shipping_Address}
              </button>
            </div>

            <button
              onClick={handleNewAddressToggle}
              type="button"
              className="w-[100px] h-[40px] mt-2 sm:mt-0 border border-qblack hover:bg-qblack hover:text-white transition-all duration-300 ease-in-out"
            >
              <span className="text-sm font-semibold">
                {ServeLangItem()?.Add_New}
              </span>
            </button>
          </div>

          {/* Address List */}
          <AddressList
            addresses={addresses}
            activeAddress={activeAddress}
            selectedBilling={selectedBilling}
            selectedShipping={selectedShipping}
            webSettings={webSettings}
            setBilling={setBilling}
            shippingHandler={shippingHandler}
            deleteAddress={deleteAddress}
          />
        </div>
      )}

      {/* New Address Form - Using CheckoutAddressForm component */}
      {showNewAddressForm && (
        <CheckoutAddressForm
          onAddressSaved={handleAddressSaved}
          onCancel={handleCancelNewAddress}
        />
      )}
    </>
  );
};

export default AddressTabs;
