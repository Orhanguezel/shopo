import about from "@/api/about";
import About from "@/components/About";
import { cache } from "react";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getAboutData = cache(async () => {
  return await about();
});

// generate seo metadata
export async function generateMetadata() {
  const data = await getAboutData();
  const { seoSetting } = data;
  return {
    title: seoSetting?.seo_title,
    description: seoSetting?.seo_description,
  };
}

// main page
export default async function aboutPage() {
  const data = await getAboutData();

  return <About aboutData={data} />;
}
