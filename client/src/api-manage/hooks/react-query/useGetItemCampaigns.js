import MainApi from "@/api-manage/MainApi";
import { useQuery } from "@tanstack/react-query";
import { onSingleErrorResponse } from "../../api-error-response/ErrorResponses";
import { campaigns_item } from "@/api-manage/ApiRoutes.js";

const getData = async () => {
  const { data } = await MainApi.get(campaigns_item);
  return data;
};

export default function useGetItemCampaigns() {
  return useQuery("item-campaigns", getData, {
    enabled: false,
    onError: onSingleErrorResponse,
  });
}
