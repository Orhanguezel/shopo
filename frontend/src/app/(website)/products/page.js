import products from "@/api/products";
import AllProductPage from "@/components/AllProductPage";
import { cache } from "react";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getProductsData = cache(async (searchType) => {
  return await products(searchType.type, searchType.slug);
});

// generate seo metadata
export async function generateMetadata({ searchParams }) {
  const searchParamsObj = await new Promise((resolve) => {
    resolve(searchParams);
  });
  const searchType = {
    type: searchParamsObj.type,
    slug: searchParamsObj.slug,
  };
  const data = await getProductsData(searchType);
  const { seoSetting } = data;
  return {
    title: seoSetting?.seo_title,
    description: seoSetting?.seo_description,
  };
}

// main page
export default async function Products({ searchParams }) {
  const searchParamsObj = await new Promise((resolve) => {
    resolve(searchParams);
  });

  // Find first key-value pair where value exists, or default to ["allProducts", ""]
  // This handles cases like ?category=shoes or ?brand=nike
  const params = Object.entries(searchParamsObj).find(
    ([key, value]) => value
  ) || ["allProducts", ""];

  // Create searchType object with type (e.g. "category") and slug (e.g. "shoes")
  // Used to determine what products to fetch from API
  const searchType = {
    type: params[0],
    slug: params[1],
  };

  //   call api to get products data
  const data = await getProductsData(searchType);

  return <AllProductPage response={data} />;
}
