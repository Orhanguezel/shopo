"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Banner from "./Banner";
import CategorySection from "./CategorySection";
import appConfig from "@/appConfig";
import ProductCard from "../Helpers/Cards/ProductCard";

const Ads = dynamic(() => import("./Ads"), { ssr: false });
const ViewMoreTitle = dynamic(() => import("../Helpers/ViewMoreTitle"));
const SectionStyleTwo = dynamic(() => import("../Helpers/SectionStyleTwo"));
const BrandSection = dynamic(() => import("./BrandSection"), { ssr: false });
const CampaignCountDown = dynamic(() => import("./CampaignCountDown"), { ssr: false });

export default function Home({ homepageData }) {
  const getsectionTitles = homepageData.section_title;

  const getTurkishSectionTitle = (key, value) => {
    const titleMap = {
      Trending_Category: "Öne Çıkan Kategoriler",
      Shop_by_Brand: "Markalara Göre Alışveriş",
    };
    return titleMap[key] || value;
  };

  let sectionTitles = {};
  if (getsectionTitles && getsectionTitles.length > 0) {
    getsectionTitles.forEach((item) => {
      sectionTitles[item.key] = getTurkishSectionTitle(
        item.key,
        item.custom ? item.custom : item.default
      );
    });
  }

  const homepage = homepageData;

  // Tüm Ürünler — sonsuz scroll (tekrarsız birleştir)
  const allProducts = [
    ...(homepage?.newArrivalProducts || []),
    ...(homepage?.topRatedProducts || []),
    ...(homepage?.bestProducts || []),
    ...(homepage?.popularCategoryProducts || []),
    ...(homepage?.featuredCategoryProducts || []),
  ];
  const uniqueProducts = allProducts.filter(
    (product, index, self) => index === self.findIndex((p) => p.id === product.id)
  );

  const ITEMS_PER_PAGE = 8;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef(null);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= uniqueProducts.length) return prev;
      return prev + ITEMS_PER_PAGE;
    });
  }, [uniqueProducts.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    const currentRef = loaderRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [loadMore]);

  const visibleProducts = uniqueProducts.slice(0, visibleCount);

  const formatProduct = (item) => ({
    id: item.id,
    title: item.name,
    slug: item.slug,
    image: appConfig.BASE_URL + item.thumb_image,
    price: item.price,
    offer_price: item.offer_price,
    campaingn_product: null,
    vendor_id: Number(item.vendor_id),
    review: parseInt(item.averageRating),
    variants: item.active_variants ? item.active_variants : [],
  });

  return (
    <div className="w-full pt-[8px] pb-[80px] space-y-[40px] md:space-y-[60px] bg-[#fdfdfd]">
      <Ads />

      {/* Slider / Banner */}
      <div className="container-x mx-auto">
        {homepage?.sliders?.length > 0 && (
          <Banner
            images={homepage.sliders}
            services={homepage.services}
            sidebarImgOne={
              homepage.sliderBannerOne &&
              parseInt(homepage.sliderBannerOne.status) === 1
                ? homepage.sliderBannerOne
                : null
            }
            sidebarImgTwo={
              homepage.sliderBannerTwo &&
              parseInt(homepage.sliderBannerTwo.status) === 1
                ? homepage.sliderBannerTwo
                : null
            }
            className="banner-wrapper shadow-xl rounded-3xl overflow-hidden"
          />
        )}
      </div>

      {/* 1. Öne Çıkan Kategoriler */}
      <section className="py-10 bg-white/50 backdrop-blur-sm">
        <CategorySection
          categories={homepage?.homepage_categories}
          sectionTitle={sectionTitles && sectionTitles.Trending_Category}
        />
      </section>

      {/* 2. Popüler Ürünler (is_top) */}
      {homepage?.topRatedProducts?.length > 0 && (
        <section>
          <ViewMoreTitle
            className="popular-products-section"
            seeMoreUrl="/products?highlight=top_product"
            categoryTitle="Popüler Ürünler"
          >
            <SectionStyleTwo products={homepage.topRatedProducts.slice(0, 4)} />
          </ViewMoreTitle>
        </section>
      )}

      {/* 3. Yeni Gelenler (new_product) */}
      {homepage?.newArrivalProducts?.length > 0 && (
        <section>
          <ViewMoreTitle
            className="new-arrival-section"
            seeMoreUrl="/products?highlight=new_arrival"
            categoryTitle="Yeni Gelenler"
          >
            <SectionStyleTwo products={homepage.newArrivalProducts.slice(0, 4)} />
          </ViewMoreTitle>
        </section>
      )}

      {/* 4. En Çok Satanlar (is_best) */}
      {homepage?.bestProducts?.length > 0 && (
        <section>
          <ViewMoreTitle
            className="best-selling-section"
            seeMoreUrl="/products?highlight=best_product"
            categoryTitle="En Çok Satanlar"
          >
            <SectionStyleTwo products={homepage.bestProducts.slice(0, 4)} />
          </ViewMoreTitle>
        </section>
      )}

      {/* 5. Öne Çıkan Ürünler (is_featured) */}
      {homepage?.featuredCategoryProducts?.length > 0 && (
        <section>
          <ViewMoreTitle
            className="featured-products-section"
            seeMoreUrl="/products?highlight=featured_product"
            categoryTitle="Öne Çıkan Ürünler"
          >
            <SectionStyleTwo products={homepage.featuredCategoryProducts.slice(0, 4)} />
          </ViewMoreTitle>
        </section>
      )}

      {/* Markalar */}
      <section className="py-16 bg-gray-50/50 border-y border-gray-100">
        <BrandSection
          brands={homepage?.brands?.length > 0 ? homepage.brands : []}
          sectionTitle={sectionTitles && sectionTitles.Shop_by_Brand}
          className="brand-section-wrapper"
        />
      </section>

      {/* Flash Sale */}
      {homepage?.flashSale && (
        <section>
          <CampaignCountDown
            className="md:mb-[60px] mb-[30px]"
            flashSaleData={homepage.flashSale}
            downloadData={homepage?.flashSaleSidebarBanner}
            lastDate={homepage.flashSale?.end_time}
          />
        </section>
      )}

      {/* Tüm Ürünler — sonsuz scroll */}
      {uniqueProducts.length > 0 && (
        <section>
          <div className="container-x mx-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-qblack">
                Tüm Ürünler
              </h2>
            </div>
            <div className="w-full grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
              {visibleProducts.map((item) => (
                <div key={item.id} data-aos="fade-up">
                  <ProductCard datas={formatProduct(item)} />
                </div>
              ))}
            </div>
            {visibleCount < uniqueProducts.length && (
              <div
                ref={loaderRef}
                className="w-full flex justify-center py-10"
              >
                <div className="flex items-center space-x-2 text-qgray">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Yükleniyor...</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
