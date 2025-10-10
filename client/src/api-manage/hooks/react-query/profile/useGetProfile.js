import MainApi from "../../../MainApi";
import { useQuery } from "@tanstack/react-query";
import { profile_info } from "../../../ApiRoutes";
import {
  onErrorResponse,
} from "../../../api-error-response/ErrorResponses";

const getUserProfile = async () => {
  const { data } = await MainApi.get(profile_info);
  return data;
};

export default function useGetProfile(userOnSuccessHandler) {
  return useQuery("user-profile", getUserProfile, {
    enabled: false,
    onSuccess: userOnSuccessHandler,
    onError: onErrorResponse,
  });
}
