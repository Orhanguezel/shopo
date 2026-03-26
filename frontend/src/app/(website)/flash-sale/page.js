import flashSale from "@/api/flash-sale";
import FlashSaleComponent from "@/components/FlashSale";
import { cache } from "react";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getFlashSaleData = cache(async () => {
  return await flashSale();
});

// generate seo metadata
export async function generateMetadata() {
  const data = await getFlashSaleData();
  const { seoSetting } = data;
  return {
    title: seoSetting?.seo_title,
    description: seoSetting?.seo_description,
  };
}

// main page
export default async function FlashSalePage() {
  const data = await getFlashSaleData();

  return <FlashSaleComponent fetchData={data} />;
}
