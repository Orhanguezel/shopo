// client/api-manage/api-call-functions/public/attributes.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * Public Attributes API
 *  - LIST: GET    /attributes            ?q=&lang=&type=&group=&limit=
 *  - GET:  GET    /attributes/:code
 */
export const publicAttributesApi = api
  .enhanceEndpoints({ addTagTypes: ["Attribute", "AttributeList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (active only) */
      listPublicAttributes: build.query({
        query: (params = {}) => ({
          url: R.public.attributes.list(),
          params, // { q, lang, type, group, limit }
        }),
        transformResponse: (res) => {
          const { items, total, meta } = shapeList(res);
          return { items, total, meta };
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((a) => ({
                type: "Attribute",
                id: a?.id || a?._id,
              })),
              { type: "AttributeList", id: "PUBLIC" },
            ]
            : [{ type: "AttributeList", id: "PUBLIC" }],
      }),

      /* GET BY CODE (active only) */
      getPublicAttributeByCode: build.query({
        query: (code) => ({ url: R.public.attributes.get(code) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?._id || result?.id
            ? [{ type: "Attribute", id: result._id || result.id }]
            : [],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublicAttributesQuery,
  useGetPublicAttributeByCodeQuery,
} = publicAttributesApi;
