import getProductDetails from "@/api/getProductDetails";
import SingleProductPage from "@/components/SingleProductPage";
import { cache } from "react";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getProductDetailsData = cache(async (slug) => {
  return await getProductDetails(slug);
});

// generate seo metadata
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const slug = params.slug;
  const data = await getProductDetailsData(slug);
  const { seoSetting } = data;
  return {
    title: seoSetting?.seo_title,
    description: seoSetting?.seo_description,
  };
}

// main page
export default async function SingleProduct({ searchParams }) {
  const params = await searchParams;
  const slug = params.slug;
  const data = await getProductDetailsData(slug);

  return <SingleProductPage details={data} />;
}
