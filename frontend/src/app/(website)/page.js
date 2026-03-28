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
  title: "Berber ve Kuaför Malzemeleri",
  description: "Berber malzemeleri, kuaför ekipmanları, berber koltuğu ve salon mobilyaları. Profesyoneller için en uygun fiyatlı alışveriş sitesi.",
  alternates: {
    canonical: "/",
  },
};

import JsonLd, { generateOrganizationSchema, generateWebSiteSchema, generateStoreSchema } from "@/components/Helpers/JsonLd";
import appConfig from "@/appConfig";

// main page
export default async function HomePage() {
  const data = await getHomeData();
  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const storeSchema = generateStoreSchema();

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
      <JsonLd data={storeSchema} />
      {/* SSR H1 + intro — crawler'lar görebilsin */}
      <section className="container-x mx-auto mt-4">
        <div className="rounded-[32px] border border-[#ece7da] bg-gradient-to-r from-[#fff9ee] via-[#fffdf8] to-[#f4efe3] px-6 py-8 shadow-sm md:px-10">
          <div className="max-w-4xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9f7b2f]">
              Profesyonel ekipman pazaryeri
            </p>
            <h1 className="text-3xl font-black leading-tight text-[#1f2937] md:text-5xl">
              Berber ve Kuaför Malzemeleri
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[#4b5563] md:text-lg">
              Seyfibaba, profesyonel berber ve kuaför salonları için ekipman,
              mobilya, sarf malzeme ve salon teknolojilerini tek noktada bir
              araya getiren bir pazaryeridir. Berber koltuğu, kuaför tezgahı,
              makine ekipmanları, sterilizasyon ürünleri ve günlük salon
              ihtiyaçları için kategorilere göre hızlı şekilde gezebilir,
              markaları karşılaştırabilir ve işletmenize uygun ürünleri güvenle
              inceleyebilirsiniz.
            </p>
          </div>
        </div>
      </section>
      <Home homepageData={data} />
    </>
  );
}
