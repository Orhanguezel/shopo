import { api } from "@/api-manage/MainApi";
import { R, Extra } from "@/api-manage/ApiRoutes";

const withParams = ({ companyId, customerId } = {}) =>
  companyId || customerId ? { companyId, customerId } : undefined;

export const addressApi = api.injectEndpoints({
  endpoints: (build) => ({

    /* LISTS */
    listAddresses: build.query({
      query: ({ companyId, customerId } = {}) => ({
        url: R.public.address.list(),
        params: withParams({ companyId, customerId }),
      }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (result) =>
        result?.length
          ? [...result.map((a) => ({ type: "ADDRESSES", id: a._id })), { type: "ADDRESSES", id: "LIST" }]
          : [{ type: "ADDRESSES", id: "LIST" }],
    }),

    listUserAddresses: build.query({
      query: () => ({ url: Extra.public.address.user() }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (result) =>
        result?.length
          ? [...result.map((a) => ({ type: "ADDRESSES", id: a._id })), { type: "ADDRESSES", id: "LIST_USER" }]
          : [{ type: "ADDRESSES", id: "LIST_USER" }],
    }),

    listCompanyAddresses: build.query({
      query: (companyId) => ({ url: Extra.public.address.byCompany(companyId) }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (result, _err, companyId) =>
        result?.length
          ? [
              ...result.map((a) => ({ type: "ADDRESSES", id: a._id })),
              { type: "ADDRESSES", id: `COMPANY_${companyId}` },
              { type: "ADDRESSES", id: "LIST" },
            ]
          : [{ type: "ADDRESSES", id: `COMPANY_${companyId}` }, { type: "ADDRESSES", id: "LIST" }],
    }),

    /* ONE */
    getAddress: build.query({
      query: (id) => ({ url: R.public.address.get(id) }),
      transformResponse: (res) => res?.data ?? null,
      providesTags: (_r, _e, id) => [{ type: "ADDRESSES", id }],
    }),

    /* CRUD */
    createAddress: build.mutation({
      query: ({ companyId, customerId, ...body }) => ({
        url: R.public.address.create(),
        method: "POST",
        body,
        params: withParams({ companyId, customerId }),
      }),
      transformResponse: (res) => res?.data ?? null,
      invalidatesTags: (result) =>
        [{ type: "ADDRESSES", id: "LIST" }, { type: "ADDRESSES", id: "LIST_USER" }, result && { type: "ADDRESSES", id: result._id }].filter(Boolean),
    }),

    updateAddress: build.mutation({
      query: ({ id, ...body }) => ({ url: R.public.address.get(id), method: "PUT", body }),
      transformResponse: (res) => res?.data ?? null,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ADDRESSES", id },
        { type: "ADDRESSES", id: "LIST" },
        { type: "ADDRESSES", id: "LIST_USER" },
      ],
    }),

    deleteAddress: build.mutation({
      query: (id) => ({ url: R.public.address.get(id), method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "ADDRESSES", id },
        { type: "ADDRESSES", id: "LIST" },
        { type: "ADDRESSES", id: "LIST_USER" },
      ],
    }),

    /* REPLACE-ALL */
    replaceAllAddresses: build.mutation({
      query: ({ addresses, companyId, customerId }) => ({
        url: Extra.public.address.replaceAll(),
        method: "PUT",
        body: { addresses },
        params: withParams({ companyId, customerId }),
      }),
      transformResponse: (res) => res?.data ?? [],
      invalidatesTags: [{ type: "ADDRESSES", id: "LIST" }, { type: "ADDRESSES", id: "LIST_USER" }],
    }),

    replaceAllUserAddresses: build.mutation({
      query: ({ addresses }) => ({
        url: Extra.public.address.replaceAllUser(),
        method: "PUT",
        body: { addresses },
      }),
      transformResponse: (res) => res?.data ?? [],
      invalidatesTags: [{ type: "ADDRESSES", id: "LIST_USER" }, { type: "ADDRESSES", id: "LIST" }],
    }),

    replaceAllCompanyAddresses: build.mutation({
      query: ({ companyId, addresses }) => ({
        url: Extra.public.address.replaceAllCompany(companyId),
        method: "PUT",
        body: { addresses },
      }),
      transformResponse: (res) => res?.data ?? [],
      invalidatesTags: (_r, _e, { companyId }) => [
        { type: "ADDRESSES", id: `COMPANY_${companyId}` },
        { type: "ADDRESSES", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListAddressesQuery,
  useListUserAddressesQuery,
  useListCompanyAddressesQuery,
  useGetAddressQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useReplaceAllAddressesMutation,
  useReplaceAllUserAddressesMutation,
  useReplaceAllCompanyAddressesMutation,
} = addressApi;
