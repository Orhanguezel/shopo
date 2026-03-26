import CheakoutPage from "@/components/CheckoutPage";

export const dynamic = 'force-dynamic'; // Static export için gerekli

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Checkout",
    description: "Checkout",
  };
}

// main page
export default async function CheckoutPage() {
  return <CheakoutPage />;
}
