"use client";
import SectionStyleFour from "../Helpers/SectionStyleFour";
import SectionStyleOne from "../Helpers/SectionStyleOne";
import SectionStyleThree from "../Helpers/SectionStyleThree";
import SectionStyleTwo from "../Helpers/SectionStyleTwo";
import ViewMoreTitle from "../Helpers/ViewMoreTitle";
import Ads from "./Ads";
import Banner from "./Banner";
import BrandSection from "./BrandSection";
import CampaignCountDown from "./CampaignCountDown";
import TwoColumnAds from "./ProductAds/TwoColumnAds";
import OneColumnAdsOne from "./ProductAds/OneColumnAdsOne";
import OneColumnAdsTwo from "./ProductAds/OneColumnAdsTwo";
import CategorySection from "./CategorySection";
import appConfig from "@/appConfig";

export default function Home({ homepageData }) {
  const getsectionTitles = homepageData.section_title;
  
  const getTurkishSectionTitle = (key, value) => {
    const titleMap = {
      Trending_Category: "Öne Çıkan Kategoriler",
      Popular_Category: "Popüler Kategoriler",
      Shop_by_Brand: "Markalara Göre Alışveriş",
      Top_Rated_Products: "En Çok Beğenilen Ürünler",
      Best_Seller: "En İyi Satıcılar",
      Featured_Products: "Öne Çıkan Ürünler",
      New_Arrivals: "Yeni Gelenler",
      Best_Products: "En İyi Ürünler",
    };
    return titleMap[key] || value;
  };

  // Pre-calculate section titles on server
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
  const isMultivendor = true; // Default to true on server, or fetch from shared config/API if possible

  return (
    <div className="w-full pt-[40px] pb-[80px] space-y-[60px] md:space-y-[100px] bg-[#fdfdfd]">
      <Ads />
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

      <div className="py-10 bg-white/50 backdrop-blur-sm">
        <CategorySection
          categories={homepage?.homepage_categories}
          sectionTitle={sectionTitles && sectionTitles.Trending_Category}
        />
      </div>

      <SectionStyleOne
        products={homepage?.popularCategoryProducts}
        categories={homepage?.popularCategories}
        categoryBackground={
          appConfig.BASE_URL + homepage.popularCategorySidebarBanner
        }
        categoryTitle={sectionTitles && sectionTitles.Popular_Category}
        sectionTitle={sectionTitles && sectionTitles.Popular_Category}
        seeMoreUrl={`/products?highlight=popular_category`}
        className="category-products"
      />

      <div className="py-16 bg-gray-50/50 border-y border-gray-100">
        <BrandSection
          brands={homepage?.brands?.length > 0 ? homepage.brands : []}
          sectionTitle={sectionTitles && sectionTitles.Shop_by_Brand}
          className="brand-section-wrapper"
        />
      </div>

      {homepage?.flashSale && (
        <CampaignCountDown
          className="md:mb-[60px] mb-[30px]"
          flashSaleData={homepage.flashSale}
          downloadData={homepage?.flashSaleSidebarBanner}
          lastDate={homepage.flashSale?.end_time}
        />
      )}

      <ViewMoreTitle
        className="top-selling-product"
        seeMoreUrl={`/products?highlight=top_product`}
        categoryTitle={sectionTitles && sectionTitles.Top_Rated_Products}
      >
        <SectionStyleTwo
          products={
            homepage?.topRatedProducts?.length &&
            homepage?.topRatedProducts?.length > 0
              ? homepage?.topRatedProducts
              : []
          }
        />
      </ViewMoreTitle>

      <TwoColumnAds
        bannerOne={
          homepage?.twoColumnBannerOne &&
          parseInt(homepage?.twoColumnBannerOne?.status) === 1
            ? homepage?.twoColumnBannerOne
            : null
        }
        bannerTwo={
          homepage?.twoColumnBannerTwo &&
          parseInt(homepage?.twoColumnBannerTwo?.status) === 1
            ? homepage?.twoColumnBannerTwo
            : null
        }
      />

      <SectionStyleOne
        categories={
          homepage?.featuredCategories?.length > 0
            ? homepage?.featuredCategories
            : []
        }
        categoryBackground={
          appConfig.BASE_URL + homepage.featuredCategorySidebarBanner
        }
        categoryTitle={sectionTitles && sectionTitles.Featured_Products}
        products={
          homepage?.featuredCategoryProducts?.length > 0
            ? homepage?.featuredCategoryProducts
            : []
        }
        sectionTitle={sectionTitles && sectionTitles.Featured_Products}
        seeMoreUrl={`/products?highlight=featured_product`}
        className="category-products"
      />

      <OneColumnAdsOne
        data={
          homepage?.singleBannerOne &&
          parseInt(homepage?.singleBannerOne?.status) === 1
            ? homepage?.singleBannerOne
            : null
        }
      />

      <SectionStyleThree
        products={
          homepage?.newArrivalProducts?.length > 0
            ? homepage?.newArrivalProducts?.slice(
                0,
                homepage?.newArrivalProducts?.length > 16
                  ? 16
                  : homepage?.newArrivalProducts?.length
              )
            : []
        }
        sectionTitle={sectionTitles && sectionTitles.New_Arrivals}
        seeMoreUrl={`/products?highlight=new_arrival`}
        className="new-products"
      />

      <div className="w-full text-white">
        <div className="container-x mx-auto">
          <OneColumnAdsTwo
            data={
              homepage?.singleBannerTwo &&
              parseInt(homepage?.singleBannerTwo?.status) === 1
                ? homepage?.singleBannerTwo
                : null
            }
          />
        </div>
      </div>

      <div className="pb-20">
        <SectionStyleFour
          products={
            homepage?.bestProducts?.length > 0 ? homepage?.bestProducts : []
          }
          sectionTitle={sectionTitles && sectionTitles.Best_Products}
          seeMoreUrl={`/products?highlight=best_product`}
          className="category-products"
        />
      </div>
    </div>
  );
}
