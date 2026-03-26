"use client";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import auth from "../../utils/auth";
import settings from "../../utils/settings";
import BreadcrumbCom from "../BreadcrumbCom";
import ServeLangItem from "../Helpers/ServeLangItem";
import CurrencyConvert from "../Shared/CurrencyConvert";
import PrintBtn from "./PrintBtn";
import ReviewModal from "./ReviewModal";
import TrackDeliveryMan from "./TrackDeliveryMan";
import { clearCartAction } from "@/redux/features/cart/cartSlice";
import { useDispatch } from "react-redux";
function OrderComContent({ resData, orderStatus, orderId }) {
  const webSettings = settings();
  const urlQuery = useSearchParams();
  const dispatch = useDispatch();

  // review modal
  const [reviewModal, setReviewModal] = useState(false);
  const [productId, setProductId] = useState(null);
  const reviewModalHandler = (id) => {
    setReviewModal(!reviewModal);
    setProductId(Number(id));
  };

  // check order status and clear cart

  useEffect(() => {
    if (urlQuery.get("payment_status") === "success") {
      dispatch(clearCartAction());
    }
  }, [urlQuery]);

  return (
    <div className="w-full pt-[30px] pb-[60px]">
      <div className="order-tracking-wrapper w-full">
        <div className="container-x mx-auto">
          <BreadcrumbCom
            paths={[
              { name: ServeLangItem()?.home, path: "/" },
              { name: ServeLangItem()?.Order, path: `/order/${orderId}` },
            ]}
          />
          <div className="w-full h-[168px]  bg-[#CBECFF] rounded-2xl mb-10 relative print:hidden">
            <div className="w-full px-10 flex justify-between pt-3 mb-7">
              <div>
                {resData.order_delivered_date && (
                  <p className="text-base font-400">
                    {ServeLangItem()?.Delivered_on}{" "}
                    {resData.order_delivered_date}
                  </p>
                )}
              </div>
              <div>
                {orderStatus === "Declined" && (
                  <p className="text-base font-bold text-qred mr-10">
                    {ServeLangItem()?.Your_order_is_declined}!
                  </p>
                )}
              </div>
            </div>
            <div className="flex lg:space-x-[373px] space-x-[90px] rtl:space-x-reverse w-full h-full justify-center">
              <div className="relative">
                <div className="w-[30px] h-[30px] border-[8px] rounded-full border-qyellow bg-white relative z-20"></div>
                <p className="absolute -left-4 top-10 sm:text-base text-sm font-400">
                  {ServeLangItem()?.Pending}
                </p>
              </div>
              {/*orderStatus*/}
              <div className="relative">
                <div
                  className={`w-[30px] h-[30px] border-[8px] rounded-full  bg-white relative z-20 ${
                    orderStatus === "Progress" ||
                    orderStatus === "Delivered" ||
                    orderStatus === "Completed"
                      ? "border-qyellow"
                      : "border-qgray"
                  }`}
                ></div>
                <div
                  className={`lg:w-[400px] w-[100px] h-[8px] absolute ltr:lg:-left-[390px] ltr:-left-[92px] rtl:lg:-right-[390px] rtl:-right-[92px] top-[10px] z-10  ${
                    orderStatus === "Progress" ||
                    orderStatus === "Delivered" ||
                    orderStatus === "Completed"
                      ? "primary-bg"
                      : "bg-white"
                  }`}
                ></div>
                <p className="absolute -left-4 top-10 sm:text-base text-sm font-400">
                  {ServeLangItem()?.Progress}
                </p>
              </div>
              <div className="relative">
                <div
                  className={`w-[30px] h-[30px] border-[8px] rounded-full bg-white  relative z-20 ${
                    orderStatus === "Delivered" || orderStatus === "Completed"
                      ? "border-qyellow"
                      : "border-qgray"
                  }`}
                ></div>
                <div
                  className={`lg:w-[400px] w-[100px] h-[8px] absolute ltr:lg:-left-[390px] ltr:-left-[92px] rtl:lg:-right-[390px] rtl:-right-[92px] top-[10px] z-10 ${
                    orderStatus === "Delivered" || orderStatus === "Completed"
                      ? "primary-bg"
                      : "bg-white"
                  }`}
                ></div>
                <p className="absolute -left-4 top-10 sm:text-base text-sm font-400">
                  {ServeLangItem()?.Delivered}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white lg:p-10 p-3 rounded-xl">
            <div id="printSection">
              <div className="sm:flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-[26px] font-semibold text-qblack mb-2.5">
                    {resData.order_address &&
                      resData.order_address.billing_name}
                  </h1>
                  <ul className="flex flex-col space-y-0.5">
                    <li className="text-[22px]n text-[#4F5562]">
                      {ServeLangItem()?.Order_ID}:{" "}
                      <span className="text-[#27AE60] notranslate">
                        {resData.order_id}
                      </span>
                    </li>
                    <li className="text-[22px]n text-[#4F5562]">
                      {ServeLangItem()?.Billing_Address}:{" "}
                      <span className="text-[#27AE60] notranslate">{`${
                        resData.order_address &&
                        resData.order_address.billing_address
                      },${
                        resData.order_address &&
                        resData.order_address.billing_city
                      },${
                        resData.order_address &&
                        resData.order_address.billing_state
                      }`}</span>
                    </li>
                    <li className="text-[22px]n text-[#4F5562]">
                      {ServeLangItem()?.Shipping_Address}:{" "}
                      <span className="text-[#27AE60] notranslate">{`${
                        resData.order_address &&
                        resData.order_address.shipping_address
                      },${
                        resData.order_address &&
                        resData.order_address.shipping_city
                      },${
                        resData.order_address &&
                        resData.order_address.shipping_state
                      }`}</span>
                    </li>
                    <li className="text-[22px]n text-[#4F5562]">
                      {ServeLangItem()?.Type}:{" "}
                      <span className="text-[#27AE60] notranslate">
                        {resData.order_address &&
                        parseInt(
                          resData.order_address.shipping_address_type
                        ) === 1
                          ? "Office"
                          : "Home"}
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <PrintBtn />
                </div>
              </div>
              <div className="relative w-full overflow-x-auto overflow-style-none border border-[#EDEDED] box-border mb-10">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <tbody>
                    {/* table heading */}
                    <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] whitespace-nowrap px-2 border-b default-border-bottom uppercase">
                      <td className=" py-4 ltr:pl-10 rtl:pr-10 block whitespace-nowrap rtl:text-right  w-[380px]">
                        {ServeLangItem()?.Product}
                      </td>
                      <td className="py-4 whitespace-nowrap  text-center">
                        {ServeLangItem()?.quantity}
                      </td>
                      <td className="py-4 whitespace-nowrap text-center">
                        {ServeLangItem()?.price}
                      </td>
                      <td className="py-4 whitespace-nowrap text-center capitalize">
                        {ServeLangItem()?.SUBTOTAL}
                      </td>
                      <td className="py-4 whitespace-nowrap text-center print:hidden">
                        {ServeLangItem()?.review}
                      </td>
                    </tr>
                    {/* table heading end */}
                    {resData?.order_products?.length > 0 &&
                      resData?.order_products?.map((item, i) => (
                        <tr
                          key={i}
                          className="bg-white border-b hover:bg-gray-50 last:border-none"
                        >
                          <td className="pl-10 w-[400px] py-4 ">
                            <div className="flex space-x-6 items-center">
                              <div className="flex-1 flex flex-col">
                                <p className="font-medium text-[15px] text-qblack rtl:text-right rtl:pr-10 notranslate">
                                  {item.product_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className=" py-4">
                            <div className="flex justify-center items-center">
                              <div className="w-[54px] h-[40px] justify-center flex items-center border border-qgray-border">
                                <span>{item.qty}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-2">
                            <div className="flex space-x-1 items-center justify-center">
                              <span className="text-[15px] font-normal">
                                <CurrencyConvert price={item.unit_price} />
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-4 px-2">
                            <div className="flex space-x-1 items-center justify-center">
                              <span className="text-[15px] font-normal">
                                <CurrencyConvert
                                  price={item.unit_price * item.qty}
                                />
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-4 px-2 print:hidden">
                            {auth() && (
                              <button
                                onClick={() =>
                                  reviewModalHandler(item.product_id)
                                }
                                type="button"
                                className="text-green-500 text-sm font-semibold capitalize"
                              >
                                {ServeLangItem()?.review}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="flex sm:justify-end print:justify-end justify-center sm:mr-10">
                <div>
                  <div className="flex justify-between font-semibold w-[200px] mb-1">
                    <p className="text-sm text-qblack capitalize">
                      {ServeLangItem()?.SUBTOTAL}
                    </p>
                    <p className="text-sm text-qblack">
                      <CurrencyConvert
                        price={
                          parseFloat(resData?.total_amount) -
                          parseFloat(resData?.shipping_cost) +
                          parseFloat(resData?.coupon_coast)
                        }
                      />
                    </p>
                  </div>
                  <div className="flex justify-between font-semibold w-[200px]">
                    <p className="text-sm text-qred">
                      (-) {ServeLangItem()?.Discount_coupon}
                    </p>
                    <p className="text-sm text-qred">
                      -
                      <CurrencyConvert price={resData?.coupon_coast} />
                    </p>
                  </div>
                  <div className="flex justify-between font-semibold w-[200px]">
                    <p className="text-sm text-qblack">
                      (+) {ServeLangItem()?.Shipping_Cost}
                    </p>
                    <p className="text-sm text-qblack">
                      +<CurrencyConvert price={resData?.shipping_cost} />
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-qgray-border mt-4"></div>
                  <div className="flex justify-between font-semibold w-[200px] mt-4">
                    <p className="text-lg text-qblack">
                      {ServeLangItem()?.Total_Paid}
                    </p>
                    <p className="text-lg text-qblack">
                      <CurrencyConvert price={resData?.total_amount} />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {resData?.deliveryman &&
            resData?.latitude &&
            resData?.longitude &&
            Number(webSettings?.map_status) === 1 &&
            Number(resData?.order_status) === 2 && (
              <TrackDeliveryMan
                location={{
                  lat: Number(resData?.latitude),
                  lng: Number(resData?.longitude),
                }}
                deliverymanLocationPoint={{
                  lat: Number(resData?.deliveryman?.latitude),
                  lng: Number(resData?.deliveryman?.longitude),
                }}
                orderId={orderId}
              />
            )}
        </div>
      </div>
      {auth() && reviewModal && (
        <ReviewModal productId={productId} setReviewModal={setReviewModal} />
      )}
    </div>
  );
}

function OrderCom({ resData, orderStatus, orderId }) {
  return (
    <Suspense
      fallback={
        <div className="w-full pt-[30px] pb-[60px] flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <OrderComContent
        resData={resData}
        orderStatus={orderStatus}
        orderId={orderId}
      />
    </Suspense>
  );
}

export default OrderCom;
