// src/components/SingleProductPage/index.jsx
import { useRef, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Partials/Layout";
import BreadcrumbCom from "../BreadcrumbCom";
import ProductView from "./ProductView";
import Reviews from "./Reviews";
import SallerInfo from "./SallerInfo";
import DataIteration from "@/components/Helpers/DataIteration";
import ProductCardStyleOne from "@/components/Helpers/Cards/ProductCardStyleOne";

import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useGetSellerProductsQuery,
} from "@/api-manage/api-call-functions/public/publicProduct.api";

import { useGetPublicCategoriesQuery } from "@/api-manage/api-call-functions/public/publicCategories.api";
import { useListPublicBrandsQuery } from "@/api-manage/api-call-functions/public/publicBrands.api";
import { useGetMyWishlistQuery } from "@/api-manage/api-call-functions/public/publicWishlist.api";

import { pickTitle, getProductId, getProductSlug, getSessionId } from "@/utils/product.helpers";

export default function SingleProductPage() {
  const { slug } = useParams();
  const reviewElement = useRef(null);

  const [tab, setTab] = useState("des");
  const [report, setReport] = useState(false);

  // ---- product (slug-only) ----
  const { data: productRaw, isFetching, isError } = useGetProductBySlugQuery(slug, { skip: !slug });

  // ---- categories & brands (lookup) ----
  const { data: catPayload } = useGetPublicCategoriesQuery({ view: "shopo", limit: 1000 });
  const categories = useMemo(() => (catPayload?.items ?? catPayload?.data ?? []), [catPayload]);

  const { data: brandPayload } = useListPublicBrandsQuery({ limit: 1000 });
  const brands = useMemo(() => (brandPayload?.items ?? brandPayload?.data ?? []), [brandPayload]);

  const labelOf = (v) => {
    if (!v) return "—";
    if (typeof v === "string") return v;
    if (typeof v?.name === "string") return v.name;
    if (typeof v?.title === "string") return v.title;
    return "—";
  };

  // ---- product enrichment: category/brand nesnesini yerleştir ----
  const product = useMemo(() => {
    if (!productRaw) return productRaw;

    const categoryId =
      productRaw?.categoryId || productRaw?.category?.id || productRaw?.category?._id;
    const brandId =
      productRaw?.brandId || productRaw?.brand?.id || productRaw?.brand?._id;

    const catObj =
      categories.find(
        (c) =>
          c?._id === categoryId ||
          c?.id === categoryId ||
          c?.slug === productRaw?.category ||
          c?.name === productRaw?.category
      ) || productRaw?.category;

    const brandObj =
      brands.find(
        (b) =>
          b?._id === brandId ||
          b?.id === brandId ||
          b?.slug === productRaw?.brand
      ) || productRaw?.brand;

    return {
      ...productRaw,
      ...(catObj ? { category: catObj } : {}),
      ...(brandObj ? { brand: brandObj } : {}),
    };
  }, [productRaw, categories, brands]);

  const pid = useMemo(() => getProductId(product), [product]);
  const sellerId = product?.seller?._id || product?.seller?.id || product?.sellerId || undefined;

  const canonicalSlug = useMemo(() => getProductSlug(product), [product]);
  const relatedKey = canonicalSlug || slug;

  const { data: related = [], isFetching: loadingRelated } =
    useGetRelatedProductsQuery({ slug: relatedKey }, { skip: !relatedKey });

  const { data: sellerProducts = [], isFetching: loadingSeller } =
    useGetSellerProductsQuery({ sellerId }, { skip: !sellerId });

  const session = getSessionId();
  const { data: myWishlist } = useGetMyWishlistQuery(session, { skip: !session });
  const wishlistCount = useMemo(
    () => (myWishlist?.items ?? myWishlist?.data ?? []).length,
    [myWishlist]
  );

  const title = pickTitle(product);
  const currentSlugForCrumb = canonicalSlug || slug;
  const notFound = !isFetching && isError;

  const catSlug =
    typeof product?.category?.slug === "string"
      ? product?.category?.slug
      : typeof product?.category === "string"
        ? product?.category
        : "";
  const categoryLink = catSlug
    ? `/all-products?category=${encodeURIComponent(catSlug)}`
    : "/all-products";

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="single-product-wrapper w-full">
        {/* Üst alan + breadcrumb */}
        <div className="product-view-main-wrapper bg-white pt-[30px] w-full">
          <div className="breadcrumb-wrapper w-full">
            <div className="container-x mx-auto">
              <BreadcrumbCom
                paths={[
                  { name: "home", path: "/" },
                  { name: "products", path: "/all-products" },
                  ...(catSlug ? [{ name: labelOf(product?.category) || "category", path: categoryLink }] : []),
                  {
                    name: title || (notFound ? "Not found" : "loading…"),
                    path: `/product/${currentSlugForCrumb || ""}`,
                  },
                ]}
              />
              <span className="sr-only">Wishlist count: {wishlistCount}</span>
            </div>
          </div>

          {/* Ürün görünümü */}
          <div className="w-full bg-white pb-[60px]">
            <div className="container-x mx-auto">
              {notFound ? (
                <div className="py-16 text-center text-qgray">Product not found.</div>
              ) : (
                <ProductView
                  loading={isFetching}
                  product={product}
                  reportHandler={() => setReport(!report)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sekmeler */}
        {!notFound && (
          <div className="product-des-wrapper w-full relative pb-[60px]" ref={reviewElement}>
            <div className="tab-buttons w-full mb-10 mt-5 sm:mt-0">
              <div className="container-x mx-auto">
                <ul className="flex space-x-12 ">
                  <li>
                    <span
                      onClick={() => setTab("des")}
                      className={`py-[15px] sm:text-[15px] text-sm sm:block border-b font-medium cursor-pointer ${tab === "des" ? "border-qyellow text-qblack" : "border-transparent text-qgray"
                        }`}
                    >
                      Description
                    </span>
                  </li>
                  <li>
                    <span
                      onClick={() => setTab("review")}
                      className={`py-[15px] sm:text-[15px] text-sm sm:block border-b font-medium cursor-pointer ${tab === "review" ? "border-qyellow text-qblack" : "border-transparent text-qgray"
                        }`}
                    >
                      Comments
                    </span>
                  </li>
                  <li>
                    <span
                      onClick={() => setTab("info")}
                      className={`py-[15px] sm:text-[15px] text-sm sm:block border-b font-medium cursor-pointer ${tab === "info" ? "border-qyellow text-qblack" : "border-transparent text-qgray"
                        }`}
                    >
                      Seller Info
                    </span>
                  </li>
                </ul>
              </div>
              <div className="w-full h-[1px] bg-[#E8E8E8] absolute left-0 sm:top-[50px] top-[36px] -z-10" />
            </div>

            <div className="tab-contents w-full min-h-[300px]">
              <div className="container-x mx-auto">
                {tab === "des" && (
                  <div data-aos="fade-up" className="w-full tab-content-item">
                    <h6 className="text-[18px] font-medium text-qblack mb-2">Description</h6>
                    <p className="text-[15px] text-qgray text-normal whitespace-pre-line">
                      {product?.description || "—"}
                    </p>

                    <div className="mt-4 text-[13px] text-qgray">
                      <p>
                        <span className="text-qblack">Category:</span> {labelOf(product?.category)}
                      </p>
                      <p>
                        <span className="text-qblack">Brand:</span> {labelOf(product?.brand)}
                      </p>
                      {Array.isArray(product?.tags) && product.tags.length > 0 ? (
                        <p>
                          <span className="text-qblack">Tags:</span> {product.tags.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}

                {tab === "review" && (
                  <div data-aos="fade-up" className="w-full tab-content-item">
                    <h6 className="text-[18px] font-medium text-qblack mb-2">Comments</h6>
                    {/* Reviews yalnızca pid hazırsa render ediliyor */}
                    {pid ? (
                      <Reviews productId={pid} />
                    ) : (
                      <div className="bg-white p-6 border border-qgray-border rounded text-[14px] text-qgray">
                        Loading…
                      </div>
                    )}
                  </div>
                )}

                {tab === "info" && (
                  <div data-aos="fade-up" className="w-full tab-content-item">
                    {loadingSeller ? (
                      <div className="py-6 text-qgray">Loading seller…</div>
                    ) : (
                      <SallerInfo products={sellerProducts} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* İlgili ürünler */}
        {!notFound && (
          <div className="related-product w-full bg-white">
            <div className="container-x mx-auto">
              <div className="w-full py-[60px]">
                <div className="flex items-center justify-between mb-[30px]">
                  <h1 className="sm:text-3xl text-xl font-600 text-qblacktext">Related Product</h1>
                  <Link className="text-blue-600 text-sm" to="/all-products">
                    See all
                  </Link>
                </div>

                {loadingRelated ? (
                  <div className="py-8 text-qgray">Loading…</div>
                ) : (
                  <div
                    data-aos="fade-up"
                    className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5"
                  >
                    <DataIteration datas={related} startLength={0} endLength={related.length}>
                      {({ datas }) => (
                        <div key={getProductId(datas) || Math.random()} className="item">
                          <ProductCardStyleOne datas={datas} />
                        </div>
                      )}
                    </DataIteration>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {report && (
        <div className="w-full h-full flex fixed left-0 top-0 justify-center z-50 items-center">
          <div
            onClick={() => setReport(!report)}
            className="w-full h-full fixed left-0 right-0 bg-black  bg-opacity-25"
          />
          <div
            data-aos="fade-up"
            className="sm:w-[548px] sm:h-[509px] w-full h-full bg-white relative py-[40px] px-[38px]"
            style={{ zIndex: 999 }}
          >
            <div className="title-bar flex items-center justify-between mb-3">
              <h6 className="text-2xl font-medium">Report Product</h6>
              <button className="cursor-pointer" onClick={() => setReport(!report)} aria-label="close">
                ✕
              </button>
            </div>
            <button type="button" className="w-full h-[50px] black-btn mt-6">
              Submit Report
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
