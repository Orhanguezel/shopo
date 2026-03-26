import faq from "@/api/faq";
import FaqComponent from "@/components/Faq";
import { cache } from "react";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getFaqData = cache(async () => {
  return await faq();
});

// generate seo metadata
export async function generateMetadata() {
  const data = await getFaqData();
  const { seoSetting } = data;
  return {
    title: seoSetting?.seo_title,
    description: seoSetting?.seo_description,
  };
}

// main page
export default async function FaqPage() {
  const data = await getFaqData();
  return <FaqComponent datas={data} />;
}
