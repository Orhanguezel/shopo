import MainApi from "@/api-manage/MainApi";
import { useQuery } from "@tanstack/react-query";
import { coupon_list_api } from "@/api-manage/ApiRoutes.js";
import { getToken } from "helper-functions/getToken";

const getData = async () => {
  if (getToken()) {
    const { data } = await MainApi.get(coupon_list_api);
    return data;
  }

};

export default function useGetCoupons() {
  return useQuery("coupons-list", getData, {
    enabled: false,
  });
}
