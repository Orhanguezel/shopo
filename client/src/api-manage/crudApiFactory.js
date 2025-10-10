// src/api-manage/crudApiFactory.js

/**
 * RTK Query için CRUD endpoint’leri ekler.
 * names.resource: "Products" ise hook isimleri useAdminListProductsQuery şeklinde oluşur.
 */
export const addCrud = (build, { routes, names, tags }) => {
  const singular = tags?.singular || "Entity";
  const listTag  = tags?.list || `${singular}List`;

  const LIST = `${names.prefix}List${names.resource}`;
  const GET  = `${names.prefix}Get${names.resource}`;
  const CREATE = `${names.prefix}Create${names.resource}`;
  const UPDATE = `${names.prefix}Update${names.resource}`;
  const DELETE = `${names.prefix}Delete${names.resource}`;

  return {
    [LIST]: build.query({
      query: (params = {}) => ({ url: routes.list(), params }),
      providesTags: (res) => res?.items?.length
        ? [{ type: listTag, id: "LIST" }, ...res.items.map(r => ({ type: singular, id: r?.id || r?._id })) ]
        : [{ type: listTag, id: "LIST" }],
      keepUnusedDataFor: 30,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),
    [GET]: build.query({
      query: (id) => ({ url: routes.get(id) }),
      providesTags: (_r,_e,id)=>[{ type: singular, id }],
    }),
    [CREATE]: build.mutation({
      query: (body) => ({ url: routes.create(), method: "POST", body }),
      invalidatesTags: [{ type: listTag, id: "LIST" }],
    }),
    [UPDATE]: build.mutation({
      query: ({ id, body }) => ({ url: routes.update(id), method: "PATCH", body }),
      invalidatesTags: (_r,_e,{id}) => [{ type: singular, id }, { type: listTag, id: "LIST" }],
    }),
    [DELETE]: build.mutation({
      query: (id) => ({ url: routes.remove(id), method: "DELETE" }),
      invalidatesTags: (_r,_e,id) => [{ type: singular, id }, { type: listTag, id: "LIST" }],
    }),
  };
};
