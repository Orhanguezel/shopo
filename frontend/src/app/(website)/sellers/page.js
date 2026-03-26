import getSellers from "@/api/getSellers";
import Sellers from "@/components/Sellers/index";
import { cache } from "react";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getSellersData = cache(async () => {
  return await getSellers();
});

// generate seo metadata
export async function generateMetadata() {
  const { seoSetting } = await getSellersData();
  return {
    title: seoSetting?.seo_title,
    description: seoSetting?.seo_description,
  };
}

// main page
export default async function SellersPage() {
  const { sellers } = await getSellersData();
  return <Sellers sellersData={sellers.data} />;
}
