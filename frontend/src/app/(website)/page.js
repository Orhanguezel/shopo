import { cache } from "react";
import home from "@/api/home";
import Home from "@/components/Home";

export const dynamic = 'force-dynamic'; // Static export için gerekli

// api data cache for reducing multiple request to the api
export const getHomeData = cache(async () => {
  return await home();
});

// Static metadata — ensures description lands in <head> for SEO
export const metadata = {
  title: "Berber & Kuaför Malzemeleri – Profesyoneller İçin Alışveriş",
  description: "Berber malzemeleri, kuaför malzemeleri, berber koltuğu, kuaför ekipmanları, salon ekipmanları. Profesyoneller için en uygun fiyatlı alışveriş sitesi.",
  alternates: {
    canonical: "/",
  },
};

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
