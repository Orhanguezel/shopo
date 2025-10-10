// src/features/shipping/zones/shippingZones.api.js
import { api, shapeList, pickData } from "@/lib/api/baseApi";

/**
 * Paths (backend’ine göre düzenle):
 * - Admin zones:  /shipping/admin/zones
 * - Public zone resolve: /shipping/public/zones/resolve
 */
export const shippingZonesApi = api
  .enhanceEndpoints({ addTagTypes: ["GeoZone"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* ADMIN — CREATE */
      createZone: build.mutation({
        // body: { code, name:{}, isActive, countries, states, citiesInc, postalInc, priority, ... }
        query: (data) => ({
          url: "/shipping/admin/zones",
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "GeoZone", id: "LIST" }],
      }),

      /* ADMIN — GET BY ID */
      getZoneById: build.query({
        query: (id) => ({ url: `/shipping/admin/zones/${id}` }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "GeoZone", id }],
      }),

      /* ADMIN — LIST (filters: isActive?, q?, country?...) */
      listZones: build.query({
        query: (params = {}) => ({
          url: "/shipping/admin/zones",
          params,
        }),
        transformResponse: shapeList,
        providesTags: (res) =>
          res?.items?.length
            ? [
                ...res.items.map((z) => ({
                  type: "GeoZone",
                  id: z?._id || z?.id || z?.code,
                })),
                { type: "GeoZone", id: "LIST" },
              ]
            : [{ type: "GeoZone", id: "LIST" }],
      }),

      /* ADMIN — UPDATE */
      updateZone: build.mutation({
        query: ({ id, data }) => ({
          url: `/shipping/admin/zones/${id}`,
          method: "PUT",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { id }) => [
          { type: "GeoZone", id },
          { type: "GeoZone", id: "LIST" },
        ],
      }),

      /* ADMIN — DELETE */
      deleteZone: build.mutation({
        query: (id) => ({
          url: `/shipping/admin/zones/${id}`,
          method: "DELETE",
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, id) => [
          { type: "GeoZone", id },
          { type: "GeoZone", id: "LIST" },
        ],
      }),

      /* PUBLIC — RESOLVE (addr -> zone) */
      resolveZone: build.query({
        // params: { country, state, city, postal }
        query: (params) => ({
          url: "/shipping/public/zones/resolve",
          params,
        }),
        transformResponse: pickData, // -> { zoneId / id / _id ... }
      }),
    }),
    overrideExisting: true,
  });

export const {
  useCreateZoneMutation,
  useGetZoneByIdQuery,
  useListZonesQuery,
  useUpdateZoneMutation,
  useDeleteZoneMutation,
  useResolveZoneQuery,
} = shippingZonesApi;
