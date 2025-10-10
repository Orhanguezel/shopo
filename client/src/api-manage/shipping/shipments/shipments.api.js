// src/features/shipping/shipments/shipments.api.js
import { api, shapeList, pickData } from "@/lib/api/baseApi";

/**
 * Paths (backend’ine göre düzenle):
 * - Admin shipments: /shipping/admin/shipments
 * - Admin orders:    /shipping/admin/orders
 * - Public track:    /shipping/public/track/:trackingNo
 */
export const shipmentsApi = api
  .enhanceEndpoints({ addTagTypes: ["Shipment"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* ADMIN — LIST */
      listShipments: build.query({
        // params: { status?, carrier?, q?, page?, limit? ... }
        query: (params = {}) => ({
          url: "/shipping/admin/shipments",
          params,
        }),
        transformResponse: shapeList,
        providesTags: (res) =>
          res?.items?.length
            ? [
                ...res.items.map((s) => ({
                  type: "Shipment",
                  id: s?._id || s?.id,
                })),
                { type: "Shipment", id: "LIST" },
              ]
            : [{ type: "Shipment", id: "LIST" }],
      }),

      /* ADMIN — GET BY ID */
      getShipmentById: build.query({
        query: (id) => ({ url: `/shipping/admin/shipments/${id}` }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "Shipment", id }],
      }),

      /* ADMIN — CREATE (generic) */
      createShipment: build.mutation({
        // body: { order, recipientName, trackingNumber, packages:[...] ... }
        query: (data) => ({
          url: "/shipping/admin/shipments",
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Shipment", id: "LIST" }],
      }),

      /* ADMIN — CREATE (by orderNo) */
      createShipmentForOrderNo: build.mutation({
        // args: { orderNo, data }
        query: ({ orderNo, data }) => ({
          url: `/shipping/admin/orders/${orderNo}/shipments`,
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Shipment", id: "LIST" }],
      }),

      /* ADMIN — MARK LABEL PRINTED */
      markLabelPrinted: build.mutation({
        // args: { id, data: { trackingNumber?, labelUrl } }
        query: ({ id, data }) => ({
          url: `/shipping/admin/shipments/${id}/label`,
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { id }) => [{ type: "Shipment", id }],
      }),

      /* ADMIN — MARK SHIPPED */
      markShipped: build.mutation({
        // args: { id, data?: { trackingNumber?, items? } }
        query: ({ id, data }) => ({
          url: `/shipping/admin/shipments/${id}/mark-shipped`,
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { id }) => [{ type: "Shipment", id }],
      }),

      /* ADMIN — MARK DELIVERED */
      markDelivered: build.mutation({
        query: (id) => ({
          url: `/shipping/admin/shipments/${id}/mark-delivered`,
          method: "POST",
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, id) => [{ type: "Shipment", id }],
      }),

      /* ADMIN — APPEND CUSTOM EVENT */
      appendShipmentEvent: build.mutation({
        // args: { id, data: { code, desc } }
        query: ({ id, data }) => ({
          url: `/shipping/admin/shipments/${id}/events`,
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { id }) => [{ type: "Shipment", id }],
      }),

      /* ADMIN — DELETE */
      deleteShipment: build.mutation({
        query: (id) => ({
          url: `/shipping/admin/shipments/${id}`,
          method: "DELETE",
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, id) => [
          { type: "Shipment", id },
          { type: "Shipment", id: "LIST" },
        ],
      }),

      /* PUBLIC — TRACK BY TRACKING NO */
      trackShipment: build.query({
        query: (trackingNo) => ({
          url: `/shipping/public/track/${trackingNo}`,
        }),
        transformResponse: pickData,
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListShipmentsQuery,
  useGetShipmentByIdQuery,
  useCreateShipmentMutation,
  useCreateShipmentForOrderNoMutation,
  useMarkLabelPrintedMutation,
  useMarkShippedMutation,
  useMarkDeliveredMutation,
  useAppendShipmentEventMutation,
  useDeleteShipmentMutation,
  useTrackShipmentQuery,
} = shipmentsApi;
