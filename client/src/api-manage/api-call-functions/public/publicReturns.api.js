import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – Returns (RMA)
 *  - CREATE : POST {public.returns}
 *  - GET    : GET  {public.returns}/:code
 */
export const publicReturnsApi = api
  .enhanceEndpoints({ addTagTypes: ["RMA", "RMAList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* CREATE RMA */
      createPublicRMA: build.mutation({
        // body = { orderId, lines:[{itemIndex,quantity,reason}], note? }
        query: (body) => ({
          url: R.public.returns.create(),
          method: "POST",
          body,
        }),
        transformResponse: pickData,
      }),

      /* GET BY CODE */
      getPublicRMAByCode: build.query({
        query: (code) => ({ url: R.public.returns.get(code) }),
        transformResponse: pickData,
        providesTags: (result) =>
          result?._id ? [{ type: "RMA", id: result._id }] : [],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useCreatePublicRMAMutation,
  useGetPublicRMAByCodeQuery,
} = publicReturnsApi;
