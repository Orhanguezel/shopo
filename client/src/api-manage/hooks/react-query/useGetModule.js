import MainApi from "@/api-manage/MainApi";
import { useQuery } from "@tanstack/react-query";
import { moduleList } from "@/api-manage/ApiRoutes.js";
import { onErrorResponse } from "../../api-error-response/ErrorResponses";

const getModule = async () => {
  const { data } = await MainApi.get(moduleList);
  return data;
};

export default function useGetModule() {
  return useQuery("module-list", getModule, {
    enabled: false,
    onError: onErrorResponse,
  });
}
