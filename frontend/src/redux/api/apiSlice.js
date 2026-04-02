import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "cookies-next";
import appConfig from "@/appConfig";

/**
 * Laravel JWT (tymon/jwt-auth) önce Authorization: Bearer okur; yalnızca ?token= kullanmak
 * bazı ortamlarda 401 + global logout tetikleyebilir.
 */
function getClientAccessToken() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth");
  if (raw && raw !== "null" && raw !== "undefined") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.access_token) return parsed.access_token;
    } catch {
      /* ignore */
    }
  }
  const fromCookie = getCookie("access_token");
  return fromCookie || null;
}

const baseQuery = fetchBaseQuery({
  baseUrl: (appConfig.BASE_URL || 'https://admin.seyfibaba.com/') + "api/",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
  prepareHeaders: (headers) => {
    const token = getClientAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * 401 hatalarında auth state'i temizle ve login'e yönlendir
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const hadToken = !!getClientAccessToken();
  const result = await baseQuery(args, api, extraOptions);

  // Oturumlu istek 401 ise token geçersiz — misafir isteklerinde 401'e takılıp oturumu silme
  if (result.error && result.error.status === 401 && hadToken) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth");
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

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
