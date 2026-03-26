import { useState } from "react";

export const useCheckoutState = () => {
  // Cart and product related state
  const [carts, setCarts] = useState(null);
  const [subTotal, setSubTotal] = useState(null);
  const [mainTotalPrice, setMainTotalPrice] = useState(null);
  const [totalWeight, setTotalWeight] = useState(null);
  const [totalQty, setQty] = useState(null);

  // Location and address state
  const [location, setLocation] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const [activeAddress, setActiveAddress] = useState("billing");
  const [selectedShipping, setShipping] = useState(null);
  const [selectedBilling, setBilling] = useState(null);

  // Guest fields state
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [home, setHome] = useState(true);
  const [office, setOffice] = useState(false);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [guestLocation, setGuestLocation] = useState(null);
  const [errors, setErrors] = useState(null);

  // Shipping related state
  const [shippingRules, setShipppingRules] = useState(null);
  const [shippingRulesByCityId, setShippingRulesByCityId] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(null);
  const [locationShippingPrice, setLocationShippingPrice] = useState(null);

  // Payment method state
  const [selectPayment, setPaymentMethod] = useState(null);

  // Stripe payment state
  const [stripeData, setStripeData] = useState({
    cardNumber: "",
    expireDate: null,
    cvv: "",
    cardHolderName: "",
    error: null,
    loading: false,
  });

  // Coupon state
  const [couponData, setCouponData] = useState({
    inputCoupon: "",
    couponCode: null,
    discountCoupon: 0,
  });

  // Bank payment state
  const [bankInfo, setBankInfo] = useState(null);
  const [transactionInfo, setTransactionInfo] = useState("");

  // Payment method status state - consolidated all payment statuses
  const [paymentStatuses, setPaymentStatuses] = useState({
    sslcommerz: null,
    paypalPaymentInfo: null,
    mollie: null,
    paystackAndMollie: null,
    instamojo: null,
    myfatoorah: null,
    flutterwavePaymentInfo: null,
    razorpayPaymentInfo: null,
    stripePaymentInfo: null,
    bkash: null,
    cash_on_delivery_status: null,
    bankPaymentInfo: null,
  });

  // Helper functions to update stripe data
  const updateStripeData = (field, value) => {
    setStripeData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper functions to update coupon data
  const updateCouponData = (field, value) => {
    setCouponData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper functions to update payment statuses
  const updatePaymentStatuses = (field, value) => {
    setPaymentStatuses((prev) => ({ ...prev, [field]: value }));
  };

  return {
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
  };
};
