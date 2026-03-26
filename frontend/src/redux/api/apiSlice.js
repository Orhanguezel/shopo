import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import appConfig from "@/appConfig";

// Create our base api slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: (appConfig.BASE_URL || 'https://admin.seyfibaba.com/') + "api/",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  endpoints: () => ({}),
});
