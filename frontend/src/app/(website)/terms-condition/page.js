import getTermsCondition from "@/api/getTermsCondition";
import TermsCondition from "@/components/TermsCondition/index";

export const dynamic = 'force-dynamic'; // Static export için gerekli

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Term and Conditions",
    description: "Term and Conditions",
  };
}

// main page
export default async function termsConditionPage() {
  const { terms_conditions } = await getTermsCondition();
  const { terms_and_condition } = terms_conditions;
  return <TermsCondition datas={terms_and_condition} />;
}
