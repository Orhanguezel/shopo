import { cache } from "react";
import home from "@/api/home";
import Home from "@/components/Home";

export const dynamic = 'force-dynamic'; // Static export için gerekli

// api data cache for reducing multiple request to the api
export const getHomeData = cache(async () => {
  return await home();
});

// generate seo metadata
export async function generateMetadata() {
  const data = await getHomeData();
  const { seoSetting } = data;
  return {
    title: seoSetting?.seo_title,
    description: seoSetting?.seo_description,
  };
}

// main page
export default async function HomePage() {
  const data = await getHomeData();
  return <Home homepageData={data} />;
}
