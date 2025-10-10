import MainApi from "@/api-manage/MainApi";
import { landing_page_api } from "@/api-manage/ApiRoutes.js";
import { useQuery } from "@tanstack/react-query";

const getData = async () => {
    const { data } = await MainApi.get(landing_page_api);
    return data;
};

export default function useGetLandingPage() {
    return useQuery("landing-page-data", getData, {
        enabled: false,
    });
}