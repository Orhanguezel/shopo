import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData, shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Wishlist
 *  - GET    {admin.wishlist}              ?user=&session=&limit=
 *  - GET    {admin.wishlist}/:id
 *  - DELETE {admin.wishlist}/:id
 */
export const adminWishlistApi = api
  .enhanceEndpoints({ addTagTypes: ["Wishlist", "WishlistList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listAdminWishlists: build.query({
        query: (params = {}) => ({ url: R.admin.wishlist.list(), params }),
        transformResponse: shapeList, // -> { items, total, meta? }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((w) => ({ type: "Wishlist", id: w?._id || w?.id })),
              { type: "WishlistList", id: "ADMIN" },
            ]
            : [{ type: "WishlistList", id: "ADMIN" }],
      }),

      getAdminWishlistById: build.query({
        query: (id) => ({ url: R.admin.wishlist.get(id) }),
        transformResponse: pickData, // -> doc
        providesTags: (_r, _e, id) => [{ type: "Wishlist", id }],
      }),

      deleteAdminWishlist: build.mutation({
        query: (id) => ({ url: R.admin.wishlist.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Wishlist", id },
          { type: "WishlistList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminWishlistsQuery,
  useGetAdminWishlistByIdQuery,
  useDeleteAdminWishlistMutation,
} = adminWishlistApi;
