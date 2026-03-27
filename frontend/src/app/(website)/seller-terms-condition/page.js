import getSellerTermsCondition from "@/api/getSellerTermsCondition";
import SellerTermsCondition from "@/components/SellerTermsCondition/index";

export const dynamic = 'force-dynamic';

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Satıcı Kullanım Koşulları | Seyfibaba",
    description: "Seyfibaba pazaryerinde satıcılar için geçerli kullanım koşulları ve şartlar.",
    alternates: {
      canonical: "/seller-terms-condition",
    },
  };
}

// main page
export default async function termsConditionPage() {
  const { seller_tems_conditions } = await getSellerTermsCondition();
  return <SellerTermsCondition datas={seller_tems_conditions || {}} />;
}
