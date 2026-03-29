import { cache } from "react";
import home from "@/api/home";
import Home from "@/components/Home";

export const revalidate = 300;

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

import JsonLd, {
  generateOrganizationSchema,
  generateSpeakableSchema,
  generateStoreSchema,
  generateWebSiteSchema,
} from "@/components/Helpers/JsonLd";
import appConfig from "@/appConfig";

// main page
export default async function HomePage() {
  const data = await getHomeData();
  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const storeSchema = generateStoreSchema();
  const speakableSchema = generateSpeakableSchema({
    url: appConfig.APPLICATION_URL,
    cssSelectors: [
      "#home-geo-headline",
      "#home-geo-intro",
      "#home-geo-intro-secondary",
    ],
  });
  const homeSchemaGraph = {
    "@context": "https://schema.org",
    "@graph": [orgSchema, websiteSchema, storeSchema, speakableSchema].filter(Boolean),
  };

  // Preload LCP hero image — must match the exact URL that Next.js <Image> will request
  const firstSliderImage = data?.sliders?.[0]?.image;
  const heroRawUrl = firstSliderImage ? appConfig.BASE_URL + firstSliderImage : null;
  // Next.js Image rewrites to /_next/image?url=...&w=...&q=75 — preload must match that
  const heroPreloadUrl = heroRawUrl
    ? `/_next/image?url=${encodeURIComponent(heroRawUrl)}&w=1920&q=75`
    : null;

  return (
    <>
      {heroPreloadUrl && (
        <link
          rel="preload"
          as="image"
          href={heroPreloadUrl}
          fetchPriority="high"
          type="image/avif"
        />
      )}
      <JsonLd data={homeSchemaGraph} />
      <Home homepageData={data} />
      {/* SSR H1 + intro — slider altında, LCP'yi etkilemez ama crawler'lar görür */}
      <section className="container-x mx-auto mt-4 mb-8">
        <div className="rounded-[32px] border border-[#ece7da] bg-gradient-to-r from-[#fff9ee] via-[#fffdf8] to-[#f4efe3] px-6 py-8 shadow-sm md:px-10">
          <div className="max-w-4xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9f7b2f]">
              Profesyonel ekipman pazaryeri
            </p>
            <h2
              id="home-geo-headline"
              className="text-3xl font-black leading-tight text-[#1f2937] md:text-5xl"
            >
              Berber ve Kuaför Malzemeleri
            </h2>
            <p
              id="home-geo-intro"
              className="max-w-3xl text-base leading-8 text-[#4b5563] md:text-lg"
            >
              Seyfibaba, profesyonel berber ve kuaför salonları için ekipman,
              mobilya, sarf malzeme ve salon teknolojilerini tek noktada bir
              araya getiren bir pazaryeridir. Berber koltuğu, kuaför tezgahı,
              makine ekipmanları, sterilizasyon ürünleri ve günlük salon
              ihtiyaçları için kategorilere göre hızlı şekilde gezebilir,
              markaları karşılaştırabilir ve işletmenize uygun ürünleri güvenle
              inceleyebilirsiniz.
            </p>
            <p
              id="home-geo-intro-secondary"
              className="max-w-3xl text-base leading-8 text-[#4b5563]"
            >
              Platform, salon kurulumuna hazirlanan yeni girisimcilerden mevcut
              isletmesini buyutmek isteyen profesyonellere kadar farkli
              ihtiyaclara hitap eder. Kategori, marka ve satici bazli gezinme
              yapisi sayesinde kuafor tezgahi, yikama seti, berber aynasi,
              sterilizasyon ekipmanlari ve tuketim urunleri ayni akista
              karsilastirilabilir.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
