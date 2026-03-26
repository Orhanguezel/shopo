"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import auth from "@/utils/auth";
import PageTitle from "@/components/Helpers/PageTitle";
import ServeLangItem from "@/components/Helpers/ServeLangItem";
import { useCheckoutState } from "./hooks/useCheckoutState";
import {
  calculateTotalPrice,
  calculateDiscountAmount,
  calculateTotalWeight,
  calculateTotalQuantity,
  calculateProductPrice,
  checkProductExistsInFlashSale,
  calculateLocationShippingPrice,
  filterShippingRulesByCity,
  getWebSettings,
} from "./utils/checkoutUtils";
import AddressTabs from "./components/AddressTabs";
import CouponSection from "./components/CouponSection";
import OrderSummary from "./components/OrderSummary";
import PaymentMethods from "./components/PaymentMethods";
import {
  useGetAllUserAddressQueryQuery,
  useDeleteAddressApiMutation,
} from "@/redux/features/locations/apiSlice";
import {
  useLazyGetCheckoutDataApiQuery,
  useLazyGetGuestCheckoutDataApiQuery,
} from "@/redux/features/order/checkout/apiSlice";
import { useLazyApplyCouponApiQuery } from "@/redux/features/order/apiSlice";
import LoaderStyleTwo from "../Helpers/Loaders/LoaderStyleTwo";
import { toast } from "react-toastify";
import usePlaceOrder from "./hooks/usePlaceOrder";
import CheckoutAddressForm from "./components/CheckoutAddressForm";
import GuestCheckoutAddressForm from "./components/GuestCheckoutAddressForm";

