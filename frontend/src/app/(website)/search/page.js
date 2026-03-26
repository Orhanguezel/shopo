import products from "@/api/products";
import AllProductPage from "@/components/AllProductPage";
import { cache } from "react";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getSearchProductsData = cache(
  async (type, slug, searchWithCategorySlug = "") => {
    return await products(type, slug, searchWithCategorySlug);
  }
);

// Helper to determine product search type and arguments
function getProductQueryArgs(searchParamsObj) {
  if (searchParamsObj.search && searchParamsObj.category) {
    return [
      "searchWithCategory",
      null,
      `?search=${searchParamsObj.search}&categories[]=${searchParamsObj.category}`,
    ];
  } else if (searchParamsObj.search) {
    return ["search", searchParamsObj.search];
  } else if (searchParamsObj.category) {
    return ["category", searchParamsObj.category];
  } else {
    return ["allProducts"];
  }
}

// generate seo metadata
export async function generateMetadata({ searchParams }) {
  const searchParamsObj = await new Promise((resolve) => {
    resolve(searchParams);
  });
  const data = await getSearchProductsData(
    ...getProductQueryArgs(searchParamsObj)
  );
  const { seoSetting } = data;
  return {
    title: seoSetting?.seo_title,
    description: seoSetting?.seo_description,
  };
}

// main page
export default async function SearchProductsPage({ searchParams }) {
  const searchParamsObj = await new Promise((resolve) => {
    resolve(searchParams);
  });
  const data = await getSearchProductsData(
    ...getProductQueryArgs(searchParamsObj)
  );
  return <AllProductPage response={data} />;
}
