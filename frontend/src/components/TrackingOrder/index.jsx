"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputCom from "../Helpers/InputCom";
import PageTitle from "../Helpers/PageTitle";
import Thumbnail from "./Thumbnail";
import ServeLangItem from "../Helpers/ServeLangItem";
import { useLazyTrackOrderApiQuery } from "@/redux/features/order/apiSlice";
import auth from "../../utils/auth";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";

function TrackingOrder() {
  const router = useRouter();
  // local state
  const [form, setForm] = useState({ orderNumber: "", date: "" });

  /**
   * track order functionality
   * @Initialization trackOrderApiMutation Api @const trackOrderApi
   * @func trackOrderSuccessHandler @const trackOrderSuccessHandler @params data, statusCode
   * @func trackOrderErrorHandler @const trackOrderErrorHandler @params error
   * @func trackOrder
   */
  const [trackOrderApi, { isLoading: isTrackOrderLoading }] =
    useLazyTrackOrderApiQuery();

  const trackOrderSuccessHandler = (data, statusCode) => {
    if (statusCode === 200 || statusCode === 201) {
      router.push(`order/${data?.order?.order_id}`);
    }
  };

  const trackOrderErrorHandler = (error) => {
    if (error.status === 403) {
      toast.error(error?.data?.message);
    } else {
      toast.error(error?.data?.message);
    }
  };

  const trackOrder = () => {
    const userToken = auth()?.access_token;
    if (form.orderNumber) {
      trackOrderApi({
        data: form.orderNumber,
        token: userToken,
        success: trackOrderSuccessHandler,
        error: trackOrderErrorHandler,
      });
    } else {
      toast.error("Order Number is required");
    }
  };

  return (
    <div className="tracking-page-wrapper w-full">
      {/* Page Title Section */}
      <div className="page-title mb-[40px]">
        <PageTitle
          title="Track Order"
          breadcrumb={[
            { name: ServeLangItem()?.home, path: "/" },
            { name: ServeLangItem()?.Track_Order, path: "/tracking-order" },
          ]}
        />
      </div>

      {/* Main Content Section */}
      <div className="content-wrapper w-full mb-[40px]">
        <div className="container-x mx-auto">
          {/* Heading and Description */}
          <h1 className="text-[22px] text-qblack font-semibold leading-9">
            {ServeLangItem()?.Track_Your_Order}
          </h1>
          <p className="text-[15px] text-qgraytwo leading-8 mb-5">
            {
              ServeLangItem()
                ?.Enter_your_order_tracking_number_and_your_secret_id
            }
            .
          </p>

          {/* Form and Thumbnail Section */}
          <div className="w-full bg-white lg:px-[30px] px-5 py-[23px] lg:flex items-center">
            {/* Form Inputs */}
            <div className="lg:w-[642px] w-full">
              {/* Order Number Input */}
              <div className="mb-3">
                <InputCom
                  value={form.orderNumber}
                  inputHandler={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      orderNumber: e.target.value,
                    }))
                  }
                  placeholder="Order Number"
                  label="Order Tracking Number*"
                  inputClasses="w-full h-[50px]"
                />
              </div>
              {/* Delivery Date Input */}
              <div className="mb-[30px]">
                <InputCom
                  value={form.date}
                  inputHandler={(e) =>
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  placeholder="23/09/2022"
                  label="Delivery Date"
                  inputClasses="w-full h-[50px]"
                />
              </div>

              {/* Track Order Button */}
              <button
                onClick={trackOrder}
                type="button"
                disabled={isTrackOrderLoading}
              >
                <div className="w-[142px] h-[50px] black-btn flex justify-center items-center disabled:cursor-not-allowed">
                  {isTrackOrderLoading ? (
                    <span style={{ transform: "scale(0.3)" }}>
                      <LoaderStyleOne />
                    </span>
                  ) : (
                    <span>{ServeLangItem()?.Track_Now}</span>
                  )}
                </div>
              </button>
            </div>

            {/* Thumbnail Illustration */}
            <div className="flex-1 flex justify-center mt-5 lg:mt-0">
              <Thumbnail />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackingOrder;
