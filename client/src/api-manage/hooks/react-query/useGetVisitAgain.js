import { useQuery } from "@tanstack/react-query";
import MainApi from "@/api-manage/MainApi";
import { onSingleErrorResponse } from "../../api-error-response/ErrorResponses";
import { visit_again } from "api-manage/ApiRoutes";

export const getData = async () => {
  const { data } = await MainApi.get(`${visit_again}`);
  return data;
};
export const useGetVisitAgain = () => {
  return useQuery("visit again", () => getData(), {
    enabled: false,
    onError: onSingleErrorResponse,
  });
};
