import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearCartAction } from "@/redux/features/cart/cartSlice";
import auth from "@/utils/auth";
import appConfig from "@/appConfig";
import {
  useBankPaymentApiMutation,
  useCashOnDeliveryGuestApiMutation,
  useCashOnDeliveryApiMutation,
  useBankPaymentGuestApiMutation,
  useDraftOrderApiMutation,
  useDraftOrderGuestApiMutation,
  useIyzicoCheckoutApiMutation,
  useIyzicoCheckoutGuestApiMutation,
} from "@/redux/features/order/paymentGetways/apiSlice";
import guestFormValidation from "../utils/guestFormValidation";

export default function usePlaceOrder({
  carts,
  addresses,
  webSettings,
  selectedBilling,
  selectedShipping,
  selectedRule,
  couponCode,
  selectPayment,
  transactionInfo,
  guestFields = {},
  setNewAddress = () => {},
  ServeLangItem = () => ({}),
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  /**
   * @Initialization Payment Getway Apis
   * @const cashOnDeliveryApi, @const cashOnDeliveryGuestApi, @const bankPaymentApi, @const bankPaymentGuestApi, @const draftOrderApi, @const draftOrderGuestApi
   */
  const [cashOnDeliveryApi, { isLoading: isCashOnDeliveryLoading }] =
    useCashOnDeliveryApiMutation();
  const [cashOnDeliveryGuestApi, { isLoading: isCashOnDeliveryGuestLoading }] =
    useCashOnDeliveryGuestApiMutation();
  const [bankPaymentApi, { isLoading: isBankPaymentLoading }] =
    useBankPaymentApiMutation();
  const [bankPaymentGuestApi, { isLoading: isBankPaymentGuestLoading }] =
    useBankPaymentGuestApiMutation();
  const [draftOrderApi, { isLoading: isDraftOrderLoading }] =
    useDraftOrderApiMutation();
  const [draftOrderGuestApi, { isLoading: isDraftOrderGuestLoading }] =
    useDraftOrderGuestApiMutation();
  const [iyzicoCheckoutApi, { isLoading: isIyzicoLoading }] =
    useIyzicoCheckoutApiMutation();
  const [iyzicoCheckoutGuestApi, { isLoading: isIyzicoGuestLoading }] =
    useIyzicoCheckoutGuestApiMutation();

  const removeCouponFromStorage = () => {
    localStorage.removeItem("coupon_set_date");
    localStorage.removeItem("coupon");
  };

  const getSuccessFailUrlParams = (orderId) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `&order_id=${orderId}&request_from=react_web&frontend_success_url=${JSON.stringify(
      origin + "/order/"
    )}&frontend_faild_url=${JSON.stringify(origin + "/payment-failed")}`;
  };

  const buildGuestAddressObject = () => ({
    name:
      guestFields.fName && guestFields.lName
        ? `${guestFields.fName} ${guestFields.lName}`
        : null,
    email: guestFields.email,
    phone: guestFields.phone,
    address: guestFields.address,
    type: guestFields.home || guestFields.office || null,
    country: guestFields.country,
    state: guestFields.state,
    city: guestFields.city,
    latitude:
      Number(webSettings?.map_status) === 1 && guestFields.location
        ? guestFields.location.lat
        : undefined,
    longitude:
      Number(webSettings?.map_status) === 1 && guestFields.location
        ? guestFields.location.lng
        : undefined,
  });

  // when NOT REDIRECT payment getway route
  const handleApiResponse = async (response) => {
    try {
      const res = await response;
      if (res) {
        toast.success(res.message);
        router.push(`/order/${res.order_id}`);
        dispatch(clearCartAction());
        removeCouponFromStorage();
      }
    } catch (err) {
      toast.error(err?.data?.message);
    }
  };

  // when REDIRECT payment getway route
  const handleDraftOrderAndRedirect = async (
    apiMethod,
    urlPrefix,
    queryParams = "",
    guest = false
  ) => {
    try {
      const res = await apiMethod().unwrap();
      const url = `${appConfig.BASE_URL}${urlPrefix}?${
        guest ? "" : "token=" + auth()?.access_token
      }${queryParams}${getSuccessFailUrlParams(res.order_id)}`;
      router.push(url);
      removeCouponFromStorage();
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  };

  const placeOrderHandler = () => {
    const isGuest = !auth();
    const basePayload = isGuest
      ? {
          address: buildGuestAddressObject(),
          cart_products: carts,
          shipping_method_id: parseInt(selectedRule),
          coupon: couponCode && couponCode.code,
        }
      : {
          cart_products: carts,
          shipping_address_id: selectedShipping,
          billing_address_id: selectedBilling,
          shipping_method_id: parseInt(selectedRule),
          coupon: couponCode && couponCode.code,
        };

    const routes = {
      cashOnDelivery: () =>
        handleApiResponse(
          isGuest
            ? cashOnDeliveryGuestApi({
                data: basePayload,
              }).unwrap()
            : cashOnDeliveryApi({
                data: basePayload,
                token: auth()?.access_token,
              }).unwrap()
        ),
      bankpayment: () =>
        handleApiResponse(
          isGuest
            ? bankPaymentGuestApi({
                data: {
                  ...basePayload,
                  tnx_info: transactionInfo,
                },
              }).unwrap()
            : bankPaymentApi({
                data: {
                  ...basePayload,
                  tnx_info: transactionInfo,
                },
                token: auth()?.access_token,
              }).unwrap()
        ),
      iyzico: async () => {
        try {
          const apiCall = isGuest
            ? iyzicoCheckoutGuestApi({ data: basePayload })
            : iyzicoCheckoutApi({
                data: basePayload,
                token: auth()?.access_token,
              });
          const res = await apiCall.unwrap();
          if (res.success && res.data.checkout_url) {
            router.push(res.data.checkout_url);
            removeCouponFromStorage();
          } else {
            toast.error(res.message || "Iyzico session failed");
          }
        } catch (err) {
          toast.error(err?.data?.message || "Something went wrong with Iyzico");
        }
      },
    };

    if (isGuest) {
      const validationFields = [
        { field: "fName", message: "First name is required" },
        { field: "lName", message: "Last name is required" },
        { field: "email", message: "Email is required" },
        { field: "phone", message: "Phone is required" },
        { field: "address", message: "Address is required" },
        { field: "country", message: "Country is required" },
        { field: "state", message: "State is required" },
        { field: "city", message: "City is required" },
      ];

      // Validate all fields
      let errors = {};
      validationFields.forEach(({ field, message }) => {
        if (guestFormValidation(guestFields, field, message)) {
          errors = {
            ...errors,
            [field]: guestFormValidation(guestFields, field, message),
          };
        }
      });

      const isGuestFormValid = Object.keys(errors).length === 0;

      if (!isGuestFormValid) {
        guestFields.setErrors(errors);
        return toast.error("Please fill all the fields");
      } else {
        guestFields.setErrors(null);
      }
    }

    if (!selectedRule)
      return toast.error(ServeLangItem()?.Please_Select_Shipping_Rule);

    if (!selectPayment)
      return toast.error(ServeLangItem()?.Please_Select_Your_Payment_Method);

    if (!isGuest && Number(webSettings?.map_status) === 1) {
      const findAddress = addresses?.find(
        (f) => parseInt(f.id) === selectedShipping
      );
      if (!Number(findAddress?.latitude) || !Number(findAddress?.longitude)) {
        toast.error("Location not found. Please create a new location");
        return setNewAddress(true);
      }
    }

    return routes[selectPayment]
      ? routes[selectPayment]()
      : toast.error(ServeLangItem()?.Select_your_payment_system);
  };

  return { placeOrderHandler };
}
