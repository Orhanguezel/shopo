import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

const buildBrandParams = (p = {}) => {
  // Sadece backend’in kabul ettiği alanları gönder + tip güvenliği
  const out = {};
  if (p.q) out.q = p.q;
  if (p.lang) out.lang = p.lang;

  // limit → sayıya çevir + üst sınır (backend limitine göre ayarlayabilirsin)
  const lim = Number(p.limit);
  if (Number.isFinite(lim) && lim > 0) out.limit = Math.min(lim, 100);

  if (p.sort) out.sort = p.sort;

  const pg = Number(p.page);
  if (Number.isFinite(pg) && pg > 0) out.page = pg;

  // view, bilinmeyen vb. alanları bilerek göndermiyoruz (422’yi engeller)
  return out;
};

export const publicBrandsApi = api
  .enhanceEndpoints({ addTagTypes: ["Brand", "BrandList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listPublicBrands: build.query({
        query: (params = {}) => ({
          url: R.public.brands.list(),
          params: buildBrandParams(params),
        }),
        transformResponse: (res) => {
          const items = res?.data ?? (Array.isArray(res) ? res : []) ?? [];
          const total =
            res?.total ??
            res?.meta?.total ??
            (Array.isArray(items) ? items.length : 0);
          return { items, total };
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
                ...result.items.map((b) => ({
                  type: "Brand",
                  id: b?.id || b?._id,
                })),
                { type: "BrandList", id: "PUBLIC" },
              ]
            : [{ type: "BrandList", id: "PUBLIC" }],
      }),

      getPublicBrandBySlug: build.query({
        query: (slug) => ({ url: R.public.brands.get(slug) }),
        transformResponse: pickData,
        providesTags: (result) =>
          result?._id || result?.id
            ? [{ type: "Brand", id: result._id || result.id }]
            : [],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublicBrandsQuery,
  useGetPublicBrandBySlugQuery,
} = publicBrandsApi;