export default function CheckoutPage() {
  // Redux selectors
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const { cart } = useSelector((state) => state.cart);

  // Router and dispatch
  const router = useRouter();
  const dispatch = useDispatch();

  // Web settings
  const webSettings = getWebSettings();

  // Custom hook for all checkout state management
  const {
    // Cart and product state
    carts,
    setCarts,
    subTotal,
    setSubTotal,
    mainTotalPrice,
    setMainTotalPrice,
    totalWeight,
    setTotalWeight,
    totalQty,
    setQty,

    // Location and address state
    location,
    setLocation,
    addresses,
    setAddresses,
    activeAddress,
    setActiveAddress,
    selectedShipping,
    setShipping,
    selectedBilling,
    setBilling,

    // Guest fields state
    fName,
    setFName,
    lName,
    setLName,
    email,
    setEmail,
    phone,
    setPhone,
    address,
    setAddress,
    home,
    setHome,
    office,
    setOffice,
    country,
    setCountry,
    state,
    setState,
    city,
    setCity,
    guestLocation,
    setGuestLocation,
    errors,
    setErrors,

    // Shipping state
    shippingRules,
    setShipppingRules,
    shippingRulesByCityId,
    setShippingRulesByCityId,
    selectedRule,
    setSelectedRule,
    shippingCharge,
    setShippingCharge,
    locationShippingPrice,
    setLocationShippingPrice,

    // Payment state
    selectPayment,
    setPaymentMethod,

    // Stripe state
    stripeData,
    setStripeData,
    updateStripeData,

    // Coupon state
    couponData,
    setCouponData,
    updateCouponData,

    // Bank state
    bankInfo,
    setBankInfo,
    transactionInfo,
    setTransactionInfo,

    // Payment statuses state
    paymentStatuses,
    setPaymentStatuses,
    updatePaymentStatuses,
  } = useCheckoutState();

  // Calculate total price from subtotal
  const totalPrice = calculateTotalPrice(subTotal);

  // Redux RTK Query hooks for address management
  const { data: addressesData, refetch: refetchAddresses } =
    useGetAllUserAddressQueryQuery(
      { token: auth()?.access_token },
      { skip: !auth() }
    );

  /**
   * Coupon Functionality
   * @Initialization useLazyApplyCouponApiQuery @const applyCouponApi
   * @func submitCoupon @const submitCoupon
   */

  const [applyCouponApi, { isLoading: isApplyCouponLoading }] =
    useLazyApplyCouponApiQuery();

  const submitCoupon = async () => {
    if (!auth()) {
      toast.error("If you want offer the coupon, please login first");
      return false;
    }

    const userToken = auth()?.access_token;
    const res = await applyCouponApi({
      token: userToken,
      coupon: couponData.inputCoupon,
    });

    if (res.status === "fulfilled") {
      updateCouponData("inputCoupon", "");
      if (res.data) {
        if (totalPrice >= parseInt(res.data.coupon.min_purchase_price)) {
          updateCouponData("couponCode", res.data.coupon);
          localStorage.setItem(
            "coupon",
            JSON.stringify(res.data && res.data.coupon)
          );
          let currDate = new Date().toLocaleDateString();
          localStorage.setItem("coupon_set_date", currDate);
          toast.success(ServeLangItem()?.Coupon_Applied);
        } else {
          toast.error("Your total price not able to apply coupon");
        }
      }
    } else if (res.status === "rejected") {
      toast.error(res?.error && res?.error?.data?.message);
    } else {
      toast.error("Something went wrong");
    }
  };

  /**
   * Calculate product price with variants and offers
   * @param {Object} item - Cart item
   * @returns {number} Calculated price
   */
  const price = (item) => {
    return calculateProductPrice(item);
  };

  /**
   * Handle shipping selection and calculation
   * @param {number} addressId - Selected address ID
   * @param {number} cityId - City ID for shipping rules
   */
  const shippingHandler = (addressId, cityId) => {
    if (auth() && addressId) {
      setShipping(addressId);

      if (Number(webSettings?.map_status) === 1) {
        const findAddress = addresses?.find(
          (f) => parseInt(f.id) === addressId
        );
        const calcPrice = calculateLocationShippingPrice(findAddress);
        setLocationShippingPrice(calcPrice);
      } else {
        const filteredRules = filterShippingRulesByCity(shippingRules, cityId);
        setShippingRulesByCityId(filteredRules);
      }
    } else {
      const filteredRules = filterShippingRulesByCity(shippingRules, cityId);
      setShippingRulesByCityId(filteredRules);
    }
  };

  /**
   * Handle shipping rule selection
   * @param {Event} e - Radio button change event
   * @param {number} price - Shipping price
   */
  const selectedRuleHandler = (e, price) => {
    setSelectedRule(e.target.value);
    setShippingCharge(price);
  };

  /**
   * Delete address functionality
   * @Initialization deleteAddressApiMutation Api @const deleteAddressApi
   * @func deleteAddressSuccessHandler @const deleteAddressSuccessHandler @params data
   * @func deleteAddressErrorHandler @const deleteAddressErrorHandler @params error
   * @func deleteAddress @const deleteAddress @params id
   */

  const [deleteAddressApi, { isLoading: isDeleteAddressLoading }] =
    useDeleteAddressApiMutation();

  const deleteAddressSuccessHandler = (data) => {
    toast.success(data?.notification, {
      autoClose: 1000,
    });
  };

  const deleteAddressErrorHandler = (error) => {
    toast.error(error && error.data.notification, {
      autoClose: 1000,
    });
  };

  const deleteAddress = async (id) => {
    const userToken = auth()?.access_token;
    await deleteAddressApi({
      id: id,
      token: userToken,
      success: deleteAddressSuccessHandler,
      error: deleteAddressErrorHandler,
    });
  };

  /**
   * Place order handler
   * Handles all payment methods and order placement
   */
  const { placeOrderHandler } = usePlaceOrder({
    carts,
    addresses,
    webSettings,
    selectedBilling,
    selectedShipping,
    selectedRule,
    couponCode: couponData.couponCode,
    selectPayment,
    transactionInfo,
    guestFields: {
      fName,
      lName,
      email,
      phone,
      address,
      home,
      office,
      country,
      state,
      city,
      location: guestLocation,
      errors,
      setErrors,
    },
    stripeFields: {
      cardNumber: stripeData.cardNumber,
      cardHolderName: stripeData.cardHolderName,
      expireDate: stripeData.expireDate,
      cvv: stripeData.cvv,
    },
    setStripeError: (error) => updateStripeData("error", error),
    resetStripeInputs: () => {
      updateStripeData("cardHolderName", "");
      updateStripeData("expireDate", null);
      updateStripeData("cvv", "");
      updateStripeData("cardNumber", "");
      setPaymentMethod("");
    },
    setNewAddress: () => setActiveAddress("shipping"),
    ServeLangItem,
  });

  /**
   * Handle address refresh after new address is saved
   */
  const handleAddressRefresh = () => {
    refetchAddresses();
  };

  // Update addresses when addressesData changes
  useEffect(() => {
    if (addressesData?.addresses) {
      setAddresses(addressesData.addresses);
      if (addressesData.addresses.length > 0) {
        // Only set default addresses if they haven't been selected yet
        if (!selectedShipping) {
          setShipping(addressesData.addresses[0].id);
        }
        if (!selectedBilling) {
          setBilling(addressesData.addresses[0].id);
        }

        // Calculate location shipping price if map is enabled
        if (Number(webSettings?.map_status) === 1) {
          const firstAddress = addressesData.addresses[0];
          const calcPrice = calculateLocationShippingPrice(firstAddress);
          setLocationShippingPrice(calcPrice);
        }
      }
    }
  }, [addressesData, webSettings, selectedShipping, selectedBilling]);

  // Update cart data when cart changes
  useEffect(() => {
    setCarts(cart && cart.cartProducts);

    // Calculate total weight
    const totalWeight = calculateTotalWeight(cart?.cartProducts);
    setTotalWeight(totalWeight);

    // Calculate total quantity
    const totalQuantity = calculateTotalQuantity(cart?.cartProducts);
    setQty(totalQuantity);
  }, [cart]);

  // Calculate subtotal when cart changes
  useEffect(() => {
    if (carts && carts.length > 0) {
      const calculatedSubTotal = carts.map((v) => {
        let prices = [];
        v.variants.map(
          (item) =>
            item.variant_item &&
            prices.push(parseFloat(item.variant_item.price))
        );
        const sumCal = prices.length > 0 && prices.reduce((p, c) => p + c);

        if (v.product.offer_price) {
          if (v.variants && v.variants.length > 0) {
            const v_price = sumCal + parseFloat(v.product.offer_price);
            const checkFlshPrdct = checkProductExistsInFlashSale(
              v.product_id,
              v_price,
              websiteSetup
            );
            return checkFlshPrdct * v.qty;
          } else {
            const wo_v_price = checkProductExistsInFlashSale(
              v.product_id,
              parseFloat(v.product.offer_price),
              websiteSetup
            );
            return wo_v_price * v.qty;
          }
        } else {
          if (v.variants && v.variants.length > 0) {
            const v_price = sumCal + parseFloat(v.product.price);
            const checkFlshPrdct = checkProductExistsInFlashSale(
              v.product_id,
              v_price,
              websiteSetup
            );
            return checkFlshPrdct * v.qty;
          } else {
            const wo_v_price = checkProductExistsInFlashSale(
              v.product_id,
              parseFloat(v.product.price),
              websiteSetup
            );
            return wo_v_price * v.qty;
          }
        }
      });
      setSubTotal(calculatedSubTotal);
    }
  }, [carts, websiteSetup]);

  // Calculate discount when coupon changes
  useEffect(() => {
    if (couponData.couponCode) {
      const discountAmount = calculateDiscountAmount(
        couponData.couponCode,
        totalPrice
      );
      updateCouponData("discountCoupon", discountAmount);
    }
  }, [couponData.couponCode, totalPrice]);

  // Calculate main total price when shipping changes
  useEffect(() => {
    if (shippingCharge) {
      setMainTotalPrice(totalPrice + parseInt(shippingCharge));
    } else if (locationShippingPrice) {
      setMainTotalPrice(Number(totalPrice) + Number(locationShippingPrice));
    } else {
      setMainTotalPrice(totalPrice);
    }
  }, [shippingCharge, locationShippingPrice, totalPrice]);

  // Initialize shipping when addresses and rules are available
  useEffect(() => {
    if (
      addresses &&
      addresses.length > 0 &&
      shippingRules &&
      shippingRules.length > 0
    ) {
      shippingHandler(
        parseInt(addresses[0].id),
        parseInt(addresses[0].city_id)
      );
    }
  }, [shippingRules, addresses]);

  /**
   * Initialize data on component mount
   * Get all addresses, payment methods, shipping rules
   * @Initializes useLazyGetCheckoutDataApiQuery and useLazyGetGuestCheckoutDataApiQuery @const getCheckoutDataApi and  @const getGuestCheckoutDataApi
   * Helper @func SET_CHECKOUT_DATA @params response, isRealUser
   * @func fetchCheckoutData
   * @call fetchCheckoutData into useEffect
   */

  // for real user
  const [getCheckoutDataApi, { isLoading: isGetCheckoutDataLoading }] =
    useLazyGetCheckoutDataApiQuery();
  // for guest user
  const [
    getGuestCheckoutDataApi,
    { isLoading: isGetGuestCheckoutDataLoading },
  ] = useLazyGetGuestCheckoutDataApiQuery();

  // Helper function for set checkout data
  const SET_CHECKOUT_DATA = (response, isRealUser) => {
    /**
     * Set payment getways status
     * @array [sslcommerz, paypalPaymentInfo, mollie, paystackAndMollie, instamojo, myfatoorah, flutterwavePaymentInfo, razorpayPaymentInfo, stripePaymentInfo, bkash, cash_on_delivery_status, bankPaymentInfo]
     * use updatePaymentStatuses to set payment statuses
     */
    const getWays = [
      "sslcommerz",
      "paypalPaymentInfo",
      "mollie",
      "paystackAndMollie",
      "instamojo",
      "myfatoorah",
      "flutterwavePaymentInfo",
      "razorpayPaymentInfo",
      "stripePaymentInfo",
      "bkash",
      "cash_on_delivery_status",
      "bankPaymentInfo",
    ];

    // Payment gateway status mapping with special cases
    const gatewayStatusMap = {
      mollie: () =>
        Number(response.data?.paystackAndMollie?.mollie_status) === 1,
      paystackAndMollie: () =>
        Number(response.data?.paystackAndMollie?.paystack_status) === 1,
      cash_on_delivery_status: () =>
        Number(response.data?.bankPaymentInfo?.cash_on_delivery_status) === 1,
    };

    // Update payment statuses for all gateways
    getWays.forEach((way) => {
      /* 
          How getStatus() works ?
          1. Using a custom mapping function from gatewayStatusMap if defined for that payment method
          2. Or falling back to checking if response.data[way].status equals 1
        */
      const getStatus =
        gatewayStatusMap[way] ||
        (() => Number(response.data[way]?.status) === 1);

      updatePaymentStatuses(way, getStatus());
    });

    // bank payment info
    setBankInfo(response.data.bankPaymentInfo);

    // Set shipping rules
    setShipppingRules(response.data.shippings);

    if (isRealUser) {
      // Set addresses
      setAddresses(response.data.addresses);

      // Set default shipping and billing addresses
      setShipping(response.data.addresses[0].id);
      setBilling(response.data.addresses[0].id);

      // Calculate location shipping price if map is enabled
      if (Number(webSettings?.map_status) === 1) {
        setLocationShippingPrice(
          calculateLocationShippingPrice(response.data.addresses[0])
        );
      }
    }
  };

  const fetchCheckoutData = async () => {
    // for real user
    if (auth()) {
      const userToken = auth()?.access_token;
      const response = await getCheckoutDataApi({ token: userToken });
      if (response.data) {
        SET_CHECKOUT_DATA(response, true);
      }
    }
    // for guest user
    else {
      const response = await getGuestCheckoutDataApi();
      if (response.data) {
        SET_CHECKOUT_DATA(response, false);
      }
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const guestCheckoutAddressProps = {
    fName,
    setFName,
    lName,
    setLName,
    email,
    setEmail,
    phone,
    setPhone,
    address,
    setAddress,
    home,
    setHome,
    office,
    setOffice,
    country,
    setCountry,
    state,
    setState,
    city,
    setCity,
    guestLocation,
    setGuestLocation,
    shippingHandler,
    errors,
  };

  // Don't render if no cart
  if (!carts) {
    return null;
  }

  return (
    <>
      <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
        {/* Page Title */}
        <div className="w-full mb-5">
          <PageTitle
            title="Checkout"
            breadcrumb={[
              { name: ServeLangItem()?.home, path: "/" },
              { name: ServeLangItem()?.Checkout, path: "/checkout" },
            ]}
          />
        </div>

        {/* Main Checkout Content */}
        <div className="checkout-main-content w-full">
          <div className="container-x mx-auto">
            {!isGetCheckoutDataLoading || !isGetGuestCheckoutDataLoading ? (
              <div className="w-full lg:flex lg:space-x-[30px] rtl:space-x-reverse">
                {/* Left Column - Address Section */}
                <div className="lg:w-4/6 w-full">
                  <h1 className="sm:text-2xl text-xl text-qblack font-medium mt-5 mb-5">
                    {ServeLangItem()?.Addresses}
                  </h1>

                  {auth() ? (
                    <AddressTabs
                      addresses={addresses}
                      activeAddress={activeAddress}
                      selectedBilling={selectedBilling}
                      selectedShipping={selectedShipping}
                      webSettings={webSettings}
                      setActiveAddress={setActiveAddress}
                      setBilling={setBilling}
                      shippingHandler={shippingHandler}
                      deleteAddress={deleteAddress}
                      onAddressRefresh={handleAddressRefresh}
                    />
                  ) : (
                    <GuestCheckoutAddressForm {...guestCheckoutAddressProps} />
                  )}
                </div>

                {/* Right Column - Order Summary and Payment */}
                <div className="flex-1">
                  {/* Coupon Section */}
                  <CouponSection
                    couponData={couponData}
                    updateCouponData={updateCouponData}
                    submitCoupon={submitCoupon}
                    isApplyCouponLoading={isApplyCouponLoading}
                  />

                  {/* Order Summary */}
                  <h1 className="sm:text-2xl text-xl text-qblack font-medium mt-5 mb-5">
                    {ServeLangItem()?.Order_Summary}
                  </h1>

                  <OrderSummary
                    carts={carts}
                    subTotal={subTotal}
                    totalPrice={totalPrice}
                    discountCoupon={couponData.discountCoupon}
                    mainTotalPrice={mainTotalPrice}
                    shippingRulesByCityId={shippingRulesByCityId}
                    selectedRule={selectedRule}
                    shippingCharge={shippingCharge}
                    locationShippingPrice={locationShippingPrice}
                    webSettings={webSettings}
                    selectedRuleHandler={selectedRuleHandler}
                    price={price}
                    totalWeight={totalWeight}
                    totalQty={totalQty}
                  />

                  {/* Payment Methods */}
                  <PaymentMethods
                    selectPayment={selectPayment}
                    setPaymentMethod={setPaymentMethod}
                    paymentStatuses={paymentStatuses}
                    stripeData={stripeData}
                    updateStripeData={updateStripeData}
                    bankInfo={bankInfo}
                    transactionInfo={transactionInfo}
                    setTransactionInfo={setTransactionInfo}
                    placeOrderHandler={placeOrderHandler}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center min-h-screen">
                <LoaderStyleTwo width="100px" height="100px" margin="0" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
