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
    title: seoSetting?.seo_title || "Seyfibaba - E-Ticaret Pazaryeri",
    description: seoSetting?.seo_description || "Shopo ile güvenli ve hızlı alışverişin tadını çıkarın. En iyi ürünler ve fırsatlar burada.",
    alternates: {
      canonical: "/",
    },
  };
}

import JsonLd, { generateOrganizationSchema, generateWebSiteSchema } from "@/components/Helpers/JsonLd";
import appConfig from "@/appConfig";

// main page
export default async function HomePage() {
  const data = await getHomeData();
  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  // Preload LCP hero image for faster paint
  const firstSliderImage = data?.sliders?.[0]?.image;
  const heroImageUrl = firstSliderImage ? appConfig.BASE_URL + firstSliderImage : null;

  return (
    <>
      {heroImageUrl && (
        <link rel="preload" as="image" href={heroImageUrl} fetchPriority="high" />
      )}
      <JsonLd data={orgSchema} />
      <JsonLd data={websiteSchema} />
      <Home homepageData={data} />
    </>
  );
}
