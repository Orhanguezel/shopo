import { useQuery } from "@tanstack/react-query";
import MainApi from "@/api-manage/MainApi";
import {
  data_limit,
  refund_policy_api,
  wallet_transactions_list_api,
} from "@/api-manage/ApiRoutes.js";

const getData = async (apiLink) => {
  const { data } = await MainApi.get(apiLink);
  return data;
};
export default function useGetPolicyPage(apiLink) {
  return useQuery("refund-policy", () => getData(apiLink), {
    // enabled: false,
    cacheTime: 100000,
    staleTime: 100000,
  });
}
