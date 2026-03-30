import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import appConfig from "@/appConfig";

const baseQuery = fetchBaseQuery({
  baseUrl: (appConfig.BASE_URL || 'https://admin.seyfibaba.com/') + "api/",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
  prepareHeaders: (headers) => {
    return headers;
  },
});

/**
 * 401 hatalarında auth state'i temizle ve login'e yönlendir
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // localStorage ve cookie temizle
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth");
      // Cookie sil
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Login sayfasında değilsek yönlendir
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  return result;
};

// Create our base api slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
