import { useMemo, useState, useCallback } from "react";
import BreadcrumbCom from "../BreadcrumbCom";
import ProductCardStyleOne from "@/components/Helpers/Cards/ProductCardStyleOne";
import Layout from "@/components/Partials/Layout";
import ProductsFilter from "./ProductsFilter";

/* RTK Query */
import { useGetPublicProductsQuery } from "@/api-manage/api-call-functions/public/publicProduct.api";
import { useGetPublicCategoriesQuery } from "@/api-manage/api-call-functions/public/publicCategories.api";
import { useListPublicBrandsQuery } from "@/api-manage/api-call-functions/public/publicBrands.api";

/* küçük yardımcılar: yerelleştirilmiş başlık seçimi */
function pickLocalized(obj) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  try {
    const lang = (typeof navigator !== "undefined" ? navigator.language : "en").slice(0, 2);
    return obj[lang] || obj.en || obj.tr || Object.values(obj).find(Boolean) || "";
  } catch {
    return "";
  }
}

export default function AllProductPage() {
  /* --------- Filter state (API-odaklı) ---------- */
  const [selectedCategories, setSelectedCategories] = useState([]); // string[] (ids)
  const [price, setPrice] = useState({ min: 10, max: 1000 });
  const [selectedBrands, setSelectedBrands] = useState([]); // string[] (ids)
  const [storage, setStorage] = useState(null); // UI placeholder
  const [sizes, setSizes] = useState({ S: false, M: false, XL: false, XXL: false, Fit: false });

  const toggleCategory = useCallback((id) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const toggleBrand = useCallback((id) => {
    setSelectedBrands((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const toggleSize = useCallback((key) => setSizes((p) => ({ ...p, [key]: !p[key] })), []);

  /* --------- List / sorting / pagination ---------- */
  const [page] = useState(1);
  const limit = 24;
  const [sort, setSort] = useState("createdAt:desc"); // UI “Default” -> backend “createdAt:desc”

  /* --------- Kategori & Marka seçenekleri ---------- */
  const { data: catResp, isFetching: catsLoading } = useGetPublicCategoriesQuery({ page: 1, limit: 200 });
  const categoryItems = Array.isArray(catResp?.items) ? catResp.items : [];
  const categoryOptions = categoryItems.map((c) => ({
    id: c?.id || c?._id,
    name: pickLocalized(c?.name || c?.title),
  }));

  const { data: brandResp, isFetching: brandsLoading } = useListPublicBrandsQuery({ page: 1, limit: 200 });
  const brandItems = Array.isArray(brandResp?.items)
    ? brandResp.items
    : Array.isArray(brandResp?.data)
      ? brandResp.data
      : Array.isArray(brandResp?.brands)
        ? brandResp.brands
        : [];
  const brandOptions = brandItems.map((b) => ({
    id: b?.id || b?._id,
    name: pickLocalized(b?.name || b?.title),
  }));

  /* --------- Ürün listesi için query params ---------- */
  const queryParams = useMemo(() => {
    const qp = {
      page,
      limit,
      sort, // ör: "createdAt:desc" | "price:asc" | "price:desc" ...
      minPrice: price?.min,
      maxPrice: price?.max,
      view: "shopo",
    };

    if (selectedCategories.length === 1) qp.categoryId = selectedCategories[0];
    else if (selectedCategories.length > 1) qp.categoryIds = selectedCategories.join(",");

    if (selectedBrands.length === 1) qp.brandId = selectedBrands[0];
    else if (selectedBrands.length > 1) qp.brandIds = selectedBrands.join(",");

    // not: sizes/storage backend’de hazır olduğunda ekleyebilirsin:
    // if (storage) qp.storage = storage;
    // const activeSizes = Object.entries(sizes).filter(([, v]) => v).map(([k]) => k);
    // if (activeSizes.length) qp.sizes = activeSizes.join(",");

    return qp;
  }, [page, limit, sort, price, selectedCategories, selectedBrands]);

  const { data, isFetching, isError } = useGetPublicProductsQuery(queryParams);
  const products = Array.isArray(data?.items) ? data.items : [];
  const total = data?.meta?.total ?? data?.total ?? products.length;
  const showingFrom = (page - 1) * limit + (products.length ? 1 : 0);
  const showingTo = (page - 1) * limit + products.length;

  /* --------- Filter panel toggle (stil korunur) ---------- */
  const [filterToggle, setToggle] = useState(false);

  return (
    <Layout>
      <div className="products-page-wrapper w-full">
        <div className="container-x mx-auto">
          <BreadcrumbCom />
          <div className="w-full lg:flex lg:space-x-[30px]">
            {/* SOL: FİLTRE */}
            <div className="lg:w-[270px]">
              <ProductsFilter
                className="mb-[30px]"
                filterToggle={filterToggle}
                filterToggleHandler={() => setToggle(!filterToggle)}
                /* dinamik kaynaklar */
                categories={categoryOptions}
                categoriesLoading={catsLoading}
                brands={brandOptions}
                brandsLoading={brandsLoading}
                /* seçimler & handler’lar */
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategory}
                price={price}
                onPriceChange={setPrice}
                selectedBrands={selectedBrands}
                onToggleBrand={toggleBrand}
                storage={storage}
                onStorageChange={setStorage}
                sizes={sizes}
                onToggleSize={toggleSize}
              />

              {/* ads */}
              <div className="w-full hidden lg:block h-[295px]">
                <img
                  src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-5.png`}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* SAĞ: LİSTE */}
            <div className="flex-1">
              <div className="products-sorting w-full bg-white md:h-[70px] flex md:flex-row flex-col md:space-y-0 space-y-5 md:justify-between md:items-center p-[30px] mb-[40px]">
                <div>
                  <p className="font-400 text-[13px]">
                    <span className="text-qgray">Showing</span>{" "}
                    {isFetching ? "…" : `${showingFrom}–${showingTo} of ${total}`} results
                  </p>
                </div>
                <div className="flex space-x-3 items-center">
                  <span className="font-400 text-[13px]">Sort by:</span>
                  <button
                    type="button"
                    onClick={() => setSort((s) => (s === "createdAt:desc" ? "price:asc" : s === "price:asc" ? "price:desc" : "createdAt:desc"))}
                    className="flex space-x-3 items-center border-b border-b-qgray"
                    title="Toggle sort (createdAt → price asc → price desc)"
                  >
                    <span className="font-400 text-[13px] text-qgray">
                      {sort === "createdAt:desc" ? "Default" : sort === "price:asc" ? "Price: Low→High" : "Price: High→Low"}
                    </span>
                    <span>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="#9A9A9A" />
                      </svg>
                    </span>
                  </button>
                </div>
                <button
                  onClick={() => setToggle(!filterToggle)}
                  type="button"
                  className="w-10 lg:hidden h-10 rounded flex justify-center items-center border border-qyellow text-qyellow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>

              <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1  xl:gap-[30px] gap-5 mb-[40px]">
                {isError && <div className="col-span-full text-sm text-qred">Ürünler getirilemedi.</div>}
                {isFetching && !products.length && <div className="col-span-full text-sm text-qgray">Loading…</div>}
                {!isFetching && products.length === 0 && <div className="col-span-full text-sm text-qgray">Ürün bulunamadı.</div>}

                {products.map((p) => (
                  <div data-aos="fade-up" key={p.id || p._id}>
                    <ProductCardStyleOne datas={p} />
                  </div>
                ))}
              </div>

              <div className="w-full h-[164px] overflow-hidden mb-[40px]">
                <img
                  src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-6.png`}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]">
                {products.map((p) => (
                  <div data-aos="fade-up" key={(p.id || p._id) + "-b"}>
                    <ProductCardStyleOne datas={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
