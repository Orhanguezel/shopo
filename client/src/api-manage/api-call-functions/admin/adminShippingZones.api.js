// client/api-manage/api-call-functions/admin/shipping-zones.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList, pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * GeoZones – ADMIN
 *  - CREATE : POST   {shipping/zones}
 *  - GET    : GET    {shipping/zones}/:id
 *  - LIST   : GET    {shipping/zones}
 *  - UPDATE : PUT    {shipping/zones}/:id
 *  - DELETE : DELETE {shipping/zones}/:id
 *
 * Not: REGISTRY.admin.shippingZones → "shipping/zones"
 */
export const geoZonesAdminApi = api
  .enhanceEndpoints({ addTagTypes: ["GeoZone", "GeoZoneList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      createGeoZone: build.mutation({
        query: (body) => ({ url: R.admin.shippingZones.create(), method: "POST", body }),
        invalidatesTags: [{ type: "GeoZoneList", id: "ADMIN" }],
      }),

      getGeoZoneById: build.query({
        query: (id) => ({ url: R.admin.shippingZones.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "GeoZone", id }],
      }),

      listGeoZones: build.query({
        query: (params = {}) => ({ url: R.admin.shippingZones.list(), params }),
        transformResponse: shapeList,
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((z) => ({ type: "GeoZone", id: z?._id || z?.id })),
              { type: "GeoZoneList", id: "ADMIN" },
            ]
            : [{ type: "GeoZoneList", id: "ADMIN" }],
      }),

      updateGeoZone: build.mutation({
        query: ({ id, data }) => ({ url: R.admin.shippingZones.update(id), method: "PUT", body: data }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "GeoZone", id }, { type: "GeoZoneList", id: "ADMIN" }],
      }),

      deleteGeoZone: build.mutation({
        query: (id) => ({ url: R.admin.shippingZones.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [{ type: "GeoZone", id }, { type: "GeoZoneList", id: "ADMIN" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useCreateGeoZoneMutation,
  useGetGeoZoneByIdQuery,
  useListGeoZonesQuery,
  useUpdateGeoZoneMutation,
  useDeleteGeoZoneMutation,
} = geoZonesAdminApi;
