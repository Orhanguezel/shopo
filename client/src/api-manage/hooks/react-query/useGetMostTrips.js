import { useQuery } from "@tanstack/react-query";

import { most_trips } from "@/api-manage/ApiRoutes.js";
import MainApi from "@/api-manage/MainApi";
import { onSingleErrorResponse } from "../../api-error-response/ErrorResponses";

const getData = async () => {
  const { data } = await MainApi.get(`${most_trips}`);
  return data;
};

export default function useGetMostTrips() {
  return useQuery("most-trips", () => getData(), {
    enabled: true,
    onError: onSingleErrorResponse,
  });
}
