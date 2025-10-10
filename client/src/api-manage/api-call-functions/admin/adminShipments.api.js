// client/api-manage/api-call-functions/admin/shipping-shipments.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList, pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Shipments (Shipping Modülü)
 *  - CREATE : POST {admin.shipping/shipments}
 *  - GET    : GET  {admin.shipping/shipments}/:id
 *  - LABEL  : POST {admin.shipping/shipments}/:id/label
 *  - SHIP   : POST {admin.shipping/shipments}/:id/mark-shipped
 *  - DELIV  : POST {admin.shipping/shipments}/:id/mark-delivered
 *  - EVENT  : POST {admin.shipping/shipments}/:id/events
 *  - LIST   : GET  {admin.shipping/shipments}
 *  - DELETE : DELETE {admin.shipping/shipments}/:id
 *
 * Not: REGISTRY.admin.shipments → "shipping/shipments"
 */
export const shippingAdminShipmentsApi = api
  .enhanceEndpoints({ addTagTypes: ["Shipment", "ShipmentList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      createShippingShipment: build.mutation({
        query: (body) => ({ url: R.admin.shipments.create(), method: "POST", body }),
        invalidatesTags: [{ type: "ShipmentList", id: "ADMIN" }],
      }),

      getShippingShipmentById: build.query({
        query: (id) => ({ url: R.admin.shipments.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "Shipment", id }],
      }),

      markShipmentLabelPrinted: build.mutation({
        // { id, data: { trackingNumber?, labelUrl } }
        query: ({ id, data }) => ({
          url: R.admin.shipments.$.custom(`${id}/label`),
          method: "POST",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Shipment", id }],
      }),

      markShipmentShipped: build.mutation({
        // { id, data?: { trackingNumber? } }
        query: ({ id, data }) => ({
          url: R.admin.shipments.$.custom(`${id}/mark-shipped`),
          method: "POST",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Shipment", id }],
      }),

      markShipmentDelivered: build.mutation({
        query: (id) => ({
          url: R.admin.shipments.$.custom(`${id}/mark-delivered`),
          method: "POST",
        }),
        invalidatesTags: (_r, _e, id) => [{ type: "Shipment", id }],
      }),

      appendShipmentEvent: build.mutation({
        // { id, data: { code, desc } }
        query: ({ id, data }) => ({
          url: R.admin.shipments.$.custom(`${id}/events`),
          method: "POST",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Shipment", id }],
      }),

      listShippingShipments: build.query({
        // params: { status?, q? }
        query: (params = {}) => ({ url: R.admin.shipments.list(), params }),
        transformResponse: shapeList,
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((s) => ({ type: "Shipment", id: s?._id || s?.id })),
              { type: "ShipmentList", id: "ADMIN" },
            ]
            : [{ type: "ShipmentList", id: "ADMIN" }],
      }),

      deleteShippingShipment: build.mutation({
        query: (id) => ({ url: R.admin.shipments.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Shipment", id },
          { type: "ShipmentList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useCreateShippingShipmentMutation,
  useGetShippingShipmentByIdQuery,
  useMarkShipmentLabelPrintedMutation,
  useMarkShipmentShippedMutation,
  useMarkShipmentDeliveredMutation,
  useAppendShipmentEventMutation,
  useListShippingShipmentsQuery,
  useDeleteShippingShipmentMutation,
} = shippingAdminShipmentsApi;

/**
 * ADMIN – Genel Shipments (sipariş bağlamlı)
 *  - LIST   : GET  {shipments/admin}
 *  - CREATE : POST {orders/admin}/:orderNo/shipments
 *  - GET    : GET  {shipments/admin}/:id
 *  - LABEL  : POST {shipments/admin}/:id/label
 *  - SHIP   : POST {shipments/admin}/:id/mark-shipped
 *  - DELIV  : POST {shipments/admin}/:id/mark-delivered
 *  - DELETE : DELETE {shipments/admin}/:id
 *
 * Not: REGISTRY.admin.shipmentsGeneral → "shipments/admin"
 *      REGISTRY.admin.orders           → "orders/admin"
 */
export const shipmentsAdminApi = api
  .enhanceEndpoints({ addTagTypes: ["Shipment", "ShipmentList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listAdminShipments: build.query({
        query: (params = {}) => ({ url: R.admin.shipmentsGeneral.list(), params }),
        transformResponse: shapeList,
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((s) => ({ type: "Shipment", id: s?._id || s?.id })),
              { type: "ShipmentList", id: "ADMIN2" },
            ]
            : [{ type: "ShipmentList", id: "ADMIN2" }],
      }),

      createShipmentForOrderNo: build.mutation({
        // { orderNo, data }
        query: ({ orderNo, data }) => ({
          url: R.admin.orders.$.custom(`${orderNo}/shipments`),
          method: "POST",
          body: data,
        }),
        invalidatesTags: [{ type: "ShipmentList", id: "ADMIN2" }],
      }),

      getAdminShipmentById: build.query({
        query: (id) => ({ url: R.admin.shipmentsGeneral.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "Shipment", id }],
      }),

      markAdminShipmentLabelPrinted: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.shipmentsGeneral.$.custom(`${id}/label`),
          method: "POST",
          body: data, // { labelUrl }
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Shipment", id }],
      }),

      markAdminShipmentShipped: build.mutation({
        // { id, data: { trackingNumber?, items? } }
        query: ({ id, data }) => ({
          url: R.admin.shipmentsGeneral.$.custom(`${id}/mark-shipped`),
          method: "POST",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Shipment", id }],
      }),

      markAdminShipmentDelivered: build.mutation({
        query: (id) => ({
          url: R.admin.shipmentsGeneral.$.custom(`${id}/mark-delivered`),
          method: "POST",
        }),
        invalidatesTags: (_r, _e, id) => [{ type: "Shipment", id }],
      }),

      deleteAdminShipment: build.mutation({
        query: (id) => ({ url: R.admin.shipmentsGeneral.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Shipment", id },
          { type: "ShipmentList", id: "ADMIN2" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminShipmentsQuery,
  useCreateShipmentForOrderNoMutation,
  useGetAdminShipmentByIdQuery,
  useMarkAdminShipmentLabelPrintedMutation,
  useMarkAdminShipmentShippedMutation,
  useMarkAdminShipmentDeliveredMutation,
  useDeleteAdminShipmentMutation,
} = shipmentsAdminApi;

/**
 * PUBLIC – Shipments (genel public track)
 *  - TRACK : GET {shipments/public}/track/:trackingNo
 *
 * Not: REGISTRY.public.shipmentsPublic → "shipments/public"
 */
export const shipmentsPublicApi = api.injectEndpoints({
  endpoints: (build) => ({
    trackPublicShipment: build.query({
      query: (trackingNo) => ({
        url: R.public.shipmentsPublic.$.custom(`track/${trackingNo}`),
      }),
      transformResponse: pickData,
    }),
  }),
  overrideExisting: true,
});

export const { useTrackPublicShipmentQuery } = shipmentsPublicApi;
