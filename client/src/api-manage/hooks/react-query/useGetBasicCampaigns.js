import MainApi from "@/api-manage/MainApi";
import { useQuery } from "@tanstack/react-query";
import { onSingleErrorResponse } from "../../api-error-response/ErrorResponses";
import { basic_campaigns_api } from "@/api-manage/ApiRoutes.js";

const getData = async () => {
  const { data } = await MainApi.get(basic_campaigns_api);
  return data;
};

export default function useGetBasicCampaigns() {
  return useQuery("basic-cam", getData, {
    enabled: false,
    onError: onSingleErrorResponse,
  });
}
