import getTermsCondition from "@/api/getTermsCondition";
import TermsCondition from "@/components/TermsCondition/index";

export const dynamic = 'force-dynamic';

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Kullanım Koşulları | Seyfibaba",
    description: "Seyfibaba pazaryerinin kullanım koşulları ve şartlarını inceleyin.",
    alternates: {
      canonical: "/terms-condition",
    },
  };
}

// main page
export default async function termsConditionPage() {
  const { terms_conditions } = await getTermsCondition();
  const { terms_and_condition } = terms_conditions;
  return <TermsCondition datas={terms_and_condition} />;
}
