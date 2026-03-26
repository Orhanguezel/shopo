import apiRoutes from "@/appConfig/apiRoutes";
import { apiSlice } from "@/redux/api/apiSlice";
import { getCookie, hasCookie } from "cookies-next";

// Helper function to get language code from cookie
const getLanguageCodeFromCookie = () => {
  if (typeof window === "undefined") return null;
  
  if (hasCookie("googtrans")) {
    const cookieValue = getCookie("googtrans");
    if (cookieValue && typeof cookieValue === "string") {
      // Cookie format: "/auto/tr" -> extract "tr"
      const langCode = cookieValue.replace("/auto/", "").replace("/", "");
      if (langCode && langCode !== "auto") {
        return langCode;
      }
    }
  }
  return null;
};

export const websiteSetupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDefaultSetup: builder.query({
      query: () => {
        const langCode = getLanguageCodeFromCookie();
        const url = langCode 
          ? `${apiRoutes.websiteSetup}?lang_code=${langCode}`
          : apiRoutes.websiteSetup;
        
        return {
          url: url,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        // Include language code in cache key to ensure different languages are cached separately
        const langCode = getLanguageCodeFromCookie();
        return `${endpointName}_${langCode || 'default'}`;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    subscribeRequest: builder.mutation({
      query: (email) => {
        return {
          url: apiRoutes.subscribeRequest,
          method: "POST",
          body: { email },
        };
      },
    }),
  }),
});

export const { useGetDefaultSetupQuery, useSubscribeRequestMutation } =
  websiteSetupApi;
