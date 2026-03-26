import getSellerTermsCondition from "@/api/getSellerTermsCondition";
import SellerTermsCondition from "@/components/SellerTermsCondition/index";

export const dynamic = 'force-dynamic'; // Static export için gerekli

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Terms and Conditions",
    description: "Terms and Conditions",
  };
}

// main page
export default async function termsConditionPage() {
  const { seller_tems_conditions } = await getSellerTermsCondition();
  return <SellerTermsCondition datas={seller_tems_conditions || {}} />;
}
