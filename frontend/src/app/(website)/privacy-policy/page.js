import getPrivacyPolicy from "@/api/getPrivacyPolicy";
import PrivacyPolicy from "@/components/PrivacyPolicy/index";
import { cache } from "react";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getPrivacyPolicyData = cache(async () => {
  return await getPrivacyPolicy();
});

// generate seo metadata
export async function generateMetadata() {
  const { privacyPolicy } = await getPrivacyPolicyData();
  const { seoSetting } = privacyPolicy;
  return {
    title: seoSetting?.seo_title || "Gizlilik Politikası | Seyfibaba",
    description: seoSetting?.seo_description,
    alternates: {
      canonical: "/privacy-policy",
    },
  };
}

// main page
export default async function PrivacyPolicyPage() {
  const { privacyPolicy } = await getPrivacyPolicyData();
  return <PrivacyPolicy datas={privacyPolicy || {}} />;
}
